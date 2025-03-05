import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchNotes } from '../services/api';
import '../styles/AISearch.css';

const AISearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const searchResults = await searchNotes(query);
      setResults(searchResults);
      
      // Add to search history if not already there
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev].slice(0, 5));
      }
    } catch (err) {
      setError('Failed to search notes. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem);
    // Trigger search immediately
    searchNotes(historyItem)
      .then(searchResults => {
        setResults(searchResults);
      })
      .catch(err => {
        setError('Failed to search notes. Please try again.');
      });
  };

  const handleViewNote = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return <div className="searching-indicator">Searching your notes...</div>;
    }

    if (results.length === 0 && query && !isSearching) {
      return <div className="no-results">No notes found matching your query.</div>;
    }

    return (
      <div className="search-results">
        {results.map(note => (
          <div key={note.id} className="search-result-item" onClick={() => handleViewNote(note.id)}>
            <h3 className="result-title">{note.title}</h3>
            <p className="result-preview">{note.preview}</p>
            {note.relevance && (
              <div className="result-relevance">
                <span className="relevance-label">Relevance:</span>
                <div className="relevance-bar">
                  <div 
                    className="relevance-fill" 
                    style={{ width: `${Math.min(100, note.relevance * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
            {note.tags && (
              <div className="result-tags">
                {note.tags.split(',').map((tag, index) => (
                  <span key={index} className="tag">{tag.trim()}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="ai-search-container">
      <div className="search-header">
        <h1>AI-Powered Search</h1>
        <p className="search-description">
          Ask questions in natural language to find relevant notes
        </p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question or search for keywords..."
            className="search-input"
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <div className="search-error">{error}</div>}
      </form>

      {searchHistory.length > 0 && (
        <div className="search-history">
          <h3>Recent Searches</h3>
          <div className="history-items">
            {searchHistory.map((item, index) => (
              <button 
                key={index} 
                className="history-item"
                onClick={() => handleHistoryClick(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {renderSearchResults()}

      <div className="search-tips">
        <h3>Search Tips</h3>
        <ul>
          <li>Ask specific questions like "What did I learn about React hooks?"</li>
          <li>Include keywords related to your topic</li>
          <li>Try different phrasings if you don't get the results you expect</li>
          <li>Use tags in your notes to improve searchability</li>
        </ul>
      </div>
    </div>
  );
};

export default AISearch; 