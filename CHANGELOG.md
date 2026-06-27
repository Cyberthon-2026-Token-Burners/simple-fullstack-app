# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Implemented a frontend API service (`taskService.js`) using Axios to handle all communication with the backend.
- Scaffolded the React frontend application using Vite, including a development server proxy and a multi-stage Dockerfile for production builds with Nginx.
- Implemented full CRUD API endpoints for tasks: `GET /tasks/`, `POST /tasks/`, `PATCH /tasks/{task_id}`, and `DELETE /tasks/{task_id}`.
- Pydantic data models for tasks (`Task`, `TaskCreate`, `TaskUpdate`).
- A singleton in-memory `TaskStore` for CRUD operations on tasks, with a capacity limit of 1000 tasks.
- Initial scaffolding for the FastAPI backend application.
- `Dockerfile` for containerizing the backend service.
- Pinned Python dependencies in `backend/requirements.txt`.
- A `GET /health/` endpoint for monitoring service status.
