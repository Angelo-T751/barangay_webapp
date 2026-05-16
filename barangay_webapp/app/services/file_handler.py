import os
import time
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png', 'heic'}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

def allowed_file(filename):
    """Checks if the file has an approved extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file_size(file):
    """Checks if the file exceeds the maximum allowed size."""
    file.seek(0, 2)  # Move cursor to the end
    size = file.tell()
    file.seek(0)  # Reset cursor
    return size <= MAX_FILE_SIZE

def save_proof_document(file, user_uuid):
    """Securely names and saves an uploaded document to the server."""
    if not file or file.filename == '':
        return None, "Please upload the required document."
        
    if not allowed_file(file.filename):
        return None, "Invalid file type. Only PDF, JPG, PNG, and HEIC are allowed."
        
    if not validate_file_size(file):
        return None, "File size exceeds the 25MB limit."

    # Generate a safe, unique name to prevent overwriting
    filename = secure_filename(file.filename)
    unique_filename = f"{user_uuid}_{int(time.time())}_{filename}"
    
    # Define the path and save
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'proofs')
    os.makedirs(upload_folder, exist_ok=True)
    
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)
    
    # Return the saved filename so it can be stored in the database
    return unique_filename, None