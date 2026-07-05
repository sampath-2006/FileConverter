# FileForge (File Converter)

FileForge is a premium, full-stack web application designed for comprehensive file conversion, PDF manipulation, and AI-powered document analysis. 

> **✅ Status: MVP Complete & Stable**
> The core architecture is fully built, thoroughly tested with 100% backend core test coverage, and ready for live production deployment.

## Architecture
- **Frontend:** Next.js (App Router), React, Vanilla CSS (Glassmorphism, Light/Dark Theme toggle)
- **Backend:** Python, Flask, threading for async jobs, SQLite database for user management
- **AI Integration:** LangChain powered by Groq's LLM (Llama 3) for lightning-fast data extraction and summarization
- **Deployment:** Vercel (Frontend) and Render/Heroku (Backend) targeted

## Features
- **Universal File Conversion:** Converts between 30+ formats across Images, Videos, Audio, and Documents.
- **PDF Toolkit:** Merge, split, compress, protect, unlock, and sign PDFs securely.
- **AI Analysis:** Summarize documents and extract structured data using AI, with results rendered inline on the frontend.
- **SEO Landing Pages:** 43+ dynamically generated landing pages for maximum search engine visibility.
- **Developer API, Docs, & Dashboard:** Full user authentication system where users can generate API keys. Dedicated `/api-docs` for seamless third-party integration.
- **Async Job Queue:** Background processing for heavy files with real-time frontend polling and SQLite concurrency management.
- **Modern UI/UX:** Responsive Mega-Menu navigation, "Fat Footer", and real-time Light/Dark mode toggling.

## Getting Started

### 1. Start the Backend (Flask)
```bash
cd Backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Ensure you have a .env file with GROQ_API_KEY
python app.py
```
*(Runs on `http://127.0.0.1:5000`)*

### 2. Start the Frontend (Next.js)
```bash
cd Frontend
npm install
npm run dev
```
*(Runs on `http://localhost:3000`)*

## Testing
We have built a comprehensive `pytest` suite covering 100% of the backend file conversion logic.
```bash
cd Backend
pytest --cov=services --cov=routes --cov=utils --cov-report=term-missing
```