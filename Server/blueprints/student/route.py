from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions.mongo import mongo
from bson import ObjectId
import datetime

student_bp = Blueprint('student', __name__)

# Create new student


@student_bp.route('/', methods=['POST'])
@jwt_required()
def create_student():
    db = mongo.db
    data = request.get_json() or {}
    required = ['first_name', 'last_name', 'student_number', 'contact']
    if not all(field in data for field in required):
        return jsonify({'msg': 'Missing student fields'}), 400

    # Prevent duplicate student_number
    if db.students.find_one({'student_number': data['student_number']}):
        return jsonify({'msg': 'Student number already exists'}), 409

    student = {
        'first_name': data['first_name'],
        'last_name': data['last_name'],
        'student_number': data['student_number'],
        'contact': data['contact'],
        'created_at': datetime.datetime.utcnow()
    }
    result = db.students.insert_one(student)
    return jsonify({'msg': 'Student created', 'student_number': data['student_number']}), 201

# Get student by student_number


@student_bp.route('/<student_number>', methods=['GET'])
def get_student(student_number):
    db = mongo.db
    student = db.students.find_one({'student_number': student_number})
    if not student:
        return jsonify({'msg': 'Student not found'}), 404
    student['_id'] = str(student['_id'])
    return jsonify(student), 200

# Update student by student_number


@student_bp.route('/<student_number>', methods=['PUT'])
@jwt_required()
def update_student(student_number):
    db = mongo.db
    data = request.get_json() or {}
    update = {k: v for k, v in data.items() if k in [
        'first_name', 'last_name', 'contact']}
    if not update:
        return jsonify({'msg': 'No valid fields to update'}), 400

    result = db.students.update_one(
        {'student_number': student_number}, {'$set': update})
    if result.matched_count == 0:
        return jsonify({'msg': 'Student not found'}), 404
    return jsonify({'msg': 'Student updated'}), 200

# List students with optional filters


@student_bp.route('/', methods=['GET'])
def list_students():
    db = mongo.db
    query = {}
    for field in ['student_number', 'first_name', 'last_name']:
        value = request.args.get(field)
        if value:
            query[field] = {'$regex': value, '$options': 'i'}

    students = []
    for s in db.students.find(query):
        s['_id'] = str(s['_id'])
        students.append(s)
    return jsonify(students), 200

# Delete student by student_number


@student_bp.route('/<student_number>', methods=['DELETE'])
@jwt_required()
def delete_student(student_number):
    db = mongo.db
    result = db.students.delete_one({'student_number': student_number})
    if result.deleted_count == 0:
        return jsonify({'msg': 'Student not found'}), 404
    return jsonify({'msg': 'Student deleted'}), 200
