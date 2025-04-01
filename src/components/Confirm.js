import React from 'react';
import './Confirm.css';

const Confirm = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <p className='confirm-message'>{message}</p>
        <div className="confirm-buttons">
          <button className="confirm-btn confirm-yes" onClick={onConfirm}>
            はい
          </button>
          <button className="confirm-btn confirm-no" onClick={onCancel}>
            いいえ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirm;