import { ButtonHTMLAttributes, FC, memo } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'text';
  readonly size?: 'small' | 'medium' | 'large';
  readonly isLoading?: boolean;
}

export const Button: FC<ButtonProps> = memo(({
  children,
  variant = 'secondary',
  size = 'medium',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantClass = styles[variant] || styles.secondary;
  const sizeClass = size === 'small' ? styles.small : size === 'large' ? styles.large : '';

  return (
    <button
      className={`${styles.button} ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Aguarde...' : children}
    </button>
  );
});

Button.displayName = 'Button';
