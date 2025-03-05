#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os

# Configure the server
PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

# Print server info
print(f"Starting local server at http://localhost:{PORT}")
print("To view your first-person experience, visit:")
print(f"http://localhost:{PORT}/first-person-experience.html")
print("\nPress Ctrl+C to stop the server")

# Open the browser automatically
webbrowser.open(f"http://localhost:{PORT}/first-person-experience.html")

# Start the server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.") 