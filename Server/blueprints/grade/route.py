from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions.mongo import mongo
import datetime
import pandas as pd
import io

# Blueprint for academic records (grades & seminars)
grade_bp = Blueprint('grade', __name__)

db = mongo.db

# --- Grade Endpoints ---
# Add grade for a student in a course


@grade_bp.route('/grade', methods=['POST'])
@jwt_required()
def add_grade():
    db = mongo.db
    data = request.get_json() or {}
    required = ['student_number', 'course_code', 'grade']
    if not all(field in data for field in required):
        return jsonify({'msg': 'Missing grade fields'}), 400

    # ensure student and course exist
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

# Batch upload via CSV or Excel


@grade_bp.route('/grade/upload', methods=['POST'])
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

    # expected columns: student_number, course_code, grade
    if not set(['student_number', 'course_code', 'grade']).issubset(df.columns):
        return jsonify({'msg': 'Missing required columns'}), 400

    records = []
    for _, row in df.iterrows():
        if not db.students.find_one({'student_number': row['student_number']}) or not db.courses.find_one({'code': row['course_code']}):
            continue
        records.append({
            'student_number': row['student_number'],
            'course_code': row['course_code'],
            'grade': row['grade'],
            'created_at': datetime.datetime.utcnow()
        })
    if records:
        db.grades.insert_many(records)
    return jsonify({'msg': 'Batch upload completed', 'inserted': len(records)}), 200

# List grades for a student or course


@grade_bp.route('/grade', methods=['GET'])
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

# Delete grade record


@grade_bp.route('/grade/<id>', methods=['DELETE'])
@jwt_required()
def delete_grade(id):
    db = mongo.db
    try:
        from bson import ObjectId
        obj_id = ObjectId(id)
    except Exception:
        return jsonify({'msg': 'Invalid ID format'}), 400

    result = db.grades.delete_one({'_id': obj_id})
    if result.deleted_count == 0:
        return jsonify({'msg': 'Grade not found'}), 404
    return jsonify({'msg': 'Grade deleted'}), 200

# --- Seminar Endpoints ---
# Add seminar participation/performance note


@grade_bp.route('/seminar', methods=['POST'])
@jwt_required()
def add_seminar():
    db = mongo.db
    data = request.get_json() or {}
    required = ['student_number', 'seminar_name', 'note']
    if not all(field in data for field in required):
        return jsonify({'msg': 'Missing seminar fields'}), 400

    # ensure student exists
    if not db.students.find_one({'student_number': data['student_number']}):
        return jsonify({'msg': 'Student not found'}), 404

    record = {
        'student_number': data['student_number'],
        'seminar_name': data['seminar_name'],
        'note': data['note'],
        'created_at': datetime.datetime.utcnow()
    }
    db.seminars.insert_one(record)
    return jsonify({'msg': 'Seminar record added'}), 201

# Batch upload seminars via CSV/Excel


@grade_bp.route('/seminar/upload', methods=['POST'])
@jwt_required()
def upload_seminars():
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

    # expected columns: student_number, seminar_name, note
    if not set(['student_number', 'seminar_name', 'note']).issubset(df.columns):
        return jsonify({'msg': 'Missing required columns'}), 400

    records = []
    for _, row in df.iterrows():
        if not db.students.find_one({'student_number': row['student_number']}):
            continue
        records.append({
            'student_number': row['student_number'],
            'seminar_name': row['seminar_name'],
            'note': row['note'],
            'created_at': datetime.datetime.utcnow()
        })
    if records:
        db.seminars.insert_many(records)
    return jsonify({'msg': 'Batch seminar upload completed', 'inserted': len(records)}), 200

# List seminar records


@grade_bp.route('/seminar', methods=['GET'])
def list_seminars():
    db = mongo.db
    query = {}
    for field in ['student_number', 'seminar_name']:
        value = request.args.get(field)
        if value:
            query[field] = {'$regex': value, '$options': 'i'}

    seminars = []
    for s in db.seminars.find(query):
        s['_id'] = str(s['_id'])
        seminars.append(s)
    return jsonify(seminars), 200

# Delete seminar record


@grade_bp.route('/seminar/<id>', methods=['DELETE'])
@jwt_required()
def delete_seminar(id):
    db = mongo.db
    try:
        from bson import ObjectId
        obj_id = ObjectId(id)
    except Exception:
        return jsonify({'msg': 'Invalid ID format'}), 400

    result = db.seminars.delete_one({'_id': obj_id})
    if result.deleted_count == 0:
        return jsonify({'msg': 'Seminar record not found'}), 404
    return jsonify({'msg': 'Seminar record deleted'}), 200


# --- Reporting Endpoints ---
@grade_bp.route('/report/student/<student_number>', methods=['GET'])
def report_student(student_number):
    db = mongo.db
    # fetch grades and seminars for student
    grades = list(db.grades.find({'student_number': student_number}))
    seminars = list(db.seminars.find({'student_number': student_number}))
    # stringify IDs
    for g in grades:
        g['_id'] = str(g['_id'])
    for s in seminars:
        s['_id'] = str(s['_id'])
    return jsonify({'student_number': student_number, 'grades': grades, 'seminars': seminars}), 200


@grade_bp.route('/report/course/<course_code>', methods=['GET'])
def report_course(course_code):
    db = mongo.db
    # fetch all grades for course
    grades = list(db.grades.find({'course_code': course_code}))
    for g in grades:
        g['_id'] = str(g['_id'])
    return jsonify({'course_code': course_code, 'grades': grades}), 200


@grade_bp.route('/report/summary', methods=['GET'])
def report_summary():
    db = mongo.db
    # optional filters: course_code, min_grade
    query = {}
    if 'course_code' in request.args:
        query['course_code'] = request.args['course_code']
    grades = list(db.grades.find(query))
    # compute summary
    total = len(grades)
    pass_count = sum(1 for g in grades if float(
        g['grade']) >= float(request.args.get('min_grade', 0)))
    return jsonify({'total_records': total, 'pass_count': pass_count}), 200
