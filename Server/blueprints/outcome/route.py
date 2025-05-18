from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions.mongo import mongo
import datetime

# Blueprint for Program Çıktısı (PÇ) realizations
outcome_bp = Blueprint('outcome', __name__)


def get_db():
    return mongo.db

# 1. Öğrenci bazında PÇ gerçekleme raporu
# GET /api/outcomes/realization/student/<student_number>?term=2024-Fall


@outcome_bp.route('/realization/student/<student_number>', methods=['GET'])
@jwt_required()
def student_realization(student_number):
    db = get_db()
    term = request.args.get('term')
    # 1-a. Öğrencinin aldığı notlar
    grade_query = {'student_number': student_number}
    if term:
        grade_query['term'] = term
    grades = list(db.grades.find(grade_query))
    # 1-b. Her not için ilişkili outcome'lar
    # grade_outcome koleksiyonünde eşleşen mapler
    student_outcomes = {}
    for g in grades:
        gid = str(g['_id'])
        maps = db.grade_outcome.find({'grade_id': gid})
        for m in maps:
            oid = m['outcome_id']
            student_outcomes.setdefault(oid, []).append(float(g['grade']))
    # 1-c. Ortalama hesapla
    result = []
    for oid, scores in student_outcomes.items():
        out = db.outcomes.find_one({'_id': mongo.db.ObjectId(oid)})
        result.append({
            'outcome_code': out['outcome_code'],
            'description': out.get('description'),
            'realization_rate': sum(scores) / len(scores)
        })
    return jsonify({'student_number': student_number, 'term': term, 'outcomes': result}), 200

# 2. Ders bazında PÇ gerçekleme raporu
# GET /api/outcomes/realization/course/<course_code>?term=2024-Fall


@outcome_bp.route('/realization/course/<course_code>', methods=['GET'])
def course_realization(course_code):
    db = get_db()
    term = request.args.get('term')
    # 2-a. Dersin notları
    grade_query = {'course_code': course_code}
    if term:
        grade_query['term'] = term
    grades = list(db.grades.find(grade_query))
    # 2-b. Map'leri al
    course_outcomes = {}
    for g in grades:
        gid = str(g['_id'])
        maps = db.grade_outcome.find({'grade_id': gid})
        for m in maps:
            oid = m['outcome_id']
            course_outcomes.setdefault(oid, []).append(float(g['grade']))
    # 2-c. Ortalama
    result = []
    for oid, scores in course_outcomes.items():
        out = db.outcomes.find_one({'_id': mongo.db.ObjectId(oid)})
        result.append({
            'outcome_code': out['outcome_code'],
            'description': out.get('description'),
            'realization_rate': sum(scores) / len(scores)
        })
    return jsonify({'course_code': course_code, 'term': term, 'outcomes': result}), 200

# 3. Program bazında (tüm dersler) PÇ gerçekleme özeti
# GET /api/outcomes/realization/program?term=2024-Fall


@outcome_bp.route('/realization/program', methods=['GET'])
def program_realization():
    db = get_db()
    term = request.args.get('term')
    # 3-a. Tüm notları çek
    grade_query = {}
    if term:
        grade_query['term'] = term
    grades = list(db.grades.find(grade_query))
    # 3-b. Map'leri topla
    program_outcomes = {}
    for g in grades:
        gid = str(g['_id'])
        maps = db.grade_outcome.find({'grade_id': gid})
        for m in maps:
            oid = m['outcome_id']
            program_outcomes.setdefault(oid, []).append(float(g['grade']))
    # 3-c. Ortalama
    result = []
    for oid, scores in program_outcomes.items():
        out = db.outcomes.find_one({'_id': mongo.db.ObjectId(oid)})
        result.append({
            'outcome_code': out['outcome_code'],
            'description': out.get('description'),
            'realization_rate': sum(scores) / len(scores)
        })
    return jsonify({'term': term, 'outcomes': result}), 200
