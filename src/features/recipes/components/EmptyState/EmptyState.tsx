import { FC, memo } from 'react';
import { Button } from '../../../../components/Button/Button';
import { PlusIcon } from '../../../../components/Icons/Icons';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

export const EmptyState: FC<EmptyStateProps> = memo(({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          <PlusIcon />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
