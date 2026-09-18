import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  error,
  id,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={styles.group}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <input
        ref={ref}
        id={id}
        className={`${styles.input} ${className}`.trim()}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
});

TextInput.displayName = 'TextInput';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label?: string;
  readonly error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  id,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={styles.group}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <textarea
        ref={ref}
        id={id}
        className={`${styles.textarea} ${className}`.trim()}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label?: string;
  readonly error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  id,
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={styles.group}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <select
        ref={ref}
        id={id}
        className={`${styles.select} ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
