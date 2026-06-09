from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/assess", methods=["POST"])
def assess():
    data = request.json

    readings = data.get("readings", [])

    if len(readings) == 0:
        return jsonify({
            "error": "No readings provided"
        }), 400

    average = sum(readings) / len(readings)

    if average < 120:
        risk = "Low"
        message = "Glucose levels are within acceptable limits."
        recommendation = (
            "Continue your current monitoring routine "
            "and maintain a healthy lifestyle."
        )

    elif average < 200:
        risk = "Moderate"
        message = "Monitor glucose closely."
        recommendation = (
            "Increase hydration, monitor glucose regularly, "
            "and follow your prescribed treatment plan."
        )

    else:
        risk = "High"
        message = "Consult your healthcare provider."
        recommendation = (
            "Seek medical advice if high readings persist "
            "and review your diabetes management plan."
        )

    return jsonify({
        "risk": risk,
        "average": round(average, 1),
        "message": message,
        "recommendation": recommendation
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)