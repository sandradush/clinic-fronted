import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...rest }) => {
  return (
    <div {...rest} className={[ 'ui-card', className ].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
};

export default Card;
