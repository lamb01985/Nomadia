"""Handles image uploads to AWS S3 and generates URLs for retrieval."""

from __future__ import annotations
import uuid
from typing import TYPE_CHECKING
import boto3
from botocore.exceptions import ClientError
from config import AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_ENDPOINT_URL


from config import (
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY,
    S3_ENDPOINT_URL,
    BUCKET_NAME,
)

if TYPE_CHECKING:
    from fastapi import UploadFile

# Initialize S3 client
s3 = boto3.client(
    "s3",
    region_name="us-east-2",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    endpoint_url=S3_ENDPOINT_URL,  
)

# Constants
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
]


def validate_image(image: UploadFile) -> bool:
    """
    Validates image type and size.

    Args:
        image (UploadFile): The image file to validate.

    Returns:
        bool: True if image is valid, False otherwise.
    """
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        print(f"❌ Invalid content type: {image.content_type}")
        return False

    current_position = image.file.tell()
    image.file.seek(0, 2)  # Move to end
    size = image.file.tell()
    image.file.seek(current_position)  # Restore position

    if size > MAX_IMAGE_SIZE_BYTES:
        print(f"❌ File too large: {size} bytes")
        return False

    return True


def upload_photo(image: UploadFile) -> str | None:
    """
    Uploads a validated image to S3.

    Args:
        image (UploadFile): The image file.

    Returns:
        str | None: The unique S3 key (filename) if successful, else None.
    """
    if not validate_image(image):
        return None

    photo_key = f"journal/{uuid.uuid4()}_{image.filename}"
    try:
        s3.upload_fileobj(
            image.file,
            BUCKET_NAME,
            photo_key,
            ExtraArgs={"ContentType": image.content_type},
        )
        return photo_key
    except ClientError as e:
        print(f"❌ S3 Upload Failed: {e}")
        return None


def get_url(photo_key: str) -> str:
    """
    Constructs the public URL for a photo key.

    Args:
        photo_key (str): The S3 object key.

    Returns:
        str: Full public URL of the image.
    """
    return f"https://{BUCKET_NAME}.s3.us-east-2.amazonaws.com/{photo_key}"
