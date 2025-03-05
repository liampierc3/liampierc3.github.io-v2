import axios from 'axios';

// API base URL - change this to your actual backend URL in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

// Fetch all notes
export const fetchNotes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

// Fetch a single note by ID
export const fetchNote = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching note ${id}:`, error);
    throw error;
  }
};

// Create a new note
export const createNote = async (noteData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

// Update an existing note
export const updateNote = async (id, noteData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating note ${id}:`, error);
    throw error;
  }
};

// Delete a note
export const deleteNote = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting note ${id}:`, error);
    throw error;
  }
};

// Search notes using AI
export const searchNotes = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error searching notes:', error);
    throw error;
  }
};

// Import notes from text
export const importFromText = async (text, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/import/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text,
        splitByParagraph: options.splitByParagraph !== false,
        extractKeywords: options.extractKeywords !== false,
      }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error importing from text:', error);
    throw error;
  }
};

// Import notes from URL
export const importFromUrl = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/import/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url,
        extractMainContent: options.extractMainContent !== false,
        includeMetadata: options.includeMetadata !== false,
      }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error importing from URL:', error);
    throw error;
  }
};

// For development/testing - get mock data if no backend is available
export const getMockNotes = () => {
  return [
    {
      id: 1,
      title: 'React Hooks Overview',
      content: '# React Hooks\n\nHooks are a new addition in React 16.8. They let you use state and other React features without writing a class.\n\n## Basic Hooks\n\n- useState\n- useEffect\n- useContext\n\n## Additional Hooks\n\n- useReducer\n- useCallback\n- useMemo\n- useRef',
      tags: 'react,hooks,frontend',
      createdAt: '2023-05-15T10:30:00Z',
      updatedAt: '2023-05-15T10:30:00Z',
    },
    {
      id: 2,
      title: 'JavaScript Array Methods',
      content: '# Useful JavaScript Array Methods\n\n## map()\nCreates a new array with the results of calling a provided function on every element.\n\n```javascript\nconst numbers = [1, 2, 3, 4];\nconst doubled = numbers.map(num => num * 2); // [2, 4, 6, 8]\n```\n\n## filter()\nCreates a new array with elements that pass the test implemented by the provided function.\n\n```javascript\nconst numbers = [1, 2, 3, 4];\nconst evens = numbers.filter(num => num % 2 === 0); // [2, 4]\n```\n\n## reduce()\nExecutes a reducer function on each element, resulting in a single output value.\n\n```javascript\nconst numbers = [1, 2, 3, 4];\nconst sum = numbers.reduce((total, num) => total + num, 0); // 10\n```',
      tags: 'javascript,arrays,methods',
      createdAt: '2023-05-16T14:20:00Z',
      updatedAt: '2023-05-16T14:20:00Z',
    },
    {
      id: 3,
      title: 'CSS Grid Layout',
      content: '# CSS Grid Layout\n\nCSS Grid Layout is a two-dimensional layout system designed for the web. It lets you lay out items in rows and columns.\n\n## Basic Example\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-gap: 10px;\n}\n```\n\n## Grid Properties\n\n- grid-template-columns\n- grid-template-rows\n- grid-column-gap\n- grid-row-gap\n- grid-gap\n\n## Item Properties\n\n- grid-column\n- grid-row\n- grid-area',
      tags: 'css,grid,layout',
      createdAt: '2023-05-17T09:15:00Z',
      updatedAt: '2023-05-17T09:15:00Z',
    }
  ];
};

// File Upload API
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// AI Search API
export const searchWithAI = async (query) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/search`, { query });
    return response.data;
  } catch (error) {
    console.error('Error searching with AI:', error);
    throw error;
  }
}; 