// Configuration for Ollama integration
const path = require('path');
const os = require('os');

// Define allowed directories that Ollama can access
// IMPORTANT: Be careful with what directories you allow access to for security reasons
const allowedDirectories = [
  // Example: Allow access to the user's Documents folder
  path.join(os.homedir(), 'Documents'),
  // Example: Allow access to the user's Desktop folder
  path.join(os.homedir(), 'Desktop'),
  // Add more directories as needed
];

// Maximum file size that can be read (in bytes)
const maxFileSize = 10 * 1024 * 1024; // 10MB

// File extensions that are allowed to be read
const allowedExtensions = [
  '.txt', '.md', '.json', '.js', '.jsx', '.ts', '.tsx', 
  '.html', '.css', '.csv', '.yml', '.yaml', '.xml',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'
];

module.exports = {
  allowedDirectories,
  maxFileSize,
  allowedExtensions
}; 