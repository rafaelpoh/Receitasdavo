import { FC, memo } from 'react';
import { FILTER_CATEGORIES, FilterCategory } from '../../../../types/recipe';
import styles from './CategoryFilter.module.css';

export interface CategoryFilterProps {
  readonly selectedCategory: FilterCategory;
  readonly onSelectCategory: (category: FilterCategory) => void;
}

export const CategoryFilter: FC<CategoryFilterProps> = memo(({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <nav className={styles.filterBar} aria-label="Filtrar receitas por categoria">
      {FILTER_CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`${styles.filterBtn} ${selectedCategory === cat ? styles.active : ''}`}
          onClick={() => onSelectCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
});

CategoryFilter.displayName = 'CategoryFilter';
