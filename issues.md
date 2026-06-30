# Known Issues & Technical Limitations

This document tracks known architectural limitations and issues across the platform to be resolved in future versions.

## Module 1b: PDF Toolkit
- **True Compression:** The current compression logic uses `PyMuPDF` to aggressively deflate files and remove unused fonts/images. However, it does not actively downscale image DPI (e.g., converting 300dpi images to 72dpi). To achieve extreme "Smallpdf" level compression, a system-level tool like **Ghostscript** must be installed on the server and integrated into `services/pdf_toolkit_service.py`.

## Module 1c: AI Features
- **Text-Only AI Limitation:** Because we are using the **Groq API** (Llama 3.1) instead of Google Gemini to save costs and avoid credit card requirements, the AI cannot natively "watch" videos or "listen" to audio. The current architecture requires extracting raw text from PDFs/Word documents first, and then sending that text to Groq. AI features for Audio and Video are currently disabled.

## Module 1d: Developer API (Pending)
- **API Issuing Technology:** The user wants to build a full API Key issuing platform (similar to how OpenAI, Groq, or Gemini issue keys to developers). This will allow the SaaS to act as an API Provider for other businesses. This implementation has been paused for now and will be built at a later stage.
