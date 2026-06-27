from fastapi import FastAPI


def create_app() -> FastAPI:
    """Creates and configures the FastAPI application instance."""
    app = FastAPI()

    @app.get("/health/")
    async def health_check() -> dict:
        """Route handler for the health check endpoint."""
        return {"status": "ok"}

    return app


app = create_app()
