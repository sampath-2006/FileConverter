import os
import threading
import time

def delete_file_after_delay(filepath, delay=10):
    """
    Deletes a file after a specified delay in seconds.
    This is used to allow Flask's send_file to finish transmitting
    before the file is wiped from the server.
    """
    def _delete():
        time.sleep(delay)
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f"Secure Cleanup: Deleted {filepath}")
        except Exception as e:
            print(f"Error deleting file {filepath}: {e}")

    thread = threading.Thread(target=_delete)
    thread.start()

def cleanup_files(file_paths):
    """Trigger deletion for multiple files."""
    for path in file_paths:
        delete_file_after_delay(path)

def startup_sweep():
    """
    Sweeps the uploads and converted directories on server startup
    to clear out any zombie files left behind after a crash.
    """
    from config import Config
    
    folders_to_sweep = [Config.UPLOAD_FOLDER, Config.CONVERTED_FOLDER]
    count = 0
    
    for folder in folders_to_sweep:
        if os.path.exists(folder):
            for filename in os.listdir(folder):
                filepath = os.path.join(folder, filename)
                try:
                    if os.path.isfile(filepath):
                        os.remove(filepath)
                        count += 1
                except Exception as e:
                    print(f"Failed to delete zombie file {filepath}: {e}")
                    
    print(f"Startup Sweep: Cleared {count} zombie files.")
