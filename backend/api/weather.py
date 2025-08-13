from flask import Blueprint, jsonify

weather_bp = Blueprint('weather', __name__)

@weather_bp.route('/forecast', methods=['GET'])
def get_forecast():
    forecast_data = {
        "city": "Antsirabe",
        "temperature": 22,
        "condition": "Ensoleillé"
    }
    return jsonify(forecast_data)
