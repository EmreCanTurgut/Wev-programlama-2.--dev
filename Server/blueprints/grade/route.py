from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions.mongo import mongo
import datetime
import pandas as pd
import io

# Blueprint for academic records (grades)
grade_bp = Blueprint('grade', __name__)

# POST /api/grades/grade - Add a new grade


@grade_bp.route('/grade', methods=['POST'])
@grade_bp.route('/grade/', methods=['POST'])  # accept trailing slash
@jwt_required()
def add_grade():
    db = mongo.db
    data = request.get_json() or {}
    required = ['student_number', 'course_code', 'grade']
    if not all(field in data for field in required):
        return jsonify({'msg': 'Missing grade fields'}), 400

    if not db.students.find_one({'student_number': data['student_number']}):
        return jsonify({'msg': 'Student not found'}), 404
    if not db.courses.find_one({'code': data['course_code']}):
        return jsonify({'msg': 'Course not found'}), 404

    record = {
        'student_number': data['student_number'],
        'course_code': data['course_code'],
        'grade': data['grade'],
        'created_at': datetime.datetime.utcnow()
    }
    db.grades.insert_one(record)
    return jsonify({'msg': 'Grade added'}), 201

# POST /api/grades/grade/upload - Batch upload


@grade_bp.route('/grade/upload', methods=['POST'])
@grade_bp.route('/grade/upload/', methods=['POST'])
@jwt_required()
def upload_grades():
    db = mongo.db
    if 'file' not in request.files:
        return jsonify({'msg': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400

    contents = file.read()
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception:
        return jsonify({'msg': 'Invalid file format'}), 400

    if not set(['student_number', 'course_code', 'grade']).issubset(df.columns):
        return jsonify({'msg': 'Missing required columns'}), 400

    records = []
    for _, row in df.iterrows():
        if not db.students.find_one({'student_number': row['student_number']}) \
           or not db.courses.find_one({'code': row['course_code']}):
            continue
        records.append({
            'student_number': row['student_number'],
            'course_code': row['course_code'],
            'grade': row['grade'],
            'created_at': datetime.datetime.utcnow()
        })
    if records:
        db.grades.insert_many(records)
    return jsonify({'msg': 'Batch upload completed', 'successCount': len(records)}), 200

# GET /api/grades/grade - List grades


@grade_bp.route('/grade', methods=['GET'])
@grade_bp.route('/grade/', methods=['GET'])
def list_grades():
    db = mongo.db
    query = {}
    for field in ['student_number', 'course_code']:
        value = request.args.get(field)
        if value:
            query[field] = value
    grades = []
    for g in db.grades.find(query):
        g['_id'] = str(g['_id'])
        grades.append(g)
    return jsonify(grades), 200

# DELETE /api/grades/grade/<id> - Delete grade


@grade_bp.route('/grade/<id>', methods=['DELETE'])
@grade_bp.route('/grade/<id>/', methods=['DELETE'])
@jwt_required()
def delete_grade(id):
    db = mongo.db
    from bson import ObjectId
    try:
        obj_id = ObjectId(id)
    except Exception:
        return jsonify({'msg': 'Invalid ID format'}), 400

    result = db.grades.delete_one({'_id': obj_id})
    if result.deleted_count == 0:
        return jsonify({'msg': 'Grade not found'}), 404
    return jsonify({'msg': 'Grade deleted'}), 200
