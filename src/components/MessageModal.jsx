import React from 'react';
import './MessageModal.css';

const MessageModal = ({ message, onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>🎄 You found the gift!</h2>
        <p>{message}</p>
        <div >
          <button onClick={onClose} >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
