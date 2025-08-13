from flask import Blueprint, jsonify

solutions_bp = Blueprint('solutions', __name__)

@solutions_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    recommendations = [
        "Réduire la consommation d'énergie",
        "Planter des arbres",
        "Favoriser les énergies renouvelables"
    ]
    return jsonify(recommendations)
