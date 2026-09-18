import { useState, useEffect } from 'react';
import { createBookSession } from '../services/recipeApi';

const BOOK_STORAGE_KEY = 'recipe_book_id';

export function useBookSession() {
  const [bookId, setBookId] = useState<string | null>(() => {
    return localStorage.getItem(BOOK_STORAGE_KEY);
  });
  const [isInitializing, setIsInitializing] = useState<boolean>(!bookId);

  useEffect(() => {
    if (bookId) {
      setIsInitializing(false);
      return;
    }

    let isMounted = true;
    async function initSession() {
      try {
        const newBookId = await createBookSession();
        if (isMounted) {
          localStorage.setItem(BOOK_STORAGE_KEY, newBookId);
          setBookId(newBookId);
        }
      } catch (err) {
        console.error('Erro ao inicializar bookId no backend:', err);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [bookId]);

  return { bookId, isInitializing };
}
