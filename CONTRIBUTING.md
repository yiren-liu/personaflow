# Contributing to PersonaFlow

Thank you for your interest in contributing to PersonaFlow! This document provides guidelines and information for contributors.

## 🚀 Quick Start for Contributors

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/personaflow.git
   cd personaflow
   ```

2. **Set up development environment**
   ```bash
   # Backend setup
   cd backend/
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   
   # Frontend setup
   cd ../frontend/rq-flow/
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env.block
   cp backend/rds.env.example backend/rds.env
   # Edit these files with your development credentials
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend/
   python main.py
   
   # Terminal 2: Frontend  
   cd frontend/rq-flow/
   npm run dev
   
   # Terminal 3: Redis (or use Docker)
   docker-compose up redis
   ```

## 🛠️ Development Guidelines

### Code Style

#### Python (Backend)
- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guidelines
- Use type hints where appropriate
- Use meaningful variable and function names
- Add docstrings to functions and classes

```python
def generate_research_question(prompt: str, persona_data: PersonaNodeData) -> List[str]:
    """
    Generate research questions based on a prompt and persona data.
    
    Args:
        prompt: The initial research idea or prompt
        persona_data: AI researcher persona information
        
    Returns:
        List of generated research questions
    """
    # Implementation here
```

#### TypeScript/React (Frontend)
- Use TypeScript for all new code
- Follow React functional component patterns with hooks
- Use meaningful component and variable names
- Add proper type definitions

```typescript
interface ResearchQuestionProps {
  question: string;
  onUpdate: (newQuestion: string) => void;
  isLoading?: boolean;
}

const ResearchQuestionComponent: React.FC<ResearchQuestionProps> = ({
  question,
  onUpdate,
  isLoading = false
}) => {
  // Implementation here
};
```

### Testing

#### Backend Tests
```bash
cd backend/
python -m pytest tests/ -v
```

#### Frontend Tests
```bash
cd frontend/rq-flow/
npm test
```

### Commit Messages

Use conventional commit format:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting, missing semicolons, etc.
- `refactor:` code refactoring
- `test:` adding or modifying tests
- `chore:` maintenance tasks

Example:
```
feat: add literature review generation endpoint

- Implement new API endpoint for generating literature reviews
- Add support for multiple citation formats
- Include tests for new functionality
```

## 🏗️ Architecture Overview

### Backend Structure
```
backend/
├── block_app/          # Core application logic
│   ├── chains/         # AI processing chains
│   ├── models/         # Data models
│   ├── prompts/        # AI prompts and templates
│   └── right_pane/     # Right panel components
├── autogpt/            # Agent system components
├── db_utils/           # Database utilities
└── routers/            # FastAPI route handlers
```

### Frontend Structure
```
frontend/rq-flow/src/
├── components/         # Reusable React components
├── contexts/           # React contexts for state management
├── pages/              # Main application pages
├── types/              # TypeScript type definitions
├── controllers/        # API communication
└── utils/              # Utility functions
```

## 🔧 Development Workflow

### Adding New Features

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement the feature**
   - Add backend API endpoints if needed
   - Update frontend components
   - Add appropriate tests
   - Update documentation

3. **Test your changes**
   ```bash
   # Run backend tests
   cd backend/ && python -m pytest
   
   # Run frontend tests
   cd frontend/rq-flow/ && npm test
   
   # Test the full application
   docker-compose up --build
   ```

4. **Submit a pull request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

### Adding New AI Chains

PersonaFlow uses "chains" for AI processing. To add a new chain:

1. **Create the chain class** in `backend/block_app/chains/`
   ```python
   from langchain.chains.base import Chain
   
   class YourNewChain(Chain):
       def _call(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
           # Implementation here
           pass
   ```

2. **Add API endpoint** in `backend/routers/base.py`
   ```python
   @baseRouter.post("/your_new_endpoint")
   async def your_new_endpoint(request_data: YourRequestModel):
       # Implementation here
       pass
   ```

3. **Update frontend** to call the new endpoint
   ```typescript
   // In controllers/API/index.ts
   const callYourNewEndpoint = async (data: YourDataType) => {
     return apiCall('/api/v1/your_new_endpoint', 'POST', data);
   };
   ```

### Adding New Node Types

PersonaFlow uses different node types in the visual editor:

1. **Create the node component** in `frontend/rq-flow/src/CustomNodes/`
2. **Add the node type** to the nodeTypes mapping
3. **Update the backend** to handle the new node type
4. **Add appropriate prompts** in `backend/block_app/prompts/`

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment details** (OS, Python version, Node.js version)
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Error messages** or logs
- **Screenshots** if applicable

Use the bug report template:

```markdown
**Environment:**
- OS: [e.g., macOS 14.0]
- Python: [e.g., 3.10.8]
- Node.js: [e.g., 20.0.0]

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
[Description]

**Actual Behavior:**
[Description]

**Error Messages:**
```
[Error logs here]
```

**Screenshots:**
[If applicable]
```

## 💡 Feature Requests

For feature requests, please:

1. **Check existing issues** to avoid duplicates
2. **Describe the use case** clearly
3. **Explain the expected behavior**
4. **Consider implementation complexity**
5. **Discuss potential alternatives**

## 🧪 Testing Guidelines

### Writing Tests

#### Backend Tests
- Use pytest for Python tests
- Mock external API calls
- Test both success and error cases
- Include integration tests for API endpoints

#### Frontend Tests
- Use React Testing Library
- Test component behavior, not implementation
- Mock API calls and external dependencies
- Test user interactions and edge cases

### Running Tests Locally

```bash
# Backend tests
cd backend/
python -m pytest tests/ -v --cov=. --cov-report=html

# Frontend tests
cd frontend/rq-flow/
npm test -- --coverage --watchAll=false

# Integration tests
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

## 📚 Documentation

### API Documentation
- FastAPI automatically generates API docs at `/docs`
- Add clear docstrings to all API endpoints
- Include request/response examples

### Code Documentation
- Add docstrings to all functions and classes
- Use clear variable and function names
- Include inline comments for complex logic

### User Documentation
- Update README.md for user-facing changes
- Add tutorials for new features
- Include troubleshooting guides

## 🔒 Security Guidelines

- **Never commit API keys** or sensitive data
- **Use environment variables** for configuration
- **Validate all user inputs** in API endpoints
- **Follow OWASP guidelines** for web security
- **Report security issues** privately to maintainers

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and resources
- Give constructive feedback
- Follow the [Contributor Covenant](https://www.contributor-covenant.org/)

## 📧 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check the README and docs/ folder
- **Code Examples**: Look at existing implementations

## 🎯 Good First Issues

Looking for where to start? Check out issues labeled with:
- `good first issue`: Perfect for newcomers
- `help wanted`: Community contributions welcome
- `documentation`: Improve docs and guides
- `bug`: Fix existing issues

Thank you for contributing to PersonaFlow! 🚀 