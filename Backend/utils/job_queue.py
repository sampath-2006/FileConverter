from concurrent.futures import ThreadPoolExecutor
from utils.db_manager import update_job_status
from services.conversion_service import master_convert
from utils.cleanup import cleanup_files

# A background executor to run jobs without blocking the main Flask thread.
# max_workers=3 ensures we don't overwhelm the server CPU with heavy video conversions.
executor = ThreadPoolExecutor(max_workers=3)

def run_conversion_job(job_id, upload_path, output_path, target_format):
    """
    The background task that actually does the heavy lifting.
    """
    try:
        # Update status to processing
        update_job_status(job_id, 'processing')
        
        # Run the heavy conversion
        success, message, final_output_path = master_convert(upload_path, output_path, target_format)
        
        if success:
            # Mark complete and save the actual final output path (could be a .zip now)
            update_job_status(job_id, 'completed', output_path=final_output_path)
        else:
            # Mark failed
            update_job_status(job_id, 'failed', error_message=message)
            # Cleanup the failed upload immediately
            cleanup_files([upload_path])
            
    except Exception as e:
        update_job_status(job_id, 'failed', error_message=str(e))
        cleanup_files([upload_path])

def run_pdf_job(job_id, operation, input_paths, output_path, **kwargs):
    """
    Background task for PDF toolkit operations.
    operation: 'merge', 'split', 'compress'
    input_paths: list of paths (for merge) or single path string (for others)
    """
    from services.pdf_toolkit_service import merge_pdfs, split_pdf, compress_pdf, protect_pdf, unlock_pdf, redact_pdf, sign_pdf
    
    try:
        update_job_status(job_id, 'processing')
        
        password = kwargs.get('password')
        
        if operation == 'merge':
            success, message = merge_pdfs(input_paths, output_path, password=password)
            cleanup_list = input_paths
        elif operation == 'split':
            success, message = split_pdf(input_paths, output_path, kwargs.get('start_page'), kwargs.get('end_page'), password=password)
            cleanup_list = [input_paths]
        elif operation == 'compress':
            success, message = compress_pdf(input_paths, output_path, password=password)
            cleanup_list = [input_paths]
        elif operation == 'protect':
            success, message = protect_pdf(input_paths, output_path, password)
            cleanup_list = [input_paths]
        elif operation == 'unlock':
            success, message = unlock_pdf(input_paths, output_path, password)
            cleanup_list = [input_paths]
        elif operation == 'redact':
            success, message = redact_pdf(input_paths, output_path, kwargs.get('words'), password=password)
            cleanup_list = [input_paths]
        elif operation == 'sign':
            # input_paths should be [pdf_path, image_path] for sign
            success, message = sign_pdf(input_paths[0], input_paths[1], output_path, password=password)
            cleanup_list = input_paths
        else:
            success, message = False, "Unknown PDF operation"
            cleanup_list = input_paths if isinstance(input_paths, list) else [input_paths]
            
        if success:
            update_job_status(job_id, 'completed', output_path=output_path)
        else:
            update_job_status(job_id, 'failed', error_message=message)
            cleanup_files(cleanup_list)
            
    except Exception as e:
        update_job_status(job_id, 'failed', error_message=str(e))
        # Ensure cleanup is attempted on failure
        cleanup_list = input_paths if isinstance(input_paths, list) else [input_paths]
        cleanup_files(cleanup_list)

def enqueue_job(job_id, upload_path, output_path, target_format):
    """Submit a generic conversion job to the background executor."""
    executor.submit(run_conversion_job, job_id, upload_path, output_path, target_format)

def enqueue_pdf_job(job_id, operation, input_paths, output_path, **kwargs):
    """Submit a PDF toolkit job to the background executor."""
    executor.submit(run_pdf_job, job_id, operation, input_paths, output_path, **kwargs)

def run_ai_job(job_id, operation, input_path, output_path):
    """Background task for Groq AI processing."""
    from services.ai_service import process_with_langchain
    
    try:
        update_job_status(job_id, 'processing')
        
        if operation == 'summarize':
            instruction = "Summarize the following document clearly and concisely, focusing on the most important takeaways."
            success, message = process_with_langchain(input_path, output_path, instruction)
        elif operation == 'extract':
            instruction = "Extract all key data points, names, dates, organizations, and figures from the following document into a clean markdown format."
            success, message = process_with_langchain(input_path, output_path, instruction)
        else:
            success, message = False, "Unknown AI operation"
            
        if success:
            update_job_status(job_id, 'completed', output_path=output_path)
        else:
            update_job_status(job_id, 'failed', error_message=message)
            cleanup_files([input_path])
            
    except Exception as e:
        update_job_status(job_id, 'failed', error_message=str(e))
        cleanup_files([input_path])

def enqueue_ai_job(job_id, operation, input_path, output_path):
    """Submit an AI job to the background executor."""
    executor.submit(run_ai_job, job_id, operation, input_path, output_path)
