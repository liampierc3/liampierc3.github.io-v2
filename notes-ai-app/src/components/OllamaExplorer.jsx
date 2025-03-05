import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OllamaExplorer.css';
import { searchWithAI } from '../services/api';

const OllamaExplorer = () => {
  const navigate = useNavigate();
  const [directories, setDirectories] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [processingQuery, setProcessingQuery] = useState(false);

  // Fetch allowed directories on component mount
  useEffect(() => {
    fetchDirectories();
    fetchModels();
  }, []);

  // Fetch directories when current path changes
  useEffect(() => {
    if (currentPath) {
      fetchItems(currentPath);
    }
  }, [currentPath]);

  // Fetch allowed directories
  const fetchDirectories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ollama/directories');
      const data = await response.json();
      
      if (data.directories && data.directories.length > 0) {
        setDirectories(data.directories);
        setCurrentPath(data.directories[0]);
      }
      
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch directories: ' + error.message);
      setLoading(false);
    }
  };

  // Fetch available Ollama models
  const fetchModels = async () => {
    try {
      const response = await fetch('/api/ollama/models');
      const data = await response.json();
      
      if (data.models && data.models.length > 0) {
        setModels(data.models);
        setSelectedModel(data.models[0].name);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  // Fetch items in a directory
  const fetchItems = async (path) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ollama/list?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      
      setItems(data.items || []);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch items: ' + error.message);
      setLoading(false);
    }
  };

  // Handle directory selection
  const handleDirectorySelect = (directory) => {
    setCurrentPath(directory);
    setSelectedFiles([]);
  };

  // Handle item click (navigate to directory or select file)
  const handleItemClick = (item) => {
    if (item.isDirectory) {
      setCurrentPath(item.path);
    } else {
      // Toggle file selection
      if (selectedFiles.includes(item.path)) {
        setSelectedFiles(selectedFiles.filter(path => path !== item.path));
      } else {
        setSelectedFiles([...selectedFiles, item.path]);
      }
    }
  };

  // Handle navigation to parent directory
  const handleNavigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    if (parentPath && !directories.includes(parentPath)) {
      setCurrentPath(parentPath);
    } else {
      // If we're at a root directory, show the list of allowed directories
      setCurrentPath('');
    }
  };

  // Handle query submission
  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    
    if (!query.trim() || selectedFiles.length === 0) {
      setError('Please enter a query and select at least one file');
      return;
    }
    
    try {
      setProcessingQuery(true);
      setError(null);
      
      const response = await fetch('/api/ollama/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          files: selectedFiles,
          model: selectedModel
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to process query');
      }
      
      setProcessingQuery(false);
    } catch (error) {
      setError('Failed to process query: ' + error.message);
      setProcessingQuery(false);
    }
  };

  // Create a new note from the Ollama response
  const handleCreateNote = async () => {
    if (!response) return;
    
    try {
      const noteData = {
        title: `Ollama: ${query}`,
        content: `# Query: ${query}\n\n## Response:\n${response.response}\n\n## Files Referenced:\n${selectedFiles.join('\n')}`,
        tags: 'ollama,ai'
      };
      
      const result = await searchWithAI(noteData);
      navigate('/notes');
    } catch (error) {
      setError('Failed to create note: ' + error.message);
    }
  };

  // Render file browser
  const renderFileBrowser = () => {
    if (!currentPath) {
      return (
        <div className="directory-list">
          <h3>Select a directory to explore:</h3>
          <ul>
            {directories.map((dir, index) => (
              <li key={index} onClick={() => handleDirectorySelect(dir)}>
                <span className="directory-icon">📁</span> {dir}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    return (
      <div className="file-browser">
        <div className="path-navigation">
          <button onClick={handleNavigateUp} className="nav-button">
            ⬆️ Up
          </button>
          <div className="current-path">{currentPath}</div>
        </div>
        
        <div className="items-list">
          {items.length === 0 ? (
            <div className="empty-directory">This directory is empty</div>
          ) : (
            <ul>
              {items.map((item, index) => (
                <li 
                  key={index} 
                  onClick={() => handleItemClick(item)}
                  className={`${item.isDirectory ? 'directory-item' : 'file-item'} ${selectedFiles.includes(item.path) ? 'selected' : ''}`}
                >
                  <span className="item-icon">
                    {item.isDirectory ? '📁' : '📄'}
                  </span>
                  <span className="item-name">{item.name}</span>
                  {!item.isDirectory && (
                    <span className="item-size">
                      {Math.round(item.size / 1024)} KB
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ollama-explorer-container">
      <div className="explorer-header">
        <h1>Ollama File Explorer</h1>
        <p className="explorer-description">
          Browse your files and folders, select files to analyze with Ollama, and ask questions about their contents.
        </p>
      </div>
      
      {error && <div className="explorer-error">{error}</div>}
      
      <div className="explorer-content">
        <div className="file-explorer-section">
          <h2>File Explorer</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            renderFileBrowser()
          )}
        </div>
        
        <div className="query-section">
          <h2>Ask Ollama</h2>
          
          <div className="selected-files">
            <h3>Selected Files ({selectedFiles.length})</h3>
            {selectedFiles.length > 0 ? (
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    <span className="file-icon">📄</span>
                    {file.split('/').pop()}
                    <button 
                      className="remove-file" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFiles(selectedFiles.filter(f => f !== file));
                      }}
                    >
                      ✖
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-files">No files selected. Click on files in the explorer to select them.</p>
            )}
          </div>
          
          <form onSubmit={handleSubmitQuery} className="query-form">
            <div className="form-group">
              <label htmlFor="model-select">Select Model:</label>
              <select 
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={processingQuery}
              >
                {models.map((model, index) => (
                  <option key={index} value={model.name}>{model.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="query-input">Your Question:</label>
              <textarea
                id="query-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about the selected files..."
                disabled={processingQuery}
                rows={4}
              />
            </div>
            
            <button 
              type="submit" 
              className="query-button"
              disabled={processingQuery || selectedFiles.length === 0 || !query.trim()}
            >
              {processingQuery ? 'Processing...' : 'Ask Ollama'}
            </button>
          </form>
          
          {response && (
            <div className="response-section">
              <h3>Ollama's Response</h3>
              <div className="response-content">
                <pre>{response.response}</pre>
              </div>
              <button 
                className="create-note-button"
                onClick={handleCreateNote}
              >
                Save as Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OllamaExplorer; 