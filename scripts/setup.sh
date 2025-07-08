#!/bin/bash

# PersonaFlow Setup Script
# This script automates the setup process for PersonaFlow development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    print_header "Checking System Requirements"
    
    local missing_requirements=()
    
    # Check Python
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
        if [[ $(echo "$PYTHON_VERSION" | cut -d'.' -f1) -ge 3 ]] && [[ $(echo "$PYTHON_VERSION" | cut -d'.' -f2) -ge 10 ]]; then
            print_success "Python $PYTHON_VERSION found"
        else
            print_error "Python 3.10+ required, found $PYTHON_VERSION"
            missing_requirements+=("Python 3.10+")
        fi
    else
        print_error "Python 3 not found"
        missing_requirements+=("Python 3.10+")
    fi
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        if [[ $(echo "$NODE_VERSION" | cut -d'.' -f1) -ge 20 ]]; then
            print_success "Node.js $NODE_VERSION found"
        else
            print_error "Node.js 20+ required, found $NODE_VERSION"
            missing_requirements+=("Node.js 20+")
        fi
    else
        print_error "Node.js not found"
        missing_requirements+=("Node.js 20+")
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION found"
    else
        print_error "npm not found"
        missing_requirements+=("npm")
    fi
    
    # Check Docker (optional)
    if command_exists docker; then
        print_success "Docker found"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker not found (optional for development)"
        DOCKER_AVAILABLE=false
    fi
    
    # Check git
    if command_exists git; then
        print_success "Git found"
    else
        print_error "Git not found"
        missing_requirements+=("Git")
    fi
    
    if [ ${#missing_requirements[@]} -ne 0 ]; then
        print_error "Missing requirements: ${missing_requirements[*]}"
        echo
        print_info "Please install the missing requirements and run this script again."
        exit 1
    fi
}

# Setup environment files
setup_environment() {
    print_header "Setting Up Environment Files"
    
    # Backend environment
    if [ ! -f "backend/.env.block" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env.block
            print_success "Created backend/.env.block from example"
            print_warning "Please edit backend/.env.block with your API keys"
        else
            print_error "backend/.env.example not found"
            exit 1
        fi
    else
        print_info "backend/.env.block already exists"
    fi
    
    # Database environment
    if [ ! -f "backend/rds.env" ]; then
        if [ -f "backend/rds.env.example" ]; then
            cp backend/rds.env.example backend/rds.env
            print_success "Created backend/rds.env from example"
            print_warning "Please edit backend/rds.env with your database credentials"
        else
            print_error "backend/rds.env.example not found"
            exit 1
        fi
    else
        print_info "backend/rds.env already exists"
    fi
}

# Setup Python backend
setup_backend() {
    print_header "Setting Up Python Backend"
    
    cd backend/
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_info "Creating Python virtual environment..."
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_info "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    print_info "Upgrading pip..."
    pip install --upgrade pip
    
    # Install requirements
    print_info "Installing Python dependencies..."
    pip install -r requirements.txt
    print_success "Python dependencies installed"
    
    # Download spaCy model
    print_info "Downloading spaCy language model..."
    python -m spacy download en_core_web_sm
    print_success "spaCy model downloaded"
    
    cd ..
}

# Setup Node.js frontend
setup_frontend() {
    print_header "Setting Up Node.js Frontend"
    
    cd frontend/rq-flow/
    
    # Install dependencies
    print_info "Installing Node.js dependencies..."
    npm install
    print_success "Node.js dependencies installed"
    
    cd ../..
}

# Setup Docker services
setup_docker() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_header "Setting Up Docker Services"
        
        # Check if docker-compose exists
        if command_exists docker-compose; then
            print_info "Starting Redis with Docker..."
            docker-compose up -d redis
            print_success "Redis started"
        elif command_exists docker && docker compose version >/dev/null 2>&1; then
            print_info "Starting Redis with Docker..."
            docker compose up -d redis
            print_success "Redis started"
        else
            print_warning "Docker Compose not found, skipping Docker setup"
        fi
    fi
}

# Generate development secrets
generate_secrets() {
    print_header "Generating Development Secrets"
    
    # Check if DECRYPT_KEY is set in .env.block
    if grep -q "DECRYPT_KEY=your_32_character_encryption_key_here" backend/.env.block 2>/dev/null; then
        print_info "Generating encryption key..."
        
        # Generate a random 32-character hex key
        if command_exists openssl; then
            ENCRYPT_KEY=$(openssl rand -hex 16)
        elif command_exists python3; then
            ENCRYPT_KEY=$(python3 -c "import secrets; print(secrets.token_hex(16))")
        else
            print_warning "Cannot generate encryption key automatically. Please set DECRYPT_KEY manually."
            return
        fi
        
        # Replace the placeholder in .env.block
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/DECRYPT_KEY=your_32_character_encryption_key_here/DECRYPT_KEY=$ENCRYPT_KEY/" backend/.env.block
        else
            # Linux
            sed -i "s/DECRYPT_KEY=your_32_character_encryption_key_here/DECRYPT_KEY=$ENCRYPT_KEY/" backend/.env.block
        fi
        
        print_success "Encryption key generated and set"
    else
        print_info "Encryption key already configured"
    fi
}

# Display next steps
show_next_steps() {
    print_header "Setup Complete!"
    
    echo -e "${GREEN}Your PersonaFlow development environment is ready!${NC}\n"
    
    print_info "Next steps:"
    echo "1. Configure your API keys in backend/.env.block:"
    echo "   - OPENAI_API_KEY (required)"
    echo "   - S2_API_KEY (Semantic Scholar - required)"
    echo "   - SUPABASE_* keys (database - required)"
    echo
    echo "2. Configure your database in backend/rds.env"
    echo
    echo "3. Start the development servers:"
    echo
    echo "   Terminal 1 (Backend):"
    echo "   cd backend/"
    echo "   source venv/bin/activate"
    echo "   python main.py"
    echo
    echo "   Terminal 2 (Frontend):"
    echo "   cd frontend/rq-flow/"
    echo "   npm run dev"
    echo
    echo "4. Access the application at http://localhost:3000"
    echo
    
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_info "Docker alternative:"
        echo "   docker-compose up --build"
        echo
    fi
    
    print_info "Documentation:"
    echo "   - README.md - Full setup guide"
    echo "   - CONTRIBUTING.md - Development guidelines"
    echo "   - http://localhost:8321/docs - API documentation (when backend is running)"
    echo
}

# Main execution
main() {
    print_header "PersonaFlow Development Setup"
    echo "This script will set up your PersonaFlow development environment."
    echo
    
    # Check if we're in the right directory
    if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        print_error "Please run this script from the PersonaFlow root directory"
        exit 1
    fi
    
    check_requirements
    setup_environment
    setup_backend
    setup_frontend
    setup_docker
    generate_secrets
    show_next_steps
}

# Run main function
main "$@" 