import React from 'react';

type ButtonVariant = 'primary' | 'primary-dark' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const variantClass =
    variant === 'primary-dark' ? 'ui-btn-primary-dark' :
    variant === 'secondary' ? 'ui-btn-secondary' :
    'ui-btn-primary';
  return <button className={`ui-btn ${variantClass} ${className}`.trim()} {...props} />;
};

export default Button;
