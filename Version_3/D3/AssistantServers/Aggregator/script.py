from flask import Flask, request, jsonify
from flask_cors import CORS
import json 
import requests
import logging

app = Flask(__name__)
CORS(app)

fname_urls="urls.txt"
fname_manifest = "manifestList.json"

logging.basicConfig(level=logging.DEBUG)

def aggregate():
    try:
        with open('../../Support/ActiveAssistantList.json', 'r') as file:
            assistant_data = json.load(file)
        assistant_data = assistant_data[2:]
        service_addresses = [assistant['assistant']['serviceAddress'] for assistant in assistant_data]

        with open('../../Support/manifest.json', 'r') as file:
            manifest_data = json.load(file)

        # Create a dictionary to map service endpoints to manifest information
        manifest_info = {}
        for assistant in manifest_data['assistants']:
            if assistant['identification']['serviceEndpoint'] not in manifest_info:
                manifest_info[assistant['identification']['serviceEndpoint']] = assistant

        # Match service addresses to manifest information
        matched_manifest = []
        for address in service_addresses:
            manifest_entry = manifest_info.get(address)
            if manifest_entry:
                matched_manifest.append((address, manifest_entry))
            else:
                matched_manifest.append((address, None))

        # Write matched URLs to urls.txt
        with open(fname_urls, 'w') as file_urls:
            for url, info in matched_manifest:
                file_urls.write(f"{url}\n")

        # Prepare HTML response
        urls_html = "<ul>\n"
        for url, info in matched_manifest:
            urls_html += f"<li>{url}</li>\n"
        urls_html += "</ul>\n"

        return urls_html
    except Exception as e:
        logging.error("Error during aggregation", exc_info=True)
        return "<p>Error during aggregation</p>"

# def read_existing_manifest():
#     try:
#         with open(fname_manifest, 'r') as file:
#             return file.read()
#     except FileNotFoundError:
#         return ""

@app.route('/request_manifest', methods=['GET'])
def request_manifest():
    try:
        with open(fname_urls, 'r') as file:
            urls = file.readlines()
            urls = [url.strip() for url in urls]  # Remove leading/trailing whitespace
            
            # Return the URLs as a JSON response
            return jsonify(urls), 200
    except Exception as e:
        logging.error("Error reading URLs file:", exc_info=True)
        return jsonify({"error": "Error reading URLs file.", "details": str(e)}), 500


@app.route('/', methods=['GET'])
def home():
    try:
        urls_html = aggregate()
        return f"<h1>URLs:</h1>\n{urls_html}"
    except Exception as e:
        logging.error("Error generating home page", exc_info=True)
        return "<p>Error generating home page</p>"

if __name__ == '__main__':
    try:
        aggregate()
    except Exception as e:
        logging.error("Error during initial aggregation", exc_info=True)
    app.run(host="0.0.0.0", port=8000, debug=True)