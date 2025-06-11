"""Configuration module for environment variables."""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
# This should be imported before any other module that needs environment
# variables
load_dotenv()

# Database configuration
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/nomadia",
)

# S3 configuration
AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
S3_PUBLIC_URL = os.environ.get("S3_PUBLIC_URL", "http://localhost:9000")
S3_ENDPOINT_URL = "https://s3.us-east-2.amazonaws.com"
BUCKET_NAME = os.environ.get("AWS_BUCKET_NAME", "nomadia-data")

# Check that we have the required AWS credentials
if AWS_ACCESS_KEY is None or AWS_SECRET_KEY is None:
    msg = "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be defined in .env file."
    raise ValueError(msg)

# CORS configuration
# Format for CORS_ORIGINS should be comma-separated values
# e.g. "http://localhost:5173,https://example.com"
# Default allows the Vite development server
cors_origins_value = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
CORS_ORIGINS = cors_origins_value.split(",")
