import React from 'react';
import './loadingIndicator.css';

const LoadingIndicator = () => {
  return (
    <div className="lds-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default LoadingIndicator;