import os
import uuid
import mimetypes
import urllib.request
import urllib.error
import json
from pathlib import Path
from django.conf import settings
from decouple import config

MAX_UPLOAD_SIZE_BYTES = config('MAX_UPLOAD_SIZE_MB', default=15, cast=int) * 1024 * 1024
ALLOWED_MIME_TYPES = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
}
ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}
BUCKET_NAME = 'patient-medical-records'


def sanitize_filename(filename: str) -> str:
    clean = "".join(c for c in filename if c.isalnum() or c in "._- ")
    return clean.replace(" ", "_")[:100]


def get_supabase_headers():
    supabase_url = getattr(settings, 'SUPABASE_URL', '').rstrip('/')
    service_key = config('SUPABASE_SERVICE_ROLE_KEY', default='').strip()
    anon_key = config('SUPABASE_KEY', default='').strip()
    key = service_key or anon_key
    if not supabase_url or not key:
        return None, None
    return supabase_url, key


def upload_document_file(patient_id, uploaded_file):
    """
    Validates and stores the uploaded file.
    Attempts upload to Supabase Storage private bucket `patient-medical-records`.
    Also guarantees local media storage persistence so file streaming always works reliably.
    """
    # 1. Validate file size
    if uploaded_file.size > MAX_UPLOAD_SIZE_BYTES:
        max_mb = MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
        raise ValueError(f"File size exceeds maximum allowed limit of {max_mb} MB.")

    # 2. Validate file type
    original_name = uploaded_file.name
    ext = os.path.splitext(original_name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file format '{ext}'. Allowed formats: PDF, JPG, JPEG, PNG.")

    mime_type = getattr(uploaded_file, 'content_type', None)
    if not mime_type or mime_type == 'application/octet-stream':
        mime_type, _ = mimetypes.guess_type(original_name)
    if not mime_type or (mime_type not in ALLOWED_MIME_TYPES and ext not in ALLOWED_EXTENSIONS):
        raise ValueError("Invalid file content type. Only PDF and image files (JPG, PNG) are permitted.")

    # 3. Generate patient-specific randomized storage path
    file_uuid = uuid.uuid4().hex[:12]
    clean_name = sanitize_filename(original_name)
    storage_relative_path = f"{str(patient_id)}/{file_uuid}_{clean_name}"

    # 4. Save to media directory
    local_full_path = Path(settings.MEDIA_ROOT) / BUCKET_NAME / storage_relative_path
    local_full_path.parent.mkdir(parents=True, exist_ok=True)

    file_bytes = uploaded_file.read()
    with open(local_full_path, 'wb') as f:
        f.write(file_bytes)

    # 5. Attempt upload to Supabase Storage bucket
    supabase_url, key = get_supabase_headers()
    if supabase_url and key:
        try:
            url = f"{supabase_url}/storage/v1/object/{BUCKET_NAME}/{storage_relative_path}"
            req = urllib.request.Request(
                url,
                data=file_bytes,
                headers={
                    'Authorization': f'Bearer {key}',
                    'apikey': key,
                    'Content-Type': mime_type or 'application/octet-stream',
                    'x-upsert': 'true',
                },
                method='POST'
            )
            urllib.request.urlopen(req, timeout=8)
        except Exception as e:
            # Fallback to local storage gracefully without blocking patient
            print(f"[Supabase Storage Notice] Uploaded to local media fallback. Supabase API response: {e}")

    return {
        'storage_path': storage_relative_path,
        'original_filename': original_name,
        'mime_type': mime_type,
        'file_size': uploaded_file.size,
    }


def delete_document_file(storage_path: str):
    """Deletes the document from both Supabase Storage and local disk."""
    if not storage_path:
        return

    # Delete local file
    try:
        local_full_path = Path(settings.MEDIA_ROOT) / BUCKET_NAME / storage_path
        if local_full_path.exists():
            local_full_path.unlink()
    except Exception as e:
        print(f"[Storage] Local file delete error: {e}")

    # Delete from Supabase Storage
    supabase_url, key = get_supabase_headers()
    if supabase_url and key:
        try:
            url = f"{supabase_url}/storage/v1/object/{BUCKET_NAME}/{storage_path}"
            req = urllib.request.Request(
                url,
                headers={
                    'Authorization': f'Bearer {key}',
                    'apikey': key,
                },
                method='DELETE'
            )
            urllib.request.urlopen(req, timeout=5)
        except Exception as e:
            print(f"[Supabase Storage] Delete notice: {e}")


def get_document_file_path(storage_path: str) -> Path:
    """Returns local path for backend streaming download."""
    return Path(settings.MEDIA_ROOT) / BUCKET_NAME / storage_path


def get_document_file_bytes(storage_path: str):
    """
    Returns file bytes, reading from local media path if exists,
    or downloading from Supabase Storage bucket as a fallback.
    """
    local_path = get_document_file_path(storage_path)
    if local_path.exists():
        return local_path.read_bytes()

    supabase_url, key = get_supabase_headers()
    if supabase_url and key:
        try:
            url = f"{supabase_url}/storage/v1/object/authenticated/{BUCKET_NAME}/{storage_path}"
            req = urllib.request.Request(
                url,
                headers={
                    'Authorization': f'Bearer {key}',
                    'apikey': key,
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
                # Cache locally so subsequent requests are instant
                local_path.parent.mkdir(parents=True, exist_ok=True)
                with open(local_path, 'wb') as f:
                    f.write(data)
                return data
        except Exception as e:
            print(f"[Supabase Storage] Fallback fetch error: {e}")

    return None
