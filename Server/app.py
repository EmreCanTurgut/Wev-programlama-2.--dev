from flask import Flask
from Server.config import Config
from extensions.mongo import mongo
from extensions.jwt import jwt

from blueprints.auth.routes import auth_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
