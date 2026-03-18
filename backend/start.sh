#!/bin/bash

# Start the GL Primary Rater Backend

# Navigate to backend directory
cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Ensure database directory exists
mkdir -p /Users/73563/Documents/3-experiment/13-GL_Rater/backend_data/database

# Start the FastAPI backend
echo "Starting GL Primary Rater Backend on http://localhost:8000..."
python main.py