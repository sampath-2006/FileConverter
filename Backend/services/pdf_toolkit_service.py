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


def protect_pdf(input_path, output_path, password):
    """Encrypts a PDF with AES-256 using PyMuPDF."""
    try:
        doc = fitz.open(input_path)
        doc.save(
            output_path, 
            encryption=fitz.PDF_ENCRYPT_AES_256,
            owner_pw=password,
            user_pw=password
        )
        doc.close()
        return True, "PDF protection successful"
    except Exception as e:
        return False, str(e)


def unlock_pdf(input_path, output_path, password):
    """Decrypts a PDF and saves a clean copy."""
    try:
        doc = fitz.open(input_path)
        if doc.needs_pass:
            if not doc.authenticate(password):
                doc.close()
                return False, "Incorrect password."
        # Saving without encryption flags produces a decrypted PDF
        doc.save(output_path)
        doc.close()
        return True, "PDF unlocked successfully"
    except Exception as e:
        return False, str(e)


def redact_pdf(input_path, output_path, words_to_redact, password=None):
    """Searches for exact text matches and applies blackout redactions."""
    try:
        doc = fitz.open(input_path)
        
        if doc.needs_pass:
            if not password:
                doc.close()
                return False, "Password required to process this file."
            if not doc.authenticate(password):
                doc.close()
                return False, "Incorrect password."
                
        word_list = [w.strip() for w in words_to_redact.split(',') if w.strip()]
        
        for page in doc:
            for word in word_list:
                # Search for the word on this page
                rect_list = page.search_for(word)
                for rect in rect_list:
                    # Add a blackout redaction annotation
                    page.add_redact_annot(rect, fill=(0, 0, 0))
            # Apply all redactions on the page permanently
            page.apply_redactions()
            
        doc.save(output_path, deflate=True)
        doc.close()
        return True, "PDF redaction successful"
    except Exception as e:
        return False, str(e)


def sign_pdf(pdf_path, signature_image_path, output_path, password=None):
    """Stamps a signature image on the bottom right of the last page."""
    try:
        doc = fitz.open(pdf_path)
        
        if doc.needs_pass:
            if not password:
                doc.close()
                return False, "Password required to process this PDF."
            if not doc.authenticate(password):
                doc.close()
                return False, "Incorrect password."
                
        # Get the last page
        last_page = doc[-1]
        page_rect = last_page.rect
        
        # Define a rectangle at the bottom right corner for the signature
        # Standard signature size roughly 150x50 pts
        sig_width = 150
        sig_height = 50
        margin = 30
        
        rect = fitz.Rect(
            page_rect.width - sig_width - margin,
            page_rect.height - sig_height - margin,
            page_rect.width - margin,
            page_rect.height - margin
        )
        
        # Insert the image
        last_page.insert_image(rect, filename=signature_image_path)
        
        doc.save(output_path, deflate=True)
        doc.close()
        return True, "PDF signing successful"
    except Exception as e:
        return False, str(e)

