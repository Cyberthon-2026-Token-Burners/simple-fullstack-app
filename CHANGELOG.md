# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Pydantic data models for tasks (`Task`, `TaskCreate`, `TaskUpdate`).
- A singleton in-memory `TaskStore` for CRUD operations on tasks, with a capacity limit of 1000 tasks.
- Initial scaffolding for the FastAPI backend application.
- `Dockerfile` for containerizing the backend service.
- Pinned Python dependencies in `backend/requirements.txt`.
- A `GET /health/` endpoint for monitoring service status.