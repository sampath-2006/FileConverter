# FileForge (File Converter)

FileForge is a premium, full-stack web application designed for comprehensive file conversion, PDF manipulation, and AI-powered document analysis.

> **⚠️ Status: In Development & Needs Debugging**
> The core architecture is built, but the application is currently in an active debugging phase. Some conversions and edge cases may require further testing, error handling, and refinement before the platform is completely production-ready.

## Architecture
- **Frontend:** Next.js 15 (App Router), React, Vanilla CSS (Dark-mode Glassmorphism)
- **Backend:** Python, Flask, threading for async jobs
- **AI Integration:** Llama 3.1 via Groq and LangChain

## Features Built So Far
- **Universal File Conversion:** Converts between 30+ formats across Images, Videos, Audio, and Documents.
- **PDF Toolkit:** Merge, split, and compress PDFs with password support (Powered by PyMuPDF).
- **AI Analysis:** Summarize documents and extract structured data using AI.
- **SEO Landing Pages:** 43+ dynamically generated landing pages (e.g., `/convert/pdf-to-jpg`) for maximum search engine visibility.
- **Async Job Queue:** Background processing for heavy files with real-time frontend polling.

## Getting Started

### 1. Start the Backend (Flask)
```bash
cd Backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
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

## Future Work / Known Issues to Debug
- **Thorough Testing:** End-to-end testing of all 43 conversion pairs is needed to catch edge cases (e.g., corrupted files, rare encodings).
- **Module 1d (API Keys):** Implementation of the API Key issuing system for B2B developer access is currently paused and needs to be built.
- **Cleanup Optimization:** Ensure zombie processes and temp files are reliably swept if the server crashes unexpectedly.