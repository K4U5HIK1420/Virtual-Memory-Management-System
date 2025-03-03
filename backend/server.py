from flask import Flask, render_template, request, jsonify
import subprocess
import os

app = Flask(__name__, static_folder='../frontend/static')

@app.route('/')
def home():
    # Debugging: Print the absolute path to the template
    template_path = os.path.join(app.root_path, 'templates', 'index.html')
    print(f"Looking for template at: {template_path}")

    # Check if the template file exists
    if not os.path.exists(template_path):
        return f"Error: Template not found at {template_path}", 500

    return render_template("index.html")

@app.route('/run', methods=['POST'])
def run_simulation():
    try:
        # Get JSON data from the request
        data = request.json
        frames = data.get('frames')
        requests = data.get('requests')
        algorithm = data.get('algorithm')

        # Debugging: Print the received data
        print(f"Received data: frames={frames}, requests={requests}, algorithm={algorithm}")

        # Validate inputs
        if not frames or not requests or not algorithm:
            return jsonify({"error": "Missing required fields: frames, requests, or algorithm"}), 400

        try:
            frames = int(frames)
            if frames <= 0:
                return jsonify({"error": "Frames must be a positive integer"}), 400
        except ValueError:
            return jsonify({"error": "Frames must be an integer"}), 400

        # Validate requests (comma-separated integers)
        try:
            request_sequence = " ".join(requests.split(','))
            request_list = [int(x) for x in requests.split(',')]
        except ValueError:
            return jsonify({"error": "Requests must be comma-separated integers"}), 400

        # Validate algorithm
        if algorithm not in ["FIFO", "LRU", "OPTIMAL"]:
            return jsonify({"error": "Invalid algorithm. Choose from FIFO, LRU, or OPTIMAL"}), 400

        # Debugging: Print the command to run the C program
        command = ["./memory_simulator.exe", str(frames), str(len(request_list)), request_sequence, algorithm]
        print(f"Running command: {' '.join(command)}")

        # Run the C program
        result = subprocess.run(
            command,
            capture_output=True, text=True
        )

        # Debugging: Print the C program output
        print(f"C program stdout: {result.stdout}")
        print(f"C program stderr: {result.stderr}")

        # Check if the C program ran successfully
        if result.returncode != 0:
            return jsonify({"error": "Simulation failed", "details": result.stderr}), 500

        # Return the output of the C program
        return jsonify({"result": result.stdout})

    except Exception as e:
        # Debugging: Print the full traceback
        import traceback
        traceback.print_exc()

        # Handle unexpected errors
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)