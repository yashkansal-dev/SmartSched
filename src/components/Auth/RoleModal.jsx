import React from 'react';

const roles = ['Student', 'Faculty', 'Admin'];

const RoleModal = ({ open, onClose, onSelectRole }) => {
  if (!open) return null;

  return (
    <div className="role-modal-backdrop" onClick={onClose}>
      <div className="role-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>Select your role</h3>
        <p>Choose how you plan to use SmartSched.</p>

        <div className="role-options">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              className="role-option-btn"
              onClick={() => onSelectRole(role)}
            >
              {role}
            </button>
          ))}
        </div>

        <button type="button" className="ghost-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RoleModal;
