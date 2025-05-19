from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from extensions.mongo import mongo
import datetime

course_bp = Blueprint('course', __name__, url_prefix='/api/courses')

# Create new course


@course_bp.route('/', methods=['POST'])
@jwt_required()
def create_course():
    db = mongo.db
    data = request.get_json() or {}
    current_app.logger.debug(f"Create payload: {data}")

    required = ['name', 'code', 'credit', 'instructor']
    if not all(field in data for field in required):
        return jsonify({'msg': 'Missing course fields'}), 400

    if db.courses.find_one({'code': data['code']}):
        return jsonify({'msg': 'Course code already exists'}), 409

    # Normalize outcomes: ensure list of ints
    outcomes = data.get('outcomes')
    if isinstance(outcomes, list):
        # filter valid numbers
        outcomes_list = [int(o) for o in outcomes if isinstance(
            o, (int, str)) and str(o).isdigit()]
    elif isinstance(outcomes, str):
        outcomes_list = [int(s)
                         for s in outcomes.split(',') if s.strip().isdigit()]
    else:
        outcomes_list = []

    course = {
        'name': data['name'],
        'code': data['code'],
        'credit': data['credit'],
        'instructor': data['instructor'],
        'created_at': datetime.datetime.utcnow(),
        'outcomes': outcomes_list
    }
    current_app.logger.debug(f"Inserting course: {course}")
    db.courses.insert_one(course)
    return jsonify({'msg': 'Course created', 'code': data['code']}), 201

# Get course by code


@course_bp.route('/<code>', methods=['GET'])
def get_course(code):
    db = mongo.db
    course = db.courses.find_one({'code': code})
    if not course:
        return jsonify({'msg': 'Course not found'}), 404
    course['_id'] = str(course['_id'])
    course['outcomes'] = course.get('outcomes', [])
    return jsonify(course), 200

# Update course by code


@course_bp.route('/<code>', methods=['PUT'])
@jwt_required()
def update_course(code):
    db = mongo.db
    data = request.get_json() or {}
    current_app.logger.debug(f"Update payload for {code}: {data}")

    update = {}
    for k in ['name', 'credit', 'instructor']:
        if k in data:
            update[k] = data[k]
    # handle outcomes
    if 'outcomes' in data:
        oc = data['outcomes']
        if isinstance(oc, list):
            update['outcomes'] = [int(o) for o in oc if str(o).isdigit()]
        elif isinstance(oc, str):
            update['outcomes'] = [int(s)
                                  for s in oc.split(',') if s.strip().isdigit()]
    if not update:
        return jsonify({'msg': 'No valid fields to update'}), 400

    result = db.courses.update_one({'code': code}, {'$set': update})
    if result.matched_count == 0:
        return jsonify({'msg': 'Course not found'}), 404
    return jsonify({'msg': 'Course updated'}), 200

# List courses


@course_bp.route('/', methods=['GET'])
def list_courses():
    db = mongo.db
    query = {}
    for field in ['code', 'name', 'instructor']:
        val = request.args.get(field)
        if val:
            query[field] = {'$regex': val, '$options': 'i'}
    courses = []
    for c in db.courses.find(query):
        c['_id'] = str(c['_id'])
        c['outcomes'] = c.get('outcomes', [])
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
