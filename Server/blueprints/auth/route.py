from flask import Blueprint, request, jsonify, current_app
from extensions.mongo import mongo
from utils.password import hash_password, verify_password
from flask_jwt_extended import create_access_token
import datetime

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'msg': 'Username and password are required'}), 400

    db = mongo.db
    if db.users.find_one({'username': username}):
        return jsonify({'msg': 'User already exists'}), 409

    pw_hash = hash_password(password)
    user = {
        'username': username,
        'password': pw_hash,
        'created_at': datetime.datetime.utcnow()
    }
    db.users.insert_one(user)
    return jsonify({'msg': 'User registered successfully'}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'msg': 'Username and password are required'}), 400

    db = mongo.db
    user = db.users.find_one({'username': username})
    if not user or not verify_password(password, user['password']):
        return jsonify({'msg': 'Bad credentials'}), 401

    access_token = create_access_token(
        identity=str(user['_id']),
        expires_delta=datetime.timedelta(
            seconds=current_app.config['JWT_ACCESS_TOKEN_EXPIRES'])
    )
    return jsonify({'access_token': access_token}), 200
