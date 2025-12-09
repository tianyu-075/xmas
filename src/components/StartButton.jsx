
import React from 'react';
import './StartButton.css';

const StartButton = ({ onStart }) => {
  return (
    <div className="start-button-container">
      <button className="start-button" onClick={onStart}>
        Start to find your present
      </button>
    </div>
  );
};

export default StartButton;