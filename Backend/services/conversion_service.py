import os
from PIL import Image

# Import specific services
from services.video_audio_service import convert_media
from services.document_service import convert_document

def convert_image(input_path, output_path, target_format):
    try:
        with Image.open(input_path) as img:
            if target_format.upper() in ['JPG', 'JPEG'] and img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            save_format = 'JPEG' if target_format.upper() == 'JPG' else target_format.upper()
            img.save(output_path, format=save_format)
            return True, "Conversion successful", output_path
    except Exception as e:
        return False, str(e), output_path

def master_convert(input_path, output_path, target_format):
    """
    Traffic controller: Routes the file to the correct conversion engine based on extension.
    """
    ext = input_path.rsplit('.', 1)[1].lower()
    
    image_formats = ['png', 'jpg', 'jpeg', 'webp', 'heic', 'svg']
    video_audio_formats = ['mp4', 'avi', 'mov', 'gif', 'mp3', 'wav', 'aac', 'flac']
    document_formats = ['pdf', 'docx', 'pptx', 'xlsx', 'txt']
    
    if ext in image_formats:
        return convert_image(input_path, output_path, target_format)
    elif ext in video_audio_formats:
        return convert_media(input_path, output_path, target_format)
    elif ext in document_formats:
        return convert_document(input_path, output_path, target_format)
    else:
        return False, f"Unsupported file category for extension: {ext}"
