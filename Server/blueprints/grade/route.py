from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions.mongo import mongo
import datetime
import pandas as pd
import io

grade_bp = Blueprint('grade', __name__)

# Add grade


@grade_bp.route('/grade', methods=['POST'])
@jwt_required()
def add_grade():
    db = mongo.db
    data = request.get_json() or {}
    for f in ('student_number', 'course_code', 'grade'):
        if f not in data:
            return jsonify(msg=f"Missing {f}"), 400
    if not db.students.find_one({'student_number': data['student_number']}):
        return jsonify(msg='Student not found'), 404
    if not db.courses.find_one({'code': data['course_code']}):
        return jsonify(msg='Course not found'), 404
    db.grades.insert_one({**data, 'created_at': datetime.datetime.utcnow()})
    return jsonify(msg='Grade added'), 201

# Bulk upload


@grade_bp.route('/grade/upload', methods=['POST'])
@jwt_required()
def upload_grades():
    db = mongo.db
    file = request.files.get('file')
    if not file:
        return jsonify(msg='No file'), 400
    content = file.read()
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except:
        return jsonify(msg='Invalid format'), 400
    if not set(['student_number', 'course_code', 'grade']).issubset(df.columns):
        return jsonify(msg='Missing cols'), 400
    recs = []
    for _, r in df.iterrows():
        if db.students.find_one({'student_number': r['student_number']}) and db.courses.find_one({'code': r['course_code']}):
            recs.append({
                'student_number': r['student_number'],
                'course_code': r['course_code'],
                'grade': r['grade'],
                'created_at': datetime.datetime.utcnow()
            })
    if recs:
        db.grades.insert_many(recs)
    return jsonify(msg='Batch upload completed', successCount=len(recs)), 200

# List grades


@grade_bp.route('/grade', methods=['GET'])
def list_grades():
    db = mongo.db
    q = {k: v for k, v in request.args.items() if k in [
        'student_number', 'course_code']}
    out = []
    for g in db.grades.find(q):
        g['_id'] = str(g['_id'])
        out.append(g)
    return jsonify(out), 200

# Delete grade


@grade_bp.route('/grade/<id>', methods=['DELETE'])
@jwt_required()
def delete_grade(id):
    from bson import ObjectId
    try:
        obj = ObjectId(id)
    except:
        return jsonify(msg='Invalid ID'), 400
    res = mongo.db.grades.delete_one({'_id': obj})
    if not res.deleted_count:
        return jsonify(msg='Not found'), 404
    return jsonify(msg='Grade deleted'), 200
