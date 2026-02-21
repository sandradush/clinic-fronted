import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div>
      {label && (
        <label className="ui-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className={`ui-input ${error ? 'border-red-400' : ''} ${className}`.trim()} {...props} />
      {error && <span className="text-red-600 text-sm mt-1 block">{error}</span>}
    </div>
  );
};

export default Input;
