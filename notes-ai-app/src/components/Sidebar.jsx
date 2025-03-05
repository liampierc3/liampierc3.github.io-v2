import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Notes AI</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/notes" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="icon">📝</i> Notes
            </NavLink>
          </li>
          <li>
            <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="icon">🔍</i> AI Search
            </NavLink>
          </li>
          <li>
            <NavLink to="/import" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="icon">📥</i> Import
            </NavLink>
          </li>
          <li>
            <NavLink to="/ollama" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="icon">🤖</i> Ollama Explorer
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>Your Personal Knowledge Base</p>
      </div>
    </div>
  );
};

export default Sidebar; 