#!/usr/bin/env python3
import os
import sys
import argparse
import json
import requests
from pathlib import Path
import mimetypes

# Configuration - MODIFY THESE SETTINGS
ALLOWED_DIRECTORIES = [
    os.path.expanduser("~/Documents"),
    os.path.expanduser("~/Desktop"),
    # Add more directories as needed
]

ALLOWED_EXTENSIONS = [
    ".txt", ".md", ".json", ".js", ".py", ".html", ".css", 
    ".csv", ".yml", ".yaml", ".xml", ".log", ".sh"
]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
OLLAMA_API_URL = "http://localhost:11434/api"
DEFAULT_MODEL = "llama2"  # Change to your preferred model

# Security functions
def is_path_allowed(path):
    """Check if a path is within allowed directories"""
    path = os.path.abspath(path)
    return any(path == allowed_dir or path.startswith(os.path.join(allowed_dir, ""))
               for allowed_dir in ALLOWED_DIRECTORIES)

def is_extension_allowed(path):
    """Check if a file extension is allowed"""
    ext = os.path.splitext(path)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def is_file_size_allowed(path):
    """Check if a file size is within limits"""
    return os.path.getsize(path) <= MAX_FILE_SIZE

# File operations
def list_directory(dir_path):
    """List files and directories in a directory"""
    if not is_path_allowed(dir_path):
        return {"error": f"Access to {dir_path} is not allowed"}
    
    if not os.path.exists(dir_path):
        return {"error": f"Directory {dir_path} does not exist"}
    
    if not os.path.isdir(dir_path):
        return {"error": f"{dir_path} is not a directory"}
    
    items = []
    for item in os.listdir(dir_path):
        item_path = os.path.join(dir_path, item)
        is_dir = os.path.isdir(item_path)
        
        try:
            stats = os.stat(item_path)
            items.append({
                "name": item,
                "path": item_path,
                "isDirectory": is_dir,
                "size": None if is_dir else stats.st_size,
                "modified": stats.st_mtime,
                "extension": None if is_dir else os.path.splitext(item)[1].lower()
            })
        except Exception as e:
            items.append({
                "name": item,
                "path": item_path,
                "error": str(e)
            })
    
    return {"path": dir_path, "items": items}

def read_file(file_path):
    """Read a file's contents"""
    if not is_path_allowed(file_path):
        return {"error": f"Access to {file_path} is not allowed"}
    
    if not os.path.exists(file_path):
        return {"error": f"File {file_path} does not exist"}
    
    if not os.path.isfile(file_path):
        return {"error": f"{file_path} is not a file"}
    
    if not is_extension_allowed(file_path):
        return {"error": f"File type {os.path.splitext(file_path)[1]} is not allowed"}
    
    if not is_file_size_allowed(file_path):
        return {"error": f"File size exceeds the maximum allowed size ({MAX_FILE_SIZE/1024/1024}MB)"}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return {
            "path": file_path,
            "content": content,
            "extension": os.path.splitext(file_path)[1].lower()
        }
    except Exception as e:
        return {"error": f"Error reading file: {str(e)}"}

