import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaBell, FaEnvelope, FaClock } from 'react-icons/fa';
import '../../styles/Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('2025-09-03 06:18:02');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
      setCurrentDateTime(formattedDate);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setMessagesOpen(false);
  };

  const toggleMessages = () => {
    setMessagesOpen(!messagesOpen);
    setNotificationsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h1 className="app-title">StudDash</h1>
      </div>

      <div className="datetime-display" title="Current date and time (UTC)">
        <FaClock className="clock-icon" />
        <span className="datetime-text">{currentDateTime}</span>
      </div>

      <div className="search-container">
        <input type="text" placeholder="Search..." className="search-input" />
      </div>

      <div className="navbar-right">
        <div className="icon-container">
          <FaBell className="nav-icon" onClick={toggleNotifications} />
          <span className="badge">3</span>
          {notificationsOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item">
                <h4>Mid-term exam schedule posted</h4>
                <p>2 hours ago</p>
              </div>
              <div className="dropdown-item">
                <h4>New course material available</h4>
                <p>Yesterday</p>
              </div>
              <div className="dropdown-item">
                <h4>Attendance warning</h4>
                <p>2 days ago</p>
              </div>
              <Link to="/notifications" className="see-all">See All Notifications</Link>
            </div>
          )}
        </div>

        <div className="icon-container">
          <FaEnvelope className="nav-icon" onClick={toggleMessages} />
          <span className="badge">2</span>
          {messagesOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item">
                <h4>Prof. Johnson</h4>
                <p>About your project submission...</p>
              </div>
              <div className="dropdown-item">
                <h4>Academic Office</h4>
                <p>Please update your contact details...</p>
              </div>
              <Link to="/messages" className="see-all">See All Messages</Link>
            </div>
          )}
        </div>

        <div className="user-profile">
          <Link to="/profile">
            <img
              src="/images/profile-avatar.jpg"
              alt="Sakthivel P"
              className="avatar"
            />
            <span className="user-name">Sakthivel-P-cse</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;