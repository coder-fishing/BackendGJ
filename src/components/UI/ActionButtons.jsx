import React from 'react';
import PropTypes from 'prop-types';
import { FaEye, FaBan, FaTrashAlt, FaCheck } from 'react-icons/fa';
import { MdOutlineRestoreFromTrash } from 'react-icons/md';
import '../../styles/actionButtons.scss';

/**
 * Reusable action buttons component
 * @param {Object} props - Component props
 * @param {Array} props.actions - Array of action objects
 * @param {string} props.variant - Layout variant (default, compact, with-dividers)
 */
const ActionButtons = ({ actions, variant = 'default' }) => {
  // Filter out actions that should not be displayed
  const visibleActions = actions.filter(action => action.show !== false);
  
  // If no visible actions, don't render the component
  if (visibleActions.length === 0) {
    return null;
  }
  
  return (
    <div className={`action-group ${variant}`}>
      {visibleActions.map((action, index) => (
        <button
          key={index}
          className={`action-btn ${action.className || ''}`}
          onClick={action.onClick}
          disabled={action.disabled}
          title={action.title}
          type="button"
          aria-label={action.title}
        >
          {action.loading ? (
            <span className="spinner" />
          ) : (
            action.icon
          )}
        </button>
      ))}
    </div>
  );
};

ActionButtons.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      onClick: PropTypes.func.isRequired,
      title: PropTypes.string.isRequired,
      className: PropTypes.string,
      disabled: PropTypes.bool,
      loading: PropTypes.bool,
      show: PropTypes.bool
    })
  ).isRequired,
  variant: PropTypes.oneOf(['default', 'compact', 'with-dividers'])
};

// Predefined action icons for common operations
export const ActionIcons = {
  view: <FaEye />,
  reject: <FaBan />,
  delete: <FaTrashAlt />,
  restore: <MdOutlineRestoreFromTrash />,
  markRead: <FaCheck />,
  approve: <FaCheck />
};

export { ActionButtons };
export default ActionButtons; 