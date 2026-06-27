# Use the official Python image.
FROM python:3.12-slim

# Set environment variables to prevent Python from writing pyc files to disc and buffering stdout
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the dependency file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ./app ./app

# Expose the port the app runs on. Uvicorn will default to 8080.
# This will be overridden by the PORT env var in Cloud Run.
EXPOSE 8080

# Command to run the application.
# Uvicorn will respect the PORT environment variable if set, otherwise it will use the port from the --port flag.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
