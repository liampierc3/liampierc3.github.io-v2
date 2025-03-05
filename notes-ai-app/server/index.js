require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
const sqlite3 = require('sqlite3').verbose();

// Import routes
const ollamaRoutes = require('./routes/ollama');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../data/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Database setup
const dbPath = path.join(__dirname, '../data/notes.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');
    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Routes

// Register Ollama routes
app.use('/api/ollama', ollamaRoutes);

// Get all notes
app.get('/api/notes', (req, res) => {
  db.all('SELECT * FROM notes ORDER BY updated_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a single note
app.get('/api/notes/:id', (req, res) => {
  db.get('SELECT * FROM notes WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(row);
  });
});

// Create a new note
app.post('/api/notes', (req, res) => {
  const { title, content, tags } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const sql = 'INSERT INTO notes (title, content, tags) VALUES (?, ?, ?)';
  db.run(sql, [title, content, tags], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM notes WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// Update a note
app.put('/api/notes/:id', (req, res) => {
  const { title, content, tags } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const sql = `
    UPDATE notes 
    SET title = ?, content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  
  db.run(sql, [title, content, tags, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    db.get('SELECT * FROM notes WHERE id = ?', [req.params.id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row);
    });
  });
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  db.run('DELETE FROM notes WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  
  // Read the file content
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading file' });
    }
    
    // Create a new note with the file content
    const title = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const content = data;
    const tags = 'imported';
    
    const sql = 'INSERT INTO notes (title, content, tags) VALUES (?, ?, ?)';
    db.run(sql, [title, content, tags], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        id: this.lastID,
        title,
        message: 'File uploaded and note created successfully'
      });
    });
  });
});

// AI search endpoint
app.post('/api/ai/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Get all notes from the database
    db.all('SELECT * FROM notes', async (err, notes) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Prepare the notes for the AI
      const notesContext = notes.map(note => 
        `Note ID: ${note.id}\nTitle: ${note.title}\nContent: ${note.content}\nTags: ${note.tags || 'None'}\n---\n`
      ).join('\n');
      
      // Query the OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that searches through notes and provides relevant information. Return only the most relevant notes that match the query, with their IDs and titles."
          },
          {
            role: "user",
            content: `Here are my notes:\n\n${notesContext}\n\nSearch query: ${query}`
          }
        ],
        max_tokens: 500
      });
      
      res.json({
        results: completion.choices[0].message.content,
        notes: notes // Include the full notes for client-side filtering if needed
      });
    });
  } catch (error) {
    console.error('Error with AI search:', error);
    res.status(500).json({ error: 'Error processing AI search' });
  }
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Ollama integration available at http://localhost:${PORT}/api/ollama`);
}); 