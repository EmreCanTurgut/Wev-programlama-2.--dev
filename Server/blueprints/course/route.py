from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions.mongo import mongo
import datetime

course_bp = Blueprint('course', __name__)

# Create new course


@course_bp.route('/', methods=['POST'])
@jwt_required()
def create_course():
    db = mongo.db
    data = request.get_json() or {}
    required = ['name', 'code', 'credit', 'instructor']
    if not all(field in data for field in required):
        return jsonify({'msg': 'Missing course fields'}), 400

    # Prevent duplicate course code
    if db.courses.find_one({'code': data['code']}):
        return jsonify({'msg': 'Course code already exists'}), 409

    course = {
        'name': data['name'],
        'code': data['code'],
        'credit': data['credit'],
        'instructor': data['instructor'],
        'created_at': datetime.datetime.utcnow()
    }
    result = db.courses.insert_one(course)
    return jsonify({'msg': 'Course created', 'code': data['code']}), 201

# Get course by code


@course_bp.route('/<code>', methods=['GET'])
def get_course(code):
    db = mongo.db
    course = db.courses.find_one({'code': code})
    if not course:
        return jsonify({'msg': 'Course not found'}), 404
    course['_id'] = str(course['_id'])
    return jsonify(course), 200

# Update course by code


@course_bp.route('/<code>', methods=['PUT'])
@jwt_required()
def update_course(code):
    db = mongo.db
    data = request.get_json() or {}
    update = {k: v for k, v in data.items() if k in [
        'name', 'credit', 'instructor']}
    if not update:
        return jsonify({'msg': 'No valid fields to update'}), 400

    result = db.courses.update_one({'code': code}, {'$set': update})
    if result.matched_count == 0:
        return jsonify({'msg': 'Course not found'}), 404
    return jsonify({'msg': 'Course updated'}), 200

# List courses with optional filters


@course_bp.route('/', methods=['GET'])
def list_courses():
    db = mongo.db
    query = {}
    for field in ['code', 'name', 'instructor']:
        value = request.args.get(field)
        if value:
            query[field] = {'$regex': value, '$options': 'i'}

    courses = []
    for c in db.courses.find(query):
        c['_id'] = str(c['_id'])
        courses.append(c)
    return jsonify(courses), 200

# Delete course by code


@course_bp.route('/<code>', methods=['DELETE'])
@jwt_required()
def delete_course(code):
    db = mongo.db
    result = db.courses.delete_one({'code': code})
    if result.deleted_count == 0:
        return jsonify({'msg': 'Course not found'}), 404
    return jsonify({'msg': 'Course deleted'}), 200
