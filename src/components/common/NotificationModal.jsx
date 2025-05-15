import React, { useEffect } from 'react';
import { IoMdCheckmarkCircle, IoMdWarning } from 'react-icons/io';

const NotificationModal = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className={`notification-modal ${type}`}>
        <div className="modal-icon">
          {type === 'success' ? (
            <IoMdCheckmarkCircle className="success-icon" />
          ) : (
            <IoMdWarning className="error-icon" />
          )}
        </div>
        <div className="modal-content">
          <h3>{type === 'success' ? 'Success!' : 'Error!'}</h3>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal; 