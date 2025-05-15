import os


class Config:
    # Flask-PyMongo expects 'MONGO_URI'
    MONGO_URI = os.getenv('MONGO_URI')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # seconds

    if not MONGO_URI:
        raise ValueError(
            "No MONGO_URI set in environment variables. Ensure MONGO_URI is set before importing Config.")
