const express = require('express');
const router = express.Router();
const { listDirectory, readFile, getAllowedDirectories } = require('../utils/fileSystem');
const { generateResponse, generateWithFileContext, listModels } = require('../services/ollamaService');
const path = require('path');

/**
 * @route GET /api/ollama/directories
 * @desc Get list of allowed directories
 * @access Public
 */
router.get('/directories', (req, res) => {
  try {
    const directories = getAllowedDirectories();
    res.json({ directories });
  } catch (error) {
    console.error('Error getting allowed directories:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/ollama/list
 * @desc List files and directories in a directory
 * @access Public
 */
router.get('/list', async (req, res) => {
  try {
    const { path: dirPath } = req.query;
    
    if (!dirPath) {
      return res.status(400).json({ error: 'Directory path is required' });
    }
    
    const items = await listDirectory(dirPath);
    res.json({ path: dirPath, items });
  } catch (error) {
    console.error('Error listing directory:', error);
    res.status(error.message.includes('not allowed') ? 403 : 500).json({ error: error.message });
  }
});

/**
 * @route GET /api/ollama/read
 * @desc Read a file's contents
 * @access Public
 */
router.get('/read', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    const content = await readFile(filePath);
    res.json({ 
      path: filePath, 
      content,
      extension: path.extname(filePath).toLowerCase()
    });
  } catch (error) {
    console.error('Error reading file:', error);
    const statusCode = error.message.includes('not allowed') ? 403 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * @route GET /api/ollama/models
 * @desc List available Ollama models
 * @access Public
 */
router.get('/models', async (req, res) => {
  try {
    const models = await listModels();
    res.json({ models });
  } catch (error) {
    console.error('Error listing Ollama models:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/ollama/query
 * @desc Query Ollama with context from files
 * @access Public
 */
router.post('/query', async (req, res) => {
  try {
    const { query, files, model } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'At least one file path is required' });
    }
    
    // Read all file contents
    const fileContents = await Promise.all(
      files.map(async (filePath) => {
        try {
          const content = await readFile(filePath);
          return {
            path: filePath,
            content,
            error: null
          };
        } catch (error) {
          return {
            path: filePath,
            content: null,
            error: error.message
          };
        }
      })
    );
    
    // Filter out files that couldn't be read
    const validFiles = fileContents.filter(file => file.content !== null);
    const errorFiles = fileContents.filter(file => file.error !== null);
    
    if (validFiles.length === 0) {
      return res.status(400).json({ 
        error: 'None of the provided files could be read',
        fileErrors: errorFiles
      });
    }
    
    // Call Ollama API with file context
    const response = await generateWithFileContext(model || 'llama2', query, validFiles);
    
    res.json({
      query,
      response: response.response,
      model: response.model,
      fileErrors: errorFiles.length > 0 ? errorFiles : undefined
    });
  } catch (error) {
    console.error('Error processing Ollama query:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/ollama/generate
 * @desc Generate a response from Ollama without file context
 * @access Public
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, model, options } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const response = await generateResponse(model || 'llama2', prompt, options);
    
    res.json(response);
  } catch (error) {
    console.error('Error generating Ollama response:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 