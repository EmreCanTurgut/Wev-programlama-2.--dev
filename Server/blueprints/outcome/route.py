from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from flask_cors import cross_origin
from bson.objectid import ObjectId
from extensions.mongo import mongo

outcome_bp = Blueprint('outcome', __name__, url_prefix='/api/outcomes')


def _calculate_realization(filter_query):
    db = mongo.db

    # 1) İlgili notları çek
    grades = list(db.grades.find(filter_query))
    if not grades:
        return []

    # 2) Not ID'lerinin string hali
    grade_id_strs = [str(g['_id']) for g in grades]

    # 3) Tüm ilgili linkleri tek seferde çek
    links = list(db.grade_outcome.find({
        'grade_id': {'$in': grade_id_strs + [ObjectId(gid) for gid in grade_id_strs if ObjectId.is_valid(gid)]}
    }))

    # 4) grade_id (string) → [outcome_id(string)] map’i oluştur
    grade_to_outcomes = {}
    for link in links:
        raw_gid = link.get('grade_id')
        raw_oid = link.get('outcome_id')

        # Hem ObjectId hem de string gelen haller için normalize et
        gid = str(raw_gid)
        oid = str(raw_oid)

        grade_to_outcomes.setdefault(gid, []).append(oid)

    # 5) Her outcome için notları topla
    outcome_scores = {}
    for g in grades:
        gid = str(g['_id'])
        try:
            score = float(g.get('grade', 0))
        except (TypeError, ValueError):
            continue

        for oid_str in grade_to_outcomes.get(gid, []):
            # Çıkış ID’sini ObjectId’ye çevir
            if not ObjectId.is_valid(oid_str):
                continue
            oid = ObjectId(oid_str)
            outcome_scores.setdefault(oid, []).append(score)

    # 6) Ortalama realize oranlarını hesapla
    results = []
    for oid, scores in outcome_scores.items():
        outcome = db.outcomes.find_one({'_id': oid})
        if not outcome:
            continue
        avg_rate = round(sum(scores) / len(scores), 2) if scores else 0.0
        results.append({
            'outcome_code': outcome.get('outcome_code'),
            'description': outcome.get('description', ''),
            'realization_rate': avg_rate
        })
    return results


@outcome_bp.route('/realization/student/<string:student_number>', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def student_realization(student_number):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    results = _calculate_realization({'student_number': student_number})
    return jsonify({'outcomes': results}), 200


@outcome_bp.route('/realization/course/<string:course_code>', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def course_realization(course_code):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    results = _calculate_realization({'course_code': course_code})
    return jsonify({'outcomes': results}), 200


@outcome_bp.route('/realization/summary', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def program_realization():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    results = _calculate_realization({})
    return jsonify({'outcomes': results}), 200
