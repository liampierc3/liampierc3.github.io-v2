import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNote, deleteNote } from '../services/api';
import '../styles/NotesList.css';

const NotesList = ({ notes, loading, error, onSelectNote, selectedNote, refreshNotes }) => {
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const navigate = useNavigate();

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    
    setIsCreating(true);
    setCreateError(null);
    
    try {
      const newNote = await createNote({
        title: newNoteTitle,
        content: '',
        tags: ''
      });
      
      setNewNoteTitle('');
      await refreshNotes();
      onSelectNote(newNote);
      navigate(`/notes/${newNote.id}`);
    } catch (err) {
      setCreateError('Failed to create note. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    try {
      await deleteNote(id);
      await refreshNotes();
      if (selectedNote && selectedNote.id === id) {
        onSelectNote(null);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleNoteClick = (note) => {
    onSelectNote(note);
    navigate(`/notes/${note.id}`);
  };

  if (loading) {
    return <div className="loading">Loading notes...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="notes-list-container">
      <div className="notes-list-header">
        <h1>My Notes</h1>
        <form onSubmit={handleCreateNote} className="create-note-form">
          <input
            type="text"
            placeholder="New note title..."
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            disabled={isCreating}
          />
          <button type="submit" disabled={isCreating || !newNoteTitle.trim()}>
            {isCreating ? 'Creating...' : 'Create Note'}
          </button>
        </form>
        {createError && <div className="alert alert-error">{createError}</div>}
      </div>
      
      {notes.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any notes yet. Create your first note to get started!</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div 
              key={note.id} 
              className={`note-card ${selectedNote && selectedNote.id === note.id ? 'selected' : ''}`}
              onClick={() => handleNoteClick(note)}
            >
              <h3 className="note-title">{note.title}</h3>
              <p className="note-preview">
                {note.content ? (
                  note.content.length > 100 
                    ? `${note.content.substring(0, 100)}...` 
                    : note.content
                ) : (
                  <span className="empty-note">Empty note</span>
                )}
              </p>
              <div className="note-footer">
                <span className="note-date">
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>
                <button 
                  className="delete-btn"
                  onClick={(e) => handleDeleteNote(note.id, e)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList; 