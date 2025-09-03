import React from 'react';
import { FaFile, FaFileAlt, FaFilePdf, FaFileCode, FaFileImage, FaFolder } from 'react-icons/fa';
import '../../styles/FileManagement.css';

const FileManagement = () => {
  // Sample file data - in a real app, this would come from an API
  const fileStats = {
    total: 128,
    documents: 42,
    pdfs: 36,
    code: 24,
    images: 18,
    other: 8
  };

  // Calculate percentages for chart
  const calculatePercentage = (value) => {
    return (value / fileStats.total) * 100;
  };

  return (
    <div className="file-management-widget widget">
      <div className="widget-header">
        <FaFolder className="widget-icon" />
        <h3>File Management</h3>
      </div>
      <div className="widget-content file-management-content">
        <div className="file-stats-container">
          <div className="file-stats-total">
            <h4>Total Files</h4>
            <div className="total-files">{fileStats.total}</div>
            <div className="last-updated">Last updated: 2025-09-03 06:18:02</div>
          </div>

          <div className="file-chart-container" aria-hidden>
            <div className="file-chart" role="img" aria-label="File type distribution">
              <div className="chart-segment documents" style={{ width: `${calculatePercentage(fileStats.documents)}%` }} />
              <div className="chart-segment pdfs" style={{ width: `${calculatePercentage(fileStats.pdfs)}%` }} />
              <div className="chart-segment code" style={{ width: `${calculatePercentage(fileStats.code)}%` }} />
              <div className="chart-segment images" style={{ width: `${calculatePercentage(fileStats.images)}%` }} />
              <div className="chart-segment other" style={{ width: `${calculatePercentage(fileStats.other)}%` }} />
            </div>
          </div>
        </div>

        <div className="file-types-list">
          <div className="file-type-item">
            <div className="file-type-icon documents">
              <FaFileAlt />
            </div>
            <div className="file-type-details">
              <div className="file-type-name">Documents</div>
              <div className="file-type-count">{fileStats.documents} files</div>
            </div>
            <div className="file-type-percentage">{Math.round(calculatePercentage(fileStats.documents))}%</div>
          </div>

          <div className="file-type-item">
            <div className="file-type-icon pdfs">
              <FaFilePdf />
            </div>
            <div className="file-type-details">
              <div className="file-type-name">PDFs</div>
              <div className="file-type-count">{fileStats.pdfs} files</div>
            </div>
            <div className="file-type-percentage">{Math.round(calculatePercentage(fileStats.pdfs))}%</div>
          </div>

          <div className="file-type-item">
            <div className="file-type-icon code">
              <FaFileCode />
            </div>
            <div className="file-type-details">
              <div className="file-type-name">Code Files</div>
              <div className="file-type-count">{fileStats.code} files</div>
            </div>
            <div className="file-type-percentage">{Math.round(calculatePercentage(fileStats.code))}%</div>
          </div>

          <div className="file-type-item">
            <div className="file-type-icon images">
              <FaFileImage />
            </div>
            <div className="file-type-details">
              <div className="file-type-name">Images</div>
              <div className="file-type-count">{fileStats.images} files</div>
            </div>
            <div className="file-type-percentage">{Math.round(calculatePercentage(fileStats.images))}%</div>
          </div>

          <div className="file-type-item">
            <div className="file-type-icon other">
              <FaFile />
            </div>
            <div className="file-type-details">
              <div className="file-type-name">Other Files</div>
              <div className="file-type-count">{fileStats.other} files</div>
            </div>
            <div className="file-type-percentage">{Math.round(calculatePercentage(fileStats.other))}%</div>
          </div>
        </div>
      </div>
      <a href="/files" className="widget-link">Manage Files</a>
    </div>
  );
};

export default FileManagement;