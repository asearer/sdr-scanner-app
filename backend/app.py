from flask import Flask, request, jsonify
import subprocess
import json

app = Flask(__name__)

@app.route('/scan', methods=['POST'])
def scan():
    config = request.json
    with open('config.json', 'w') as config_file:
        json.dump(config, config_file)
    
    # Call the SDR scanner script
    process = subprocess.Popen(['python', 'rtl_sdr_scanner.py', 'config.json'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        return jsonify({'error': stderr.decode('utf-8')}), 500

    results = parse_results(stdout.decode('utf-8'))
    return jsonify({'results': results})

def parse_results(output):
    # Implement parsing logic based on your script's output format
    results = []
    for line in output.splitlines():
        if 'Frequency' in line and 'Power' in line:
            parts = line.split(',')
            frequency = int(parts[0].split(':')[1].strip())
            power = float(parts[1].split(':')[1].strip())
            results.append({'frequency': frequency, 'power': power})
    return results

if __name__ == '__main__':
    app.run(debug=True)
