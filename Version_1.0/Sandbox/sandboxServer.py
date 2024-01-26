# This is the simple server that hosts the browser resources
# Just run it from the root directory for your "sandbox"
#     (the dir containing the Browsers folder)
#     python sandboxServer.py

from http.server import HTTPServer, SimpleHTTPRequestHandler
#import requests
import os
import mimetypes
import json
from AssistantServers.OVONServerModules.simpleAssistant import exchange
port = 6005
print ("Started Sandbox Browser Service: ", port, "\n")

class Serv(SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, 'OK')
        self.send_header('allow','GET,HEAD,POST,OPTIONS,CONNECT,PUT,DAV,dav')
        self.send_header('x-api-access-type','file')
        self.end_headers()
    def do_GET(self):
        if self.path == '/':
            self.path = '/sbStartup.html'
        try:
            print("Requested path:", self.path)
            if self.path.startswith('/Report/Logs/'):
                logs_directory = os.path.join(os.getcwd(), "Report", "Logs")
                if os.path.isdir(logs_directory):
                    log_files = [f for f in os.listdir(logs_directory) if f.endswith(".log.txt")]
                    print("Response data:", log_files)

                    # Join the list of log files into a string with each file on a new line
                    response_data = '\n'.join(log_files) + '\n'

                    # Send the response as plain text
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/plain')
                    self.end_headers()
                    self.wfile.write(response_data.encode('utf-8'))
            
                else:
                    self.send_error(500, "Logs directory not found.")
                
            if self.path == '/Report/Sequence':
                sequence_directory = os.path.join(os.getcwd(), "Report", "Sequence")
                if os.path.isdir(sequence_directory):
                    sequence_files = [f for f in os.listdir(sequence_directory) if f.endswith(".seq.json")]
                    print("Response data:", sequence_files)

                    # Join the list of sequence files into a string with each file on a new line
                    response_data = '\n'.join(sequence_files) + '\n'

                    # Send the response as plain text
                    response_data = json.dumps(sequence_files)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(response_data.encode('utf-8'))
                else:
                    self.send_error(500, "Sequence directory not found.")
                    return  
                return  
            if self.path.__contains__(".png") or self.path.__contains__(".jpg"):
                file_to_open = self.path
                file_to_open = file_to_open[1:]
                imgfile = open(file_to_open, 'rb').read()
                mimetype = mimetypes.MimeTypes().guess_type(file_to_open)[0]
                self.send_response(200)
                self.send_header('Content-type', mimetype)
                self.end_headers()
                self.wfile.write(imgfile)
            else:
                file_to_open = open(self.path[1:]).read()
                self.send_response(200)
                self.end_headers()
                self.wfile.write(bytes(file_to_open, 'utf-8'))
        except:
            file_to_open = "File not found"
            self.send_response(404)
        self.end_headers()
    def do_PUT(self):
        rootpath = os.path.realpath(os.path.dirname(__file__))
        rootpath = rootpath.replace("\\", "/" )
        print( "Directory of the Sandbox: ", rootpath)
        length = int(self.headers['Content-Length'])
        path = self.translate_path(self.path)
        (srcpath, srcfile) = os.path.split(path)
        print( "the url path & file: ", srcpath, "  &  ", srcfile)
        midpath = None

        if srcfile.__contains__(".log."):
            midpath = "/Report/Logs/"
        elif srcfile.__contains__(".seq."):
            midpath = "/Report/Sequence/"
        elif srcfile.__contains__(".json"):
            midpath = "/Support/"
        if midpath is not None:
            path = rootpath + midpath + srcfile
            print("Full Path: ", path)

            try:
                with open(path, "wb") as dst:
                    dst.write(self.rfile.read(length))
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'message': 'OK'}).encode('utf-8'))
            except Exception as e:
                print("Error writing file:", str(e))
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Internal Server Error'}).encode('utf-8'))
        else:
            print("Invalid file type")
            self.send_response(400)  # Bad Request
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid file type'}).encode('utf-8'))
    def do_POST(self):
        # read the message and convert it into a python dictionary
        length = int(self.headers.get('content-length'))
        #length = int(self.headers.getheader('content-length'))
        post_data = self.rfile.read(length).decode('utf-8')
        try:
            message = json.loads(post_data)
        except json.JSONDecodeError:
            # If there's an issue decoding JSON, handle it appropriately
            self.send_response(400)  # Bad Request
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid JSON data'}).encode('utf-8'))
            return
        if self.path == '/Support/ActiveAssistantList.json':
            # Assuming 'ActiveAssistantList.json' is in the same directory as the server script
            path = os.path.join(os.path.dirname(__file__), 'Support','ActiveAssistantList.json')

            # Check if the file exists, if not, create an empty list
            if not os.path.exists(path):
                with open(path, 'w') as json_file:
                    json.dump([], json_file)

            # Read the existing content of the file
            with open(path, 'r') as json_file:
                try:
                    existing_data = json.load(json_file)
                except json.JSONDecodeError:
                    # If the file is empty or not a valid JSON, start with an empty list
                    existing_data = []

            # Append the new data to the existing content
            existing_data.append({"assistant": message})

            # Write the updated JSON data back to the file
            with open(path, 'w') as json_file:
                json.dump(existing_data, json_file, indent=2)

            # Respond with a success message
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"message": "Assistant created successfully!"}')
        if self.path.startswith('/Sandbox/AssistantServers/'):
            directory_name = self.path.split('/')[-1]
            # Create the directory if it doesn't exist
            directory_path = os.path.join(os.path.dirname(__file__), '..', 'Sandbox', 'AssistantServers', directory_name)
            os.makedirs(directory_path, exist_ok=True)
            
            # Write the content of local.py
            assistant_type = message.get('assistantType')
            if assistant_type == 'python':
                # Write the content of local.py
                local_path = os.path.join(directory_path, 'local.py')
                with open(local_path, 'w') as local_file:
                    local_file.write(message.get('localContent', ''))
                
                # Write the content of assistant.py
                assistant_path = os.path.join(directory_path, 'assistant.py')
                with open(assistant_path, 'w') as assistant_file:
                    assistant_file.write(message.get('assistantContent', ''))
            elif assistant_type == 'js':
                assistant_path = os.path.join(directory_path, 'assistant.js')
                with open(assistant_path, 'w') as assistant_file:
                    assistant_file.write(message.get('jsContent', ''))
            else:
                assistant_path = os.path.join(directory_path, 'assistant.js')
                with open(assistant_path, 'w') as assistant_file:
                    assistant_file.write(message.get('LLMContent', ''))
            
            # Respond with a success message
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"message": "Directory created successfully!"}')
        else:
            # Handle other POST requests as needed
            pass
        #self.wfile.write(bytes(json.dumps(message, ensure_ascii=False), 'utf-8'))

httpd = HTTPServer(('localhost', port), Serv)
httpd.serve_forever()

# python sandboxServer.py
