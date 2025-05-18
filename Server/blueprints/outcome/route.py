from bson import ObjectId
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from flask_cors import cross_origin
from extensions.mongo import mongo

outcome_bp = Blueprint('outcome', __name__, url_prefix='/api/outcomes')


def _calculate_realization(filter_query):
    db = mongo.db

    # 1) Filtreye uyan notları çek
    grades = list(db.grades.find(filter_query))
    current_app.logger.debug(f"Grades fetched ({len(grades)}): {grades}")
    if not grades:
        return []

    # 2) Tüm grade'lerin outcome ilişkilerini al
    #    hem ObjectId hem string tipli grade_id
    grade_ids = [g['_id'] for g in grades]
    grade_id_strs = [str(gid) for gid in grade_ids]
    links = list(db.grade_outcome.find({
        '$or': [
            {'grade_id': {'$in': grade_ids}},
            {'grade_id': {'$in': grade_id_strs}}
        ]
    }))
    current_app.logger.debug(f"Links fetched ({len(links)}): {links}")

    # 3) Her grade_id için bağlı outcome_id listelerini oluştur
    grade_to_outcomes = {}
    for link in links:
        gid = link['grade_id']
        oid_raw = link['outcome_id']
        grade_to_outcomes.setdefault(gid, []).append(oid_raw)
    current_app.logger.debug(f"Grade->Outcomes map: {grade_to_outcomes}")

    # 4) Öğrenci bazlı: ortak outcome'ları bul
    common_oids = None
    for g in grades:
        gid = g['_id']
        oids = grade_to_outcomes.get(gid, [])
        if common_oids is None:
            common_oids = set(oids)
        else:
            common_oids &= set(oids)
    common_oids = common_oids or set()
    current_app.logger.debug(f"Common outcome_id strings: {common_oids}")

    # 5) Score ortalamasını hesapla
    avg_score = round(sum(float(g.get('grade', 0))
                      for g in grades) / len(grades), 2)
    current_app.logger.debug(f"Average grade score for student: {avg_score}")

    # 6) Sonuçları oluştur
    results = []
    for oid_str in common_oids:
        if not ObjectId.is_valid(oid_str):
            continue
        oid = ObjectId(oid_str)
        outcome = db.outcomes.find_one({'_id': oid})
        if not outcome:
            continue
        results.append({
            'outcome_code': outcome.get('outcome_code'),
            'description': outcome.get('description', ''),
            'realization_rate': avg_score
        })
    current_app.logger.debug(f"Final student results: {results}")
    return results


@outcome_bp.route('/realization/student/<string:student_number>', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def student_realization(student_number):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = _calculate_realization({'student_number': student_number})
    current_app.logger.debug(f"Returning student outcomes: {data}")
    return jsonify({'outcomes': data}), 200

# Ders ve program için mevcut ortalama metodunu koru


@outcome_bp.route('/realization/course/<string:course_code>', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def course_realization(course_code):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    # Ders bazında tüm öğrenci notlarını alıp her outcome için ortalama
    db = mongo.db
    # Aynı fonksiyonu kullanmak için grade_outcome ilişkisi öncelikli alınır
    data = _calculate_realization({'course_code': course_code})
    current_app.logger.debug(f"Returning course outcomes: {data}")
    return jsonify({'outcomes': data}), 200


@outcome_bp.route('/realization/summary', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def program_realization():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    # Program özeti: tüm grade_outcome ilişkileri ve not ortalaması
    data = _calculate_realization({})
    current_app.logger.debug(f"Returning summary outcomes: {data}")
    return jsonify({'outcomes': data}), 200
