from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions.mongo import mongo
import datetime

course_bp = Blueprint('course', __name__)

# Create new course with optional numeric outcomes


@course_bp.route('/', methods=['POST'])
@jwt_required()
def create_course():
    db = mongo.db
    data = request.get_json() or {}
    # Required course fields
    required = ['name', 'code', 'credit', 'instructor']
    if not all(field in data for field in required):
        return jsonify({'msg': 'Missing course fields'}), 400

    # Prevent duplicate course code
    if db.courses.find_one({'code': data['code']}):
        return jsonify({'msg': 'Course code already exists'}), 409

    # Insert course
    course = {
        'name': data['name'],
        'code': data['code'],
        'credit': data['credit'],
        'instructor': data['instructor'],
        'created_at': datetime.datetime.utcnow()
    }
    result = db.courses.insert_one(course)

    # Optional: numeric outcomes list (e.g. [1,2,3,...])
    # expecting list of ints or numeric strings
    outcomes = data.get('outcomes')
    inserted_count = 0
    if isinstance(outcomes, list):
        to_insert = []
        for oc in outcomes:
            try:
                code_num = int(oc)
                to_insert.append({
                    'course_code': data['code'],
                    'outcome_code': code_num,
                    'created_at': datetime.datetime.utcnow()
                })
            except (ValueError, TypeError):
                continue
        if to_insert:
            db.outcomes.insert_many(to_insert)
            inserted_count = len(to_insert)

    return jsonify({
        'msg': 'Course created',
        'code': data['code'],
        'inserted_course_id': str(result.inserted_id),
        'inserted_outcomes': inserted_count
    }), 201

# Other course endpoints unchanged...
