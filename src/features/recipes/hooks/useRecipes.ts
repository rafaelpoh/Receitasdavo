import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe, FilterCategory } from '../../../types/recipe';
import { getRecipesByBookId, removeRecipe } from '../services/recipeApi';

export function useRecipes(bookId: string | null) {
  const [recipes, setRecipes] = useState<ReadonlyArray<Recipe>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('Todas');
  const [activeView, setActiveView] = useState<'list' | 'detail'>('list');
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    if (!bookId) return;
    setIsLoading(true);
    try {
      const data = await getRecipesByBookId(bookId);
      setRecipes(data);
    } catch (err) {
      console.error('Erro ao buscar receitas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const filteredRecipes = useMemo(() => {
    if (selectedCategory === 'Todas') return recipes;
    return recipes.filter((r) => r.category === selectedCategory);
  }, [recipes, selectedCategory]);

  const activeRecipe = useMemo(() => {
    if (!activeRecipeId) return null;
    return recipes.find((r) => r._id === activeRecipeId) ?? null;
  }, [recipes, activeRecipeId]);

  const openDetail = useCallback((id: string) => {
    setActiveRecipeId(id);
    setActiveView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBackToList = useCallback(() => {
    setActiveView('list');
    setActiveRecipeId(null);
  }, []);

  const deleteRecipeItem = useCallback(
    async (id: string, token: string) => {
      if (!bookId) return;
      await removeRecipe(id, bookId, token);
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      if (activeRecipeId === id) {
        goBackToList();
      }
    },
    [bookId, activeRecipeId, goBackToList]
  );

  return {
    recipes,
    filteredRecipes,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    activeView,
    activeRecipe,
    openDetail,
    goBackToList,
    refreshRecipes: fetchRecipes,
    deleteRecipeItem,
  };
}
