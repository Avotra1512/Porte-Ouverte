# pylint: disable=unknown-argument
from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({"message": "Bienvenue sur l'API Flask du projet Climate"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)