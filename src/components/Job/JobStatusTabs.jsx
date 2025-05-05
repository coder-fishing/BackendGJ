import React from 'react';
import PropTypes from 'prop-types';

const JobStatusTabs = ({ tabs, activeTab, handleTabChange }) => {
  return (
    <div className="tabs-container">
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
            <span className={`badge ${tab.className || ''}`}>{tab.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

JobStatusTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      className: PropTypes.string
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  handleTabChange: PropTypes.func.isRequired
};

export default JobStatusTabs; 