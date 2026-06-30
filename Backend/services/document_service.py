import os
from pdf2docx import Converter

def convert_document(input_path, output_path, target_format):
    """
    Converts document formats.
    Supported for now: PDF -> DOCX, PDF -> PNG/JPG
    """
    target_format = target_format.lower()
    ext = input_path.rsplit('.', 1)[1].lower()
    
    try:
        if ext == 'pdf':
            if target_format == 'docx':
                # PDF to Word
                cv = Converter(input_path)
                cv.convert(output_path, start=0, end=None)
                cv.close()
                return True, "PDF to DOCX successful"
                
            elif target_format in ['png', 'jpg', 'jpeg']:
                # PDF to Image (first page only for simplicity)
                import fitz
                doc = fitz.open(input_path)
                page = doc.load_page(0)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom for better resolution
                
                # PyMuPDF infers format from the output_path extension
                pix.save(output_path)
                doc.close()
                return True, f"PDF to {target_format.upper()} successful"
            else:
                return False, f"Unsupported target format for PDF: {target_format}"
                
        else:
            return False, f"Document conversion for {ext} not fully implemented yet."
            
    except Exception as e:
        return False, str(e)
