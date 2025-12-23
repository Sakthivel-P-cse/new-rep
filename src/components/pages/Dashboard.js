import React from 'react';
import FileManagement from '../widgets/FileManagement';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Welcome back to your learning portal</p>
      </div>
      
      <div className="dashboard-content">
        <div className="widgets-grid">
          <FileManagement />
          {/* Additional widgets can be added here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;