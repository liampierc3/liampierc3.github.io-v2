const fs = require('fs').promises;
const path = require('path');
const { allowedDirectories, maxFileSize, allowedExtensions } = require('../config/ollama');

/**
 * Check if a path is within allowed directories
 * @param {string} targetPath - Path to check
 * @returns {boolean} - Whether the path is allowed
 */
const isPathAllowed = (targetPath) => {
  const normalizedPath = path.normalize(targetPath);
  return allowedDirectories.some(dir => {
    const normalizedDir = path.normalize(dir);
    return normalizedPath === normalizedDir || normalizedPath.startsWith(normalizedDir + path.sep);
  });
};

/**
 * Check if a file extension is allowed
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether the file extension is allowed
 */
const isExtensionAllowed = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return allowedExtensions.includes(ext);
};

/**
 * List files and directories in a directory
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<Array>} - Array of file and directory objects
 */
const listDirectory = async (dirPath) => {
  if (!isPathAllowed(dirPath)) {
    throw new Error('Access to this directory is not allowed');
  }

  const items = await fs.readdir(dirPath, { withFileTypes: true });
  
  const result = await Promise.all(items.map(async (item) => {
    const itemPath = path.join(dirPath, item.name);
    const isDir = item.isDirectory();
    
    let stats;
    try {
      stats = await fs.stat(itemPath);
    } catch (error) {
      return {
        name: item.name,
        path: itemPath,
        isDirectory: isDir,
        error: 'Unable to read file stats'
      };
    }
    
    return {
      name: item.name,
      path: itemPath,
      isDirectory: isDir,
      size: isDir ? null : stats.size,
      modified: stats.mtime,
      extension: isDir ? null : path.extname(item.name).toLowerCase()
    };
  }));
  
  return result;
};

/**
 * Read a file's contents
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - File contents
 */
const readFile = async (filePath) => {
  if (!isPathAllowed(filePath)) {
    throw new Error('Access to this file is not allowed');
  }
  
  if (!isExtensionAllowed(filePath)) {
    throw new Error('This file type is not allowed');
  }
  
  const stats = await fs.stat(filePath);
  
  if (stats.size > maxFileSize) {
    throw new Error(`File size exceeds the maximum allowed size (${maxFileSize / 1024 / 1024}MB)`);
  }
  
  return fs.readFile(filePath, 'utf8');
};

/**
 * Get allowed directories
 * @returns {Array<string>} - List of allowed directories
 */
const getAllowedDirectories = () => {
  return allowedDirectories;
};

module.exports = {
  listDirectory,
  readFile,
  isPathAllowed,
  isExtensionAllowed,
  getAllowedDirectories
}; 