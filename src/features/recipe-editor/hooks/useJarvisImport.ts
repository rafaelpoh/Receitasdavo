import { useState, useCallback } from 'react';
import type { JarvisImportResponse } from '../../../types/recipe';
import { parseRecipeWithJarvis } from '../../recipes/services/recipeApi';

export function useJarvisImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const importFromJarvis = useCallback(async (query: string): Promise<JarvisImportResponse | null> => {
    const trimmed = query.trim();
    if (!trimmed) {
      setImportError('Informe uma URL ou lista de ingredientes.');
      return null;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const parsed = await parseRecipeWithJarvis(trimmed);
      return parsed;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao importar receita.';
      setImportError(message);
      return null;
    } finally {
      setIsImporting(false);
    }
  }, []);

  return {
    isImporting,
    importError,
    importFromJarvis,
  };
}
