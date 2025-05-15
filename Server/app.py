import os
from flask import Flask
from dotenv import load_dotenv

# Load .env from project root (working directory) before Config import
load_dotenv()

from config import Config
from extensions.mongo import mongo
from extensions.jwt import jwt
from blueprints.auth.route import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Optional: print to confirm
    print("[DEBUG] Loaded MONGO_URI:", app.config.get('MONGO_URI'))

    mongo.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)