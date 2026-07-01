import os
from pdf2docx import Converter
import zipfile

def convert_document(input_path, output_path, target_format):
    """
    Converts document formats.
    Returns: (success_boolean, status_message, final_output_path)
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
                return True, "PDF to DOCX successful", output_path
                
            elif target_format in ['png', 'jpg', 'jpeg']:
                # PDF to Image (returns ZIP if multi-page)
                import fitz
                doc = fitz.open(input_path)
                
                if len(doc) == 1:
                    # Single page, save as a single image
                    page = doc.load_page(0)
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    pix.save(output_path)
                    doc.close()
                    return True, f"PDF to {target_format.upper()} successful", output_path
                else:
                    # Multi-page, zip it up
                    zip_path = output_path.rsplit('.', 1)[0] + '.zip'
                    
                    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                        for i in range(len(doc)):
                            page = doc.load_page(i)
                            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                            # Save temp file
                            temp_img_path = f"{output_path.rsplit('.', 1)[0]}_page_{i+1}.{target_format}"
                            pix.save(temp_img_path)
                            
                            # Add to zip
                            zipf.write(temp_img_path, f"page_{i+1}.{target_format}")
                            
                            # Delete temp file
                            os.remove(temp_img_path)
                            
                    doc.close()
                    return True, f"PDF to {target_format.upper()} ZIP successful", zip_path
                    
            else:
                return False, f"Unsupported target format for PDF: {target_format}", output_path
                
        else:
            return False, f"Document conversion for {ext} not fully implemented yet.", output_path
            
    except Exception as e:
        return False, str(e), output_path
