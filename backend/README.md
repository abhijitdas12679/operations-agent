# Backend – Operations Agent API

FastAPI + CrewAI + MySQL backend.

## Quick Start

```bash
py -3.11 -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate      # Mac/Linux
pip install -r requirements.txt
cp .env.example .env          # Fill in your values
uvicorn app.main:app --reload
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs
