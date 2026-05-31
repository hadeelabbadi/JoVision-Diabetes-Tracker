from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/assess', methods=['POST'])
def assess():
    data = request.get_json()

    readings = data.get('readings', [])

    if not readings:
        return jsonify({
            "risk": "Unknown",
            "message": "No readings provided"
        })

    average = sum(readings) / len(readings)

    if average > 180:
        risk = "High"
        message = "Consult your healthcare provider."
    elif average > 140:
        risk = "Moderate"
        message = "Monitor glucose closely."
    else:
        risk = "Low"
        message = "Glucose levels appear stable."

    return jsonify({
        "risk": risk,
        "message": message,
        "average": round(average, 1)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)