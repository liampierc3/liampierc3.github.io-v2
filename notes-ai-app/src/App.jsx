import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import AISearch from './components/AISearch';
import ImportIdeas from './components/ImportIdeas';
import OllamaExplorer from './components/OllamaExplorer';
import { fetchNotes } from './services/api';
import './styles/App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await fetchNotes();
      setNotes(fetchedNotes);
      setError(null);
    } catch (err) {
      setError('Failed to load notes. Please try again later.');
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="content">
          {error && <div className="error-message">{error}</div>}
          
          <Routes>
            <Route 
              path="/" 
              element={<NotesList 
                notes={notes} 
                loading={loading} 
                refreshNotes={loadNotes} 
              />} 
            />
            <Route 
              path="/notes" 
              element={<NotesList 
                notes={notes} 
                loading={loading} 
                refreshNotes={loadNotes} 
              />} 
            />
            <Route 
              path="/notes/:id" 
              element={<NoteEditor 
                selectedNote={selectedNote}
                setSelectedNote={setSelectedNote}
                refreshNotes={loadNotes}
              />} 
            />
            <Route 
              path="/search" 
              element={<AISearch />} 
            />
            <Route 
              path="/import" 
              element={<ImportIdeas 
                refreshNotes={loadNotes} 
              />} 
            />
            <Route 
              path="/ollama" 
              element={<OllamaExplorer />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 