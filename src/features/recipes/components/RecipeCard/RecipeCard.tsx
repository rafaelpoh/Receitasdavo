import { FC, memo, MouseEvent } from 'react';
import type { Recipe } from '../../../../types/recipe';
import { formatDate } from '../../../../utils/formatters';
import { sanitizeUrl } from '../../../../utils/sanitize';
import { EditIcon } from '../../../../components/Icons/Icons';
import styles from './RecipeCard.module.css';

export interface RecipeCardProps {
  readonly recipe: Recipe;
  readonly onClick: (id: string) => void;
  readonly onEdit: (recipe: Recipe) => void;
}

export const RecipeCard: FC<RecipeCardProps> = memo(({ recipe, onClick, onEdit }) => {
  const safeImageUrl = sanitizeUrl(recipe.imageUrl);
  const initial = recipe.title.trim().charAt(0).toUpperCase() || 'R';

  const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEdit(recipe);
  };

  return (
    <article
      className={styles.card}
      onClick={() => onClick(recipe._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(recipe._id);
        }
      }}
      aria-label={`Ver detalhes da receita: ${recipe.title}`}
    >
      <div className={styles.imageWrapper}>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.editButton}
            onClick={handleEditClick}
            aria-label={`Editar ${recipe.title}`}
          >
            <EditIcon width={12} height={12} />
            <span>Editar</span>
          </button>
        </div>

        {safeImageUrl ? (
          <img
            src={safeImageUrl}
            alt={recipe.title}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderInitial}>{initial}</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <span className={styles.category}>{recipe.category}</span>
        <h3 className={styles.title}>{recipe.title}</h3>
        <span className={styles.meta}>
          Salva em {formatDate(recipe.createdAt)}
        </span>
      </div>
    </article>
  );
});

RecipeCard.displayName = 'RecipeCard';
