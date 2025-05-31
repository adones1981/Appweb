
from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

API_BASE = "https://api.scltrans.it/v1"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/paraderos", methods=["GET"])
def paraderos():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    r = requests.get(f"{API_BASE}/stops?center_lat={lat}&center_lon={lon}")
    return jsonify(r.json())

@app.route("/api/arribos/<paradero_id>")
def arribos(paradero_id):
    r = requests.get(f"{API_BASE}/stops/{paradero_id}/next_arrivals")
    return jsonify(r.json())

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
