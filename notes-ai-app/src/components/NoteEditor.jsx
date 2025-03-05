import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { fetchNote, updateNote } from '../services/api';
import '../styles/NoteEditor.css';

const NoteEditor = ({ selectedNote, setSelectedNote, refreshNotes }) => {
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadNote = async () => {
      try {
        // If we already have the selected note, use it
        if (selectedNote && selectedNote.id === parseInt(id)) {
          setNote(selectedNote);
          setTitle(selectedNote.title);
          setContent(selectedNote.content || '');
          setTags(selectedNote.tags || '');
        } else {
          // Otherwise fetch it from the API
          const fetchedNote = await fetchNote(id);
          setNote(fetchedNote);
          setSelectedNote(fetchedNote);
          setTitle(fetchedNote.title);
          setContent(fetchedNote.content || '');
          setTags(fetchedNote.tags || '');
        }
      } catch (err) {
        setError('Failed to load note. It may have been deleted or you may not have permission to view it.');
      }
    };

    if (id) {
      loadNote();
    }
  }, [id, selectedNote, setSelectedNote]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedNote = await updateNote(id, {
        title,
        content,
        tags
      });
      
      setNote(updatedNote);
      setSelectedNote(updatedNote);
      await refreshNotes();
      setIsSaving(false);
    } catch (err) {
      setError('Failed to save note. Please try again.');
      setIsSaving(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleBack = () => {
    navigate('/notes');
  };

  if (error) {
    return (
      <div className="note-editor-container">
        <div className="alert alert-error">{error}</div>
        <button onClick={handleBack} className="back-btn">Back to Notes</button>
      </div>
    );
  }

  if (!note) {
    return <div className="loading">Loading note...</div>;
  }

  return (
    <div className="note-editor-container">
      <div className="note-editor-header">
        <button onClick={handleBack} className="back-btn">
          ← Back
        </button>
        <div className="note-editor-actions">
          <button 
            onClick={toggleEditMode} 
            className={isEditing ? 'view-btn' : 'edit-btn'}
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          {isEditing && (
            <button 
              onClick={handleSave} 
              disabled={isSaving || !title.trim()}
              className="save-btn"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="note-editor-edit-mode">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="note-title-input"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note content here... Markdown is supported!"
            className="note-content-input"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="note-tags-input"
          />
        </div>
      ) : (
        <div className="note-editor-preview-mode">
          <h1 className="note-preview-title">{title}</h1>
          {tags && (
            <div className="note-preview-tags">
              {tags.split(',').map((tag, index) => (
                <span key={index} className="tag">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
          <div className="note-preview-content">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="empty-content">This note is empty. Click Edit to add content.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditor; 