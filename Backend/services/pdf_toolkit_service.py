import os
from PyPDF2 import PdfReader, PdfWriter, PdfMerger
import fitz  # PyMuPDF

def merge_pdfs(input_paths, output_path, password=None):
    """
    Merges multiple PDFs into a single PDF.
    input_paths is a list of absolute file paths.
    """
    try:
        merger = PdfMerger()
        for path in input_paths:
            reader = PdfReader(path)
            if reader.is_encrypted:
                if not password:
                    return False, f"Password required to process file: {os.path.basename(path)}"
                if not reader.decrypt(password):
                    return False, f"Incorrect password for file: {os.path.basename(path)}"
            merger.append(reader)
        
        merger.write(output_path)
        merger.close()
        return True, "PDF merge successful"
    except Exception as e:
        return False, str(e)


def split_pdf(input_path, output_path, start_page, end_page, password=None):
    """
    Extracts a range of pages from a PDF.
    Pages are 1-indexed.
    """
    try:
        reader = PdfReader(input_path)
        if reader.is_encrypted:
            if not password:
                return False, "Password required to process this file."
            if not reader.decrypt(password):
                return False, "Incorrect password."
                
        writer = PdfWriter()
        
        # Validate ranges
        total_pages = len(reader.pages)
        if start_page < 1 or end_page > total_pages or start_page > end_page:
            return False, f"Invalid page range. Document has {total_pages} pages."
            
        # PyPDF2 pages are 0-indexed
        for i in range(start_page - 1, end_page):
            writer.add_page(reader.pages[i])
            
        with open(output_path, "wb") as f_out:
            writer.write(f_out)
            
        return True, "PDF split successful"
    except Exception as e:
        return False, str(e)


def compress_pdf(input_path, output_path, password=None):
    """
    Applies highly advanced compression to a PDF using PyMuPDF (fitz).
    Removes duplicate images, unused fonts, and deflates structure.
    """
    try:
        doc = fitz.open(input_path)
        
        # PyMuPDF doesn't allow saving over encrypted without decrypting
        if doc.needs_pass:
            if not password:
                doc.close()
                return False, "Password required to process this file."
            if not doc.authenticate(password):
                doc.close()
                return False, "Incorrect password."
                
        # garbage=4: removes unused objects, duplicate images, and deflates streams.
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
            
        return True, "PDF compression successful"
    except Exception as e:
        return False, str(e)
