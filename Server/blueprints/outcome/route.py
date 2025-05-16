from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions.mongo import mongo
import datetime

outcome_bp = Blueprint('outcome', __name__)


def get_db():
    return mongo.db

# --- Program Çıktıları Tanımlama ---


@outcome_bp.route('/outcomes', methods=['POST'])
@jwt_required()
def create_outcome():
    db = get_db()
    data = request.get_json() or {}
    required = ['course_code', 'outcome_code', 'description']
    if not all(field in data for field in required):
        return jsonify({'msg': 'Missing outcome fields'}), 400
    # Prevent duplicates
    if db.outcomes.find_one({'course_code': data['course_code'], 'outcome_code': data['outcome_code']}):
        return jsonify({'msg': 'Outcome already exists'}), 409
    record = {
        'course_code': data['course_code'],
        'outcome_code': data['outcome_code'],
        'description': data['description'],
        'created_at': datetime.datetime.utcnow()
    }
    db.outcomes.insert_one(record)
    return jsonify({'msg': 'Outcome created'}), 201

# --- Notlarla PÇ İlişkilendirme ---


@outcome_bp.route('/map', methods=['POST'])
@jwt_required()
def map_grade_outcome():
    db = get_db()
    data = request.get_json() or {}
    required = ['grade_id', 'outcome_id']
    if not all(field in data for field in required):
        return jsonify({'msg': 'Missing mapping fields'}), 400
    # prevent duplicate mapping
    if db.grade_outcome.find_one({'grade_id': data['grade_id'], 'outcome_id': data['outcome_id']}):
        return jsonify({'msg': 'Mapping exists'}), 409
    record = {
        'grade_id': data['grade_id'],
        'outcome_id': data['outcome_id'],
        'mapped_at': datetime.datetime.utcnow()
    }
    db.grade_outcome.insert_one(record)
    return jsonify({'msg': 'Grade-outcome mapped'}), 201

# --- PÇ Gerçekleme Hesaplama ---


@outcome_bp.route('/realization/<course_code>/<outcome_code>', methods=['GET'])
def realization_rate(course_code, outcome_code):
    db = get_db()
    # find all grades for course
    grades = list(db.grades.find({'course_code': course_code}))
    # find outcome id
    outcome = db.outcomes.find_one(
        {'course_code': course_code, 'outcome_code': outcome_code})
    if not outcome:
        return jsonify({'msg': 'Outcome not found'}), 404
    # find mapped grade ids
    mappings = list(db.grade_outcome.find({'outcome_id': str(outcome['_id'])}))
    mapped_grade_ids = {m['grade_id'] for m in mappings}
    # filter grades
    relevant = [g for g in grades if str(g['_id']) in mapped_grade_ids]
    if not relevant:
        return jsonify({'rate': 0.0}), 200
    # compute average of grades
    avg = sum(float(g['grade']) for g in relevant) / len(relevant)
    return jsonify({'course_code': course_code, 'outcome_code': outcome_code, 'realization_rate': avg}), 200
