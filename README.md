# PersonaFlow: AI-Powered Research Workflow System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 20+](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org/)


![3715336](https://github.com/user-attachments/assets/e6415263-c624-41e1-92e1-1514d7ce7069)


**PersonaFlow** is an AI-powered research workflow system designed for Human-Computer Interaction (HCI) researchers and academics. It helps researchers generate, refine, and explore research questions through AI-driven personas, automated literature analysis, and iterative critique processes.


**Check out our recent publication:**

> Liu, Y., Sharma, P., Oswal, M., Xia, H., & Huang, Y. (2025, July). PersonaFlow: Designing LLM-Simulated Expert Perspectives for Enhanced Research Ideation. *Proceedings of the 2025 ACM Designing Interactive Systems Conference*, 506-534.

**📖 [Read the paper](https://dl.acm.org/doi/10.1145/3715336.3735789)**


## 🌟 Features

### Core Research Workflow
- **Research Question Generation**: AI-powered generation of research questions from initial ideas
- **Persona-Based Analysis**: Generate AI researcher personas with different domain expertise
- **Literature Discovery**: Automatic literature search and analysis using Semantic Scholar API
- **Iterative Critique**: AI-driven critique and refinement of research ideas
- **Research Outline Generation**: Automated generation of research outlines and hypothetical abstracts

### Interactive Interface
- **Visual Node-Based Editor**: Drag-and-drop interface for building research workflows
- **Real-time Collaboration**: Multi-user research discussion interface
- **Interactive Tutorial**: Guided onboarding for new users
- **Export Capabilities**: Export research outlines to Google Docs

### AI Integration
- Support for multiple LLM providers (OpenAI, local models, custom endpoints)
- Semantic paper search and reranking
- Automated literature review generation
- Research scenario planning

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React)       │◄───┤   (FastAPI)     │◄───┤   APIs          │
│                 │    │                 │    │                 │
│ • Visual Editor │    │ • AI Chains     │    │ • OpenAI API    │
│ • User Auth     │    │ • Literature    │    │ • Semantic      │
│ • Real-time UI  │    │ • Agent System  │    │   Scholar       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Database      │
                       │   (PostgreSQL   │
                       │   + Supabase)   │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 20+**
- **PostgreSQL** (or Supabase account)
- **Redis** (for caching)
- **API Keys**:
  - OpenAI API key (or alternative LLM provider)
  - Semantic Scholar API key
  - Supabase credentials

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/personaflow.git
   cd personaflow
   ```

2. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp backend/.env.example backend/.env.block
   cp backend/rds.env.example backend/rds.env
   
   # Edit the files with your API keys and database credentials
   nano backend/.env.block
   nano backend/rds.env
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8321
   - Redis: localhost:6379

### Option 2: Local Development

1. **Set up Backend**
   ```bash
   cd backend/
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   
   # Set up environment variables
   cp .env.example .env.block
   cp rds.env.example rds.env
   # Edit these files with your credentials
   
   # Run the backend
   python main.py
   ```

2. **Set up Frontend**
   ```bash
   cd frontend/rq-flow/
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

3. **Set up Database**
   - Create a PostgreSQL database
   - Update `backend/rds.env` with your database credentials
   - The application will handle table creation automatically

## ⚙️ Configuration

### Required Environment Variables

#### Backend Configuration (`backend/.env.block`)

```env
# LLM Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_BASE=https://api.openai.com/v1  # Optional: for custom endpoints
OPENAI_API_TYPE=openai  # or 'azure' for Azure OpenAI

# Literature Search
S2_API_KEY=your_semantic_scholar_api_key

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Leave empty if no password

# Security
DECRYPT_KEY=your_32_character_encryption_key

# Optional: Alternative LLM Providers
XINFERENCE_API_URL=http://localhost:9997/v1
XINFERENCE_MODEL_ID=your_model_id
COHERE_API_URL=your_cohere_endpoint
COHERE_API_KEY=your_cohere_api_key
```

#### Database Configuration (`backend/rds.env`)

```env
# PostgreSQL/Supabase Database
RQGEN_DB_HOST=your_database_host
RQGEN_DB_PORT=5432
RQGEN_DB_USER=your_database_user
RQGEN_DB_PASS=your_database_password
RQGEN_DB_NAME=your_database_name
```

### API Key Setup

1. **Semantic Scholar API**: Get your key at https://www.semanticscholar.org/product/api#api-key
2. **OpenAI API**: Register at https://platform.openai.com/
3. **Supabase**: Create a project at https://supabase.com/

## 📖 Usage Guide

### Basic Research Workflow

1. **Start a New Research Project**
   - Click "Add RQ Node" to create a research question node
   - Enter your initial research idea or question

2. **Generate AI Personas**
   - Click "Next" to generate AI researcher personas
   - Each persona represents a different research perspective
   - Customize personas by editing their roles and backgrounds

3. **Discover Literature**
   - Generate literature nodes to find relevant papers
   - The system automatically searches Semantic Scholar
   - Review and filter papers based on relevance

4. **Generate Critiques**
   - Create critique nodes to analyze your research from different angles
   - AI personas provide diverse critical perspectives
   - Use critiques to identify gaps and opportunities

5. **Refine Research Questions**
   - Generate new research question nodes based on critiques
   - Iterate and refine your research focus
   - Build complex research narratives

6. **Create Research Outlines**
   - Generate detailed research outlines
   - Create hypothetical abstracts
   - Export to Google Docs for further development

### Advanced Features

- **Group Discussions**: Use the discussion panel for collaborative research
- **Literature Analysis**: Deep dive into paper relationships and citations
- **Research Scenarios**: Generate multiple research scenarios for comparison
- **Progress Tracking**: Monitor your research development over time

## 🔧 Development

### Project Structure

```
personaflow/
├── backend/                 # FastAPI backend
│   ├── block_app/          # Core application logic
│   ├── autogpt/            # Agent system components
│   ├── db_utils/           # Database utilities
│   ├── routers/            # API route handlers
│   └── requirements.txt    # Python dependencies
├── frontend/rq-flow/       # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/         # Application pages
│   │   └── types/         # TypeScript types
│   └── package.json       # Node.js dependencies
└── docker-compose.yaml    # Docker configuration
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Running Tests

```bash
# Backend tests
cd backend/
python -m pytest

# Frontend tests
cd frontend/rq-flow/
npm test
```

## 📚 API Documentation

Once the backend is running, visit http://localhost:8321/docs for interactive API documentation powered by FastAPI's automatic OpenAPI generation.

### Key API Endpoints

- `POST /api/v1/block/persona_to_lit_query` - Generate literature queries from personas
- `POST /api/v1/block/generate_literature_review` - Generate literature reviews
- `POST /api/v1/block/critique_to_rq` - Generate research questions from critiques
- `POST /api/v1/block/generate_hypothetical_abstract` - Generate research abstracts

## 🛟 Support & Documentation

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join research discussions in GitHub Discussions
- **Documentation**: Additional documentation available in the `/docs` folder

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 📞 Contact

For questions about the research or system implementation, please reach out through GitHub Issues or contact the project maintainers:

**Yiren Liu** - yirenl2@illinois.edu

---

**Note**: This is a research prototype. While functional, it may require additional configuration and maintenance for production use.
