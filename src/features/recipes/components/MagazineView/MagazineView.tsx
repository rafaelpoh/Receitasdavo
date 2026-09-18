import { FC, useState, useCallback, memo } from 'react';
import type { Recipe } from '../../../../types/recipe';
import { sanitizeUrl } from '../../../../utils/sanitize';
import { formatShareUrl } from '../../../../utils/formatters';
import { Button } from '../../../../components/Button/Button';
import { useToast } from '../../../../components/Toast/ToastContext';
import {
  BackIcon,
  ShareIcon,
  EditIcon,
  DeleteIcon,
} from '../../../../components/Icons/Icons';
import styles from './MagazineView.module.css';

export interface MagazineViewProps {
  readonly recipe: Recipe;
  readonly onBack: () => void;
  readonly onEdit: (recipe: Recipe) => void;
  readonly onDelete: (id: string) => void;
}

export const MagazineView: FC<MagazineViewProps> = memo(({
  recipe,
  onBack,
  onEdit,
  onDelete,
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState<ReadonlySet<number>>(
    new Set()
  );
  const { showToast } = useToast();

  const toggleIngredient = useCallback((index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleShare = useCallback(async () => {
    const url = formatShareUrl(recipe._id);
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link de compartilhamento copiado!', 'success');
    } catch {
      showToast(`Link copiado: ${url}`, 'info', 6000);
    }
  }, [recipe._id, showToast]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Deseja realmente excluir a receita "${recipe.title}"?`)) {
      onDelete(recipe._id);
    }
  }, [recipe._id, recipe.title, onDelete]);

  const safeImageUrl = sanitizeUrl(recipe.imageUrl);

  return (
    <article className={styles.article}>
      <div className={styles.actionBar}>
        <Button variant="text" onClick={onBack}>
          <BackIcon />
          <span>Voltar para o acervo</span>
        </Button>

        <div className={styles.actionGroup}>
          <Button variant="secondary" size="small" onClick={handleShare}>
            <ShareIcon />
            <span>Compartilhar</span>
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onEdit(recipe)}
          >
            <EditIcon />
            <span>Editar</span>
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={handleDelete}
          >
            <DeleteIcon />
            <span>Excluir</span>
          </Button>
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.meta}>
          Categoria: <strong>{recipe.category}</strong>
        </div>
        <h1 className={styles.title}>{recipe.title}</h1>
      </header>

      {safeImageUrl && (
        <div className={styles.heroImageWrapper}>
          <img
            src={safeImageUrl}
            alt={recipe.title}
            className={styles.heroImage}
          />
        </div>
      )}

      <div className={styles.body}>
        <section className={styles.ingredientsColumn}>
          <h2 className={styles.sectionTitle}>Ingredientes</h2>
          <ul className={styles.ingredientsList}>
            {recipe.ingredients.map((ing, idx) => {
              const isChecked = checkedIngredients.has(idx);
              return (
                <li
                  key={`${recipe._id}-ing-${idx}`}
                  className={styles.ingredientItem}
                  onClick={() => toggleIngredient(idx)}
                >
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={isChecked}
                    onChange={() => toggleIngredient(idx)}
                    aria-label={ing}
                  />
                  <span
                    className={`${styles.ingredientText} ${
                      isChecked ? styles.checkedText : ''
                    }`}
                  >
                    {ing}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.preparationColumn}>
          <h2 className={styles.sectionTitle}>Modo de Preparo</h2>
          <ol className={styles.preparationList}>
            {recipe.preparation.map((step, idx) => (
              <li
                key={`${recipe._id}-prep-${idx}`}
                className={styles.preparationItem}
              >
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
});

MagazineView.displayName = 'MagazineView';
