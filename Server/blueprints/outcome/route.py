from bson import ObjectId
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from flask_cors import cross_origin
from extensions.mongo import mongo

outcome_bp = Blueprint('outcome', __name__, url_prefix='/api/outcomes')


def _calculate_realization(filter_query):
    import sys
    print(
        f"PRINT DEBUG: Entering _calculate_realization with filter: {filter_query}", file=sys.stdout, flush=True)

    db = mongo.db
    grades = list(db.grades.find(filter_query))
    print(
        f"PRINT DEBUG: Retrieved grades ({len(grades)}): {grades}", file=sys.stdout, flush=True)
    if not grades:
        print("PRINT DEBUG: No grades found, returning []",
              file=sys.stdout, flush=True)
        return []

    grade_ids = [g['_id'] for g in grades]
    grade_id_strs = [str(g) for g in grade_ids]
    print(
        f"PRINT DEBUG: Grade IDs (ObjectId): {grade_ids}", file=sys.stdout, flush=True)
    print(
        f"PRINT DEBUG: Grade IDs (str): {grade_id_strs}", file=sys.stdout, flush=True)

    links = list(db.grade_outcome.find({
        '$or': [
            {'grade_id': {'$in': grade_ids}},
            {'grade_id': {'$in': grade_id_strs}}
        ]
    }))
    print(
        f"PRINT DEBUG: Retrieved links ({len(links)}): {links}", file=sys.stdout, flush=True)

    grade_to_outcomes = {}
    for link in links:
        gid = link.get('grade_id')
        oid_raw = link.get('outcome_id')
        grade_to_outcomes.setdefault(gid, []).append(oid_raw)
    print(
        f"PRINT DEBUG: Grade to Outcomes map: {grade_to_outcomes}", file=sys.stdout, flush=True)

    # Find common outcomes
    common_oids = None
    for g in grades:
        gids = g['_id']
        oids = grade_to_outcomes.get(gids, [])
        common_oids = set(oids) if common_oids is None else (
            common_oids & set(oids))
    common_oids = common_oids or set()
    print(
        f"PRINT DEBUG: Common outcome_id strings: {common_oids}", file=sys.stdout, flush=True)

    avg_score = round(sum(float(g.get('grade', 0))
                      for g in grades) / len(grades), 2)
    print(
        f"PRINT DEBUG: Average grade score for student: {avg_score}", file=sys.stdout, flush=True)

    results = []
    for oid_str in common_oids:
        if not ObjectId.is_valid(oid_str):
            print(
                f"PRINT DEBUG: Skipping invalid ObjectId string: {oid_str}", file=sys.stdout, flush=True)
            continue
        oid = ObjectId(oid_str)
        outcome = db.outcomes.find_one({'_id': oid})
        if not outcome:
            print(
                f"PRINT DEBUG: No outcome found for _id: {oid}", file=sys.stdout, flush=True)
            continue
        results.append({
            'outcome_code': outcome.get('outcome_code'),
            'description': outcome.get('description', ''),
            'realization_rate': avg_score
        })
    print(
        f"PRINT DEBUG: Final results: {results}", file=sys.stdout, flush=True)
    return results


@outcome_bp.route('/realization/student/<string:student_number>', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def student_realization(student_number):
    import sys
    print(
        f"PRINT DEBUG: student_realization called for: {student_number}", file=sys.stdout, flush=True)
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = _calculate_realization({'student_number': student_number})
    print(
        f"PRINT DEBUG: Returning student outcomes: {data}", file=sys.stdout, flush=True)
    return jsonify({'outcomes': data}), 200


@outcome_bp.route('/realization/course/<string:course_code>', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def course_realization(course_code):
    import sys
    print(
        f"PRINT DEBUG: course_realization called for: {course_code}", file=sys.stdout, flush=True)
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = _calculate_realization({'course_code': course_code})
    print(
        f"PRINT DEBUG: Returning course outcomes: {data}", file=sys.stdout, flush=True)
    return jsonify({'outcomes': data}), 200


@outcome_bp.route('/realization/summary', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def program_realization():
    import sys
    print("PRINT DEBUG: program_realization called", file=sys.stdout, flush=True)
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = _calculate_realization({})
    print(
        f"PRINT DEBUG: Returning summary outcomes: {data}", file=sys.stdout, flush=True)
    return jsonify({'outcomes': data}), 200
