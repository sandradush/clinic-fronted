import React from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const variantClass = variant === 'primary' ? 'ui-btn-primary' : 'ui-btn-secondary';
  return <button className={`ui-btn ${variantClass} ${className}`.trim()} {...props} />;
};

export default Button;
