from flask import Flask, request, jsonify, send_from_directory
import subprocess
import os
import traceback

# Set up Flask app with frontend static folder
app = Flask(__name__, static_folder='../frontend/static', static_url_path='')

@app.route('/')
def serve_frontend():
    # Serve the static HTML file (not using render_template since this is not a Jinja2 template)
    index_path = os.path.join(app.static_folder, 'index.html')
    if not os.path.exists(index_path):
        return f"Error: index.html not found at {index_path}", 500
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/run', methods=['POST'])
def run_simulation():
    try:
        data = request.json
        frames = data.get('frames')
        requests = data.get('requests')
        algorithm = data.get('algorithm')

        print(f"[DEBUG] Received: frames={frames}, requests={requests}, algorithm={algorithm}")

        # Input validation
        if not frames or not requests or not algorithm:
            return jsonify({"error": "Missing required fields: frames, requests, or algorithm"}), 400

        try:
            frames = int(frames)
            if frames <= 0:
                return jsonify({"error": "Frames must be a positive integer"}), 400
        except ValueError:
            return jsonify({"error": "Frames must be an integer"}), 400

        try:
            request_list = [int(x.strip()) for x in requests.split(',')]
        except ValueError:
            return jsonify({"error": "Requests must be comma-separated integers"}), 400

        if algorithm.upper() not in ["FIFO", "LRU", "OPTIMAL", "SECOND_CHANCE"]:
            return jsonify({"error": "Invalid algorithm. Choose FIFO, LRU, OPTIMAL, or SECOND_CHANCE"}), 400


        request_sequence = " ".join(map(str, request_list))

        # Command to run the C executable
        normalized_algorithm = algorithm.upper()
        if normalized_algorithm == "SECOND_CHANCE":
            normalized_algorithm = "second_chance"  # match C code string
        command = ["./memory_simulator.exe", str(frames), str(len(request_list)), request_sequence, normalized_algorithm]

        print(f"[DEBUG] Running command: {' '.join(command)}")

        result = subprocess.run(command, capture_output=True, text=True)

        print(f"[DEBUG] stdout:\n{result.stdout}")
        print(f"[DEBUG] stderr:\n{result.stderr}")

        if result.returncode != 0:
            return jsonify({"error": "Simulation failed", "details": result.stderr}), 500

        return jsonify({"result": result.stdout})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
