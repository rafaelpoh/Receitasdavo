import { useState, useEffect, useCallback } from 'react';
import {
  Recipe,
  RecipeInput,
  RecipeCategory,
  RecipeInputSchema,
  JarvisImportResponse,
} from '../../../types/recipe';

export function useRecipeForm(initialRecipe: Recipe | null) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('Outros');
  const [ingredientsText, setIngredientsText] = useState('');
  const [preparationText, setPreparationText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialRecipe) {
      setTitle(initialRecipe.title);
      setCategory(initialRecipe.category);
      setIngredientsText(initialRecipe.ingredients.join('\n'));
      setPreparationText(initialRecipe.preparation.join('\n'));
      setImageUrl(initialRecipe.imageUrl || '');
    } else {
      setTitle('');
      setCategory('Outros');
      setIngredientsText('');
      setPreparationText('');
      setImageUrl('');
    }
    setErrors({});
  }, [initialRecipe]);

  const applyJarvisData = useCallback((data: JarvisImportResponse) => {
    setTitle(data.titulo);
    setCategory(data.categoria);
    setIngredientsText(data.ingredientes.join('\n'));
    setPreparationText(data.modo_preparo.join('\n'));
    setErrors({});
  }, []);

  const validateAndGetInput = useCallback((): RecipeInput | null => {
    const ingredients = ingredientsText
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);

    const preparation = preparationText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const rawInput = {
      title: title.trim(),
      category,
      ingredients,
      preparation,
      imageUrl,
    };

    const result = RecipeInputSchema.safeParse(rawInput);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];
        if (typeof fieldName === 'string') {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return null;
    }

    setErrors({});
    return result.data;
  }, [title, category, ingredientsText, preparationText, imageUrl]);

  return {
    title,
    setTitle,
    category,
    setCategory,
    ingredientsText,
    setIngredientsText,
    preparationText,
    setPreparationText,
    imageUrl,
    setImageUrl,
    errors,
    applyJarvisData,
    validateAndGetInput,
  };
}
