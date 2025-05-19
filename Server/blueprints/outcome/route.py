from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from flask_cors import cross_origin
from extensions.mongo import mongo
import sys

outcome_bp = Blueprint('outcome', __name__, url_prefix='/api/outcomes')


def _calculate_realization(filter_query):
    print(
        f"DEBUG: _calculate_realization called with filter_query={filter_query}", file=sys.stdout, flush=True)
    db = mongo.db

    grades = list(db.grades.find(filter_query))
    print(
        f"DEBUG: Retrieved grades ({len(grades)}): {grades}", file=sys.stdout, flush=True)
    if not grades:
        return []

    # outcome_key --> [scores]
    outcome_scores = {}
    for g in grades:
        course = db.courses.find_one(
            {'code': g['course_code']}, {'outcomes': 1})
        print(
            f"DEBUG: Retrieved course {g['course_code']}: {course}", file=sys.stdout, flush=True)
        if not course or 'outcomes' not in course:
            continue
        score = float(g.get('grade', 0))
        for item in course['outcomes']:
            key = str(item)
            outcome_scores.setdefault(key, []).append(score)
            print(
                f"DEBUG: Appended score {score} to key {key}", file=sys.stdout, flush=True)

    print(
        f"DEBUG: outcome_scores map: {outcome_scores}", file=sys.stdout, flush=True)

    # calculate average per outcome_key
    results = []
    for key, scores in outcome_scores.items():
        avg_rate = round(sum(scores) / len(scores), 2)
        print(f"DEBUG: avg_rate for {key} is {avg_rate}",
              file=sys.stdout, flush=True)
        results.append({
            'outcome_code': key,
            'description': '',
            'realization_rate': avg_rate
        })
        print(f"DEBUG: result appended for {key}", file=sys.stdout, flush=True)

    print(f"DEBUG: Final results: {results}", file=sys.stdout, flush=True)
    return results


@outcome_bp.route('/realization/student/<string:student_number>', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def student_realization(student_number):
    print(
        f"DEBUG: student_realization called for {student_number}", file=sys.stdout, flush=True)
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    outcomes = _calculate_realization({'student_number': student_number})
    print(f"DEBUG: Returning: {outcomes}", file=sys.stdout, flush=True)
    return jsonify({'outcomes': outcomes}), 200


@outcome_bp.route('/realization/course/<string:course_code>', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def course_realization(course_code):
    print(
        f"DEBUG: course_realization called for {course_code}", file=sys.stdout, flush=True)
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    outcomes = _calculate_realization({'course_code': course_code})
    print(f"DEBUG: Returning: {outcomes}", file=sys.stdout, flush=True)
    return jsonify({'outcomes': outcomes}), 200


@outcome_bp.route('/realization/summary', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def program_realization():
    print("DEBUG: program_realization called", file=sys.stdout, flush=True)
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    outcomes = _calculate_realization({})
    print(f"DEBUG: Returning: {outcomes}", file=sys.stdout, flush=True)
    return jsonify({'outcomes': outcomes}), 200
