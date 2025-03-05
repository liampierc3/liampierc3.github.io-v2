import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { importFromText, importFromUrl } from '../services/api';
import '../styles/ImportIdeas.css';

const ImportIdeas = ({ refreshNotes }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleTextImport = async (e) => {
    e.preventDefault();
    
    if (!textContent.trim()) {
      setError('Please enter some text to import');
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await importFromText(textContent);
      setSuccess(`Successfully imported ${result.count} notes!`);
      setTextContent('');
      await refreshNotes();
      
      // Navigate to the first created note if any
      if (result.noteIds && result.noteIds.length > 0) {
        setTimeout(() => {
          navigate(`/notes/${result.noteIds[0]}`);
        }, 1500);
      }
    } catch (err) {
      setError('Failed to import notes. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleUrlImport = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL to import from');
      return;
    }

    // Simple URL validation
    if (!url.match(/^https?:\/\/.+\..+/)) {
      setError('Please enter a valid URL');
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await importFromUrl(url);
      setSuccess(`Successfully imported ${result.count} notes from the URL!`);
      setUrl('');
      await refreshNotes();
      
      // Navigate to the first created note if any
      if (result.noteIds && result.noteIds.length > 0) {
        setTimeout(() => {
          navigate(`/notes/${result.noteIds[0]}`);
        }, 1500);
      }
    } catch (err) {
      setError('Failed to import from URL. Please check the URL and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="import-container">
      <div className="import-header">
        <h1>Import Ideas</h1>
        <p className="import-description">
          Import your ideas from text or web pages to create new notes
        </p>
      </div>

      <div className="import-tabs">
        <button 
          className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          Import from Text
        </button>
        <button 
          className={`tab-button ${activeTab === 'url' ? 'active' : ''}`}
          onClick={() => setActiveTab('url')}
        >
          Import from URL
        </button>
      </div>

      {error && <div className="import-error">{error}</div>}
      {success && <div className="import-success">{success}</div>}

      {activeTab === 'text' ? (
        <form onSubmit={handleTextImport} className="import-form">
          <div className="form-group">
            <label htmlFor="textContent">Paste your text below:</label>
            <textarea
              id="textContent"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste your text here. Our AI will analyze it and create notes automatically."
              className="text-input"
              rows={10}
            />
          </div>
          <div className="import-options">
            <div className="option">
              <input type="checkbox" id="splitByParagraph" defaultChecked />
              <label htmlFor="splitByParagraph">Split by paragraphs</label>
            </div>
            <div className="option">
              <input type="checkbox" id="extractKeywords" defaultChecked />
              <label htmlFor="extractKeywords">Extract keywords as tags</label>
            </div>
          </div>
          <button 
            type="submit" 
            className="import-button"
            disabled={isImporting || !textContent.trim()}
          >
            {isImporting ? 'Importing...' : 'Import Text'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleUrlImport} className="import-form">
          <div className="form-group">
            <label htmlFor="url">Enter URL to import from:</label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="url-input"
            />
          </div>
          <div className="import-options">
            <div className="option">
              <input type="checkbox" id="extractMainContent" defaultChecked />
              <label htmlFor="extractMainContent">Extract main content only</label>
            </div>
            <div className="option">
              <input type="checkbox" id="includeMetadata" defaultChecked />
              <label htmlFor="includeMetadata">Include page metadata</label>
            </div>
          </div>
          <button 
            type="submit" 
            className="import-button"
            disabled={isImporting || !url.trim()}
          >
            {isImporting ? 'Importing...' : 'Import from URL'}
          </button>
        </form>
      )}

      <div className="import-tips">
        <h3>Import Tips</h3>
        <ul>
          <li>For text imports, our AI will automatically organize your content into separate notes</li>
          <li>When importing from URLs, we'll extract the main content and ignore navigation and ads</li>
          <li>You can edit any imported notes afterward to refine them</li>
          <li>Tags are automatically generated based on the content to help with organization</li>
        </ul>
      </div>
    </div>
  );
};

export default ImportIdeas; 