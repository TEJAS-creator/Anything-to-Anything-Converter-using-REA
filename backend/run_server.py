"""
Entrypoint to run the Local Conversion Microservice with Uvicorn.
"""

import uvicorn

if __name__ == "__main__":
    print("Starting Anything-to-Anything Local Conversion Microservice...")
    print("Server running on http://127.0.0.1:8000")
    print("Interactive Swagger Documentation: http://127.0.0.1:8000/docs")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
