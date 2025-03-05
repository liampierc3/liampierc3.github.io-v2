const axios = require('axios');

// Default Ollama API URL (running locally)
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';

/**
 * Generate a response from Ollama
 * @param {string} model - The model to use (e.g., 'llama2', 'mistral', etc.)
 * @param {string} prompt - The prompt to send to Ollama
 * @param {Object} options - Additional options for the Ollama API
 * @returns {Promise<Object>} - The response from Ollama
 */
const generateResponse = async (model, prompt, options = {}) => {
  try {
    const response = await axios.post(`${OLLAMA_API_URL}/generate`, {
      model: model || 'llama2',
      prompt,
      stream: false,
      ...options
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calling Ollama API:', error.message);
    throw new Error(`Failed to call Ollama API: ${error.message}`);
  }
};

/**
 * Generate a response from Ollama with file context
 * @param {string} model - The model to use
 * @param {string} query - The user's query
 * @param {Array<Object>} files - Array of file objects with path and content
 * @returns {Promise<Object>} - The response from Ollama
 */
const generateWithFileContext = async (model, query, files) => {
  // Create a prompt that includes the file contents as context
  let prompt = "You are an AI assistant that has access to the following files:\n\n";
  
  files.forEach((file, index) => {
    prompt += `FILE ${index + 1}: ${file.path}\n`;
    prompt += "```\n";
    prompt += file.content;
    prompt += "\n```\n\n";
  });
  
  prompt += `USER QUERY: ${query}\n\n`;
  prompt += "Based on the content of these files, please respond to the query. Reference specific parts of the files when relevant.";
  
  return generateResponse(model, prompt);
};

/**
 * List available models from Ollama
 * @returns {Promise<Array>} - List of available models
 */
const listModels = async () => {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/tags`);
    return response.data.models || [];
  } catch (error) {
    console.error('Error listing Ollama models:', error.message);
    throw new Error(`Failed to list Ollama models: ${error.message}`);
  }
};

module.exports = {
  generateResponse,
  generateWithFileContext,
  listModels
}; 