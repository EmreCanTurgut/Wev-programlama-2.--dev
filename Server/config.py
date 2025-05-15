import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/my_flask_app')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secret-key')  
    JWT_ACCESS_TOKEN_EXPIRES = 3600  