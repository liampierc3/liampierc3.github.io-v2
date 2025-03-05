#!/bin/bash

echo "Starting local web server for 3D experience testing..."

# Check if Python 3 is installed
if command -v python3 &>/dev/null; then
    echo "Using Python 3 to start server"
    python3 -m http.server 8000
# Fall back to Python 2 if necessary
elif command -v python &>/dev/null; then
    echo "Using Python 2 to start server"
    python -m SimpleHTTPServer 8000
# Fall back to npx if available
elif command -v npx &>/dev/null; then
    echo "Using Node.js to start server"
    npx http-server -p 8000
else
    echo "Error: Couldn't find Python or Node.js to start a server."
    echo "Please install Python 3 or Node.js and try again."
    exit 1
fi

echo "Server stopped." 