# Ollama API interaction
def query_ollama(model, prompt):
    """Send a query to Ollama API"""
    try:
        response = requests.post(
            f"{OLLAMA_API_URL}/generate",
            json={"model": model, "prompt": prompt, "stream": False}
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": f"Error querying Ollama: {str(e)}"}

def list_ollama_models():
    """List available Ollama models"""
    try:
        response = requests.get(f"{OLLAMA_API_URL}/tags")
        response.raise_for_status()
        return response.json().get("models", [])
    except Exception as e:
        return {"error": f"Error listing Ollama models: {str(e)}"}

# Main interaction functions
def process_file_command(args):
    """Process file-related commands"""
    if args.command == "list":
        if not args.path:
            return {"allowed_directories": ALLOWED_DIRECTORIES}
        return list_directory(args.path)
    
    elif args.command == "read":
        if not args.path:
            return {"error": "File path is required"}
        return read_file(args.path)
    
    elif args.command == "models":
        return {"models": list_ollama_models()}
    
    return {"error": f"Unknown command: {args.command}"}

def process_query_command(args):
    """Process query command with file context"""
    if not args.query:
        return {"error": "Query is required"}
    
    if not args.files:
        return {"error": "At least one file path is required"}
    
    # Read all file contents
    file_contents = []
    for file_path in args.files:
        result = read_file(file_path)
        if "error" in result:
            file_contents.append({
                "path": file_path,
                "content": None,
                "error": result["error"]
            })
        else:
            file_contents.append({
                "path": file_path,
                "content": result["content"],
                "error": None
            })
    
    # Filter out files that couldn't be read
    valid_files = [f for f in file_contents if f["content"] is not None]
    error_files = [f for f in file_contents if f["error"] is not None]
    
    if not valid_files:
        return {
            "error": "None of the provided files could be read",
            "file_errors": error_files
        }
    
    # Create prompt with file context
    prompt = "You are an AI assistant that has access to the following files:\n\n"
    
    for i, file in enumerate(valid_files):
        prompt += f"FILE {i+1}: {file['path']}\n"
        prompt += "```\n"
        prompt += file["content"]
        prompt += "\n```\n\n"
    
    prompt += f"USER QUERY: {args.query}\n\n"
    prompt += "Based on the content of these files, please respond to the query. Reference specific parts of the files when relevant."
    
    # Query Ollama
    model = args.model if args.model else DEFAULT_MODEL
    response = query_ollama(model, prompt)
    
    if "error" in response:
        return response
    
    return {
        "query": args.query,
        "response": response.get("response", ""),
        "model": response.get("model", model),
        "file_errors": error_files if error_files else None
    }

def interactive_mode():
    """Run in interactive mode"""
    print("🤖 Ollama File Access Tool - Interactive Mode")
    print(f"Allowed directories: {', '.join(ALLOWED_DIRECTORIES)}")
    
    # List available models
    models_result = list_ollama_models()
    if isinstance(models_result, list):
        model_names = [m.get("name", "unknown") for m in models_result]
        print(f"Available models: {', '.join(model_names)}")
        model = model_names[0] if model_names else DEFAULT_MODEL
    else:
        print("Could not retrieve models, using default")
        model = DEFAULT_MODEL
    
    print(f"Using model: {model}")
    print("Type 'exit' to quit, 'help' for commands")
    
    current_path = os.path.expanduser("~")
    selected_files = []
    
    while True:
        command = input("\n> ").strip()
        
        if command.lower() == "exit":
            break
        
        if command.lower() == "help":
            print("\nCommands:")
            print("  ls [path]        - List directory contents (defaults to current path)")
            print("  cd <path>        - Change current directory")
            print("  pwd              - Show current directory")
            print("  cat <file>       - Show file contents")
            print("  select <file>    - Add file to selected files")
            print("  unselect <file>  - Remove file from selected files")
            print("  selected         - Show selected files")
            print("  clear            - Clear selected files")
            print("  ask <query>      - Ask a question about selected files")
            print("  model <name>     - Change the Ollama model")
            print("  models           - List available models")
            print("  help             - Show this help")
            print("  exit             - Exit the program")
            continue
        
        parts = command.split(maxsplit=1)
        cmd = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else ""
        
        if cmd == "ls":
            path = arg if arg else current_path
            if not os.path.isabs(path):
                path = os.path.join(current_path, path)
            result = list_directory(path)
            if "error" in result:
                print(f"Error: {result['error']}")
            else:
                print(f"\nContents of {result['path']}:")
                for item in result["items"]:
                    if item.get("isDirectory"):
                        print(f"📁 {item['name']}/")
                    else:
                        size = f"({item['size'] / 1024:.1f} KB)" if item.get('size') else ""
                        print(f"📄 {item['name']} {size}")
        
        elif cmd == "cd":
            if not arg:
                print("Error: Path is required for cd")
                continue
                
            path = arg
            if not os.path.isabs(path):
                path = os.path.join(current_path, path)
            
            if not os.path.exists(path):
                print(f"Error: Path {path} does not exist")
                continue
                
            if not os.path.isdir(path):
                print(f"Error: {path} is not a directory")
                continue
                
            if not is_path_allowed(path):
                print(f"Error: Access to {path} is not allowed")
                continue
                
            current_path = path
            print(f"Changed directory to {current_path}")
        
        elif cmd == "pwd":
            print(f"Current directory: {current_path}")
        
        elif cmd == "cat":
            if not arg:
                print("Error: File path is required")
                continue
                
            path = arg
            if not os.path.isabs(path):
                path = os.path.join(current_path, path)
                
            result = read_file(path)
            if "error" in result:
                print(f"Error: {result['error']}")
            else:
                print(f"\n--- {result['path']} ---")
                print(result["content"])
                print("---")
        
        elif cmd == "select":
            if not arg:
                print("Error: File path is required")
                continue
                
            path = arg
            if not os.path.isabs(path):
                path = os.path.join(current_path, path)
                
            if not os.path.exists(path):
                print(f"Error: File {path} does not exist")
                continue
                
            if not os.path.isfile(path):
                print(f"Error: {path} is not a file")
                continue
                
            if not is_path_allowed(path):
                print(f"Error: Access to {path} is not allowed")
                continue
                
            if path in selected_files:
                print(f"File {path} is already selected")
            else:
                selected_files.append(path)
                print(f"Added {path} to selected files")
        
        elif cmd == "unselect":
            if not arg:
                print("Error: File path is required")
                continue
                
            path = arg
            if not os.path.isabs(path):
                path = os.path.join(current_path, path)
                
            if path in selected_files:
                selected_files.remove(path)
                print(f"Removed {path} from selected files")
            else:
                print(f"File {path} is not in selected files")
        
        elif cmd == "selected":
            if not selected_files:
                print("No files selected")
            else:
                print("\nSelected files:")
                for i, file in enumerate(selected_files):
                    print(f"{i+1}. {file}")
        
        elif cmd == "clear":
            selected_files = []
            print("Cleared selected files")
        
        elif cmd == "ask":
            if not arg:
                print("Error: Query is required")
                continue
                
            if not selected_files:
                print("Error: No files selected. Use 'select <file>' to select files.")
                continue
                
            print(f"\nQuerying {model} about {len(selected_files)} files...")
            result = process_query_command(argparse.Namespace(
                query=arg,
                files=selected_files,
                model=model
            ))
            
            if "error" in result:
                print(f"Error: {result['error']}")
                if result.get("file_errors"):
                    print("File errors:")
                    for err in result["file_errors"]:
                        print(f"  {err['path']}: {err['error']}")
            else:
                print("\n--- Ollama Response ---")
                print(result["response"])
                print("---")
        
        elif cmd == "model":
            if not arg:
                print(f"Current model: {model}")
            else:
                model = arg
                print(f"Changed model to {model}")
        
        elif cmd == "models":
            models_result = list_ollama_models()
            if isinstance(models_result, list):
                print("\nAvailable models:")
                for m in models_result:
                    print(f"  {m.get('name', 'unknown')}")
            else:
                print(f"Error listing models: {models_result.get('error')}")
        
        else:
            print(f"Unknown command: {cmd}. Type 'help' for available commands.")

def main():
    parser = argparse.ArgumentParser(description="Ollama File Access Tool")
    subparsers = parser.add_subparsers(dest="mode", help="Mode")
    
    # File command
    file_parser = subparsers.add_parser("file", help="File operations")
    file_parser.add_argument("command", choices=["list", "read", "models"], help="Command")
    file_parser.add_argument("--path", help="File or directory path")
    
    # Query command
    query_parser = subparsers.add_parser("query", help="Query with file context")
    query_parser.add_argument("--query", required=True, help="Query to send to Ollama")
    query_parser.add_argument("--files", nargs="+", required=True, help="File paths to include as context")
    query_parser.add_argument("--model", help=f"Ollama model to use (default: {DEFAULT_MODEL})")
    
    # Interactive mode
    subparsers.add_parser("interactive", help="Interactive mode")
    
    args = parser.parse_args()
    
    if args.mode == "file":
        result = process_file_command(args)
        print(json.dumps(result, indent=2))
    
    elif args.mode == "query":
        result = process_query_command(args)
        print(json.dumps(result, indent=2))
    
    elif args.mode == "interactive" or not args.mode:
        interactive_mode()
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 