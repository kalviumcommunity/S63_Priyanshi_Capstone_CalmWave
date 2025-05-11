import React, { useState } from 'react';
import '../styles/ConfirmModal.css';

/**
 * A reusable confirmation modal component for critical actions
 */
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'danger',
  requireTypedConfirmation = false,
  confirmationWord = 'CONFIRM'
}) => {
  const [typedConfirmation, setTypedConfirmation] = useState('');
  
  if (!isOpen) return null;
  
  const handleConfirm = () => {
    if (requireTypedConfirmation && typedConfirmation !== confirmationWord) {
      alert(`Please type "${confirmationWord}" to confirm this action.`);
      return;
    }
    onConfirm();
    setTypedConfirmation('');
  };
  
  const handleClose = () => {
    onClose();
    setTypedConfirmation('');
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p>{message}</p>
          
          {requireTypedConfirmation && (
            <div className="typed-confirmation">
              <p>Please type <strong>{confirmationWord}</strong> to confirm:</p>
              <input
                type="text"
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                placeholder={`Type ${confirmationWord} here`}
              />
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleClose}>
            {cancelText}
          </button>
          <button 
            className={`btn-${confirmButtonClass}`} 
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;