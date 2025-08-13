from flask import Blueprint, jsonify

simulation_bp = Blueprint('simulation', __name__)

@simulation_bp.route('/run', methods=['POST'])
def run_simulation():
    result = {
        "message": "Simulation climatique en cours...",
        "impact": "Augmentation de température de 2°C"
    }
    return jsonify(result)
