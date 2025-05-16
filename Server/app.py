from blueprints.auth.route import auth_bp
from blueprints.student.route import student_bp
from blueprints.course.route import course_bp
from blueprints.grade.route import grade_bp
from blueprints.outcome.route import outcome_bp
from flask_cors import CORS
from extensions.jwt import jwt
from extensions.mongo import mongo
from config import Config
import os
from flask import Flask
from dotenv import load_dotenv

# Load .env from project root (working directory) before Config import
load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Optional: print to confirm
    print("[DEBUG] Loaded MONGO_URI:", app.config.get('MONGO_URI'))

    mongo.init_app(app)
    jwt.init_app(app)

    CORS(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(student_bp, url_prefix='/api/students')
    app.register_blueprint(course_bp, url_prefix='/api/courses')
    app.register_blueprint(grade_bp, url_prefix='/api/grades')
    app.register_blueprint(outcome_bp, url_prefix='/api')
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
