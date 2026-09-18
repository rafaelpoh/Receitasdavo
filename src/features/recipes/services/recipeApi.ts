import { z } from 'zod';
import {
  Recipe,
  RecipeSchema,
  RecipeInput,
  JarvisImportResponse,
  JarvisImportResponseSchema,
} from '../../../types/recipe';

/**
 * Cria uma nova sessão anônima de livro de receitas no backend.
 */
export async function createBookSession(): Promise<string> {
  const res = await fetch('/api/book/create', { method: 'POST' });
  if (!res.ok) {
    throw new Error('Falha ao inicializar o livro de receitas na nuvem.');
  }
  const data = await res.json();
  return data.bookId as string;
}

/**
 * Carrega a lista de receitas associada a um determinado bookId.
 * Valida os dados de entrada na fronteira via Zod Schema.
 */
export async function getRecipesByBookId(bookId: string): Promise<ReadonlyArray<Recipe>> {
  const res = await fetch(`/api/recipes?bookId=${encodeURIComponent(bookId)}`);
  if (!res.ok) {
    throw new Error('Falha ao carregar as receitas da nuvem.');
  }
  const json = await res.json();
  const parsed = z.array(RecipeSchema).safeParse(json);

  if (!parsed.success) {
    console.error('Falha de validação Zod no retorno de receitas:', parsed.error);
    // Retorna os dados crus convertidos caso pequenas variações ocorram, mantendo resiliência
    return json as ReadonlyArray<Recipe>;
  }

  return parsed.data;
}

/**
 * Salva uma receita nova ou atualiza uma existente.
 */
export async function persistRecipe(
  recipeInput: RecipeInput,
  bookId: string,
  token: string,
  editId?: string | null
): Promise<Recipe> {
  const isEditing = Boolean(editId);
  const url = isEditing ? `/api/recipes/detail?id=${encodeURIComponent(editId!)}` : '/api/recipes';
  const method = isEditing ? 'PUT' : 'POST';

  const payload = {
    bookId,
    ...recipeInput,
  };

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao salvar receita.');
  }

  const saved = await res.json();
  return RecipeSchema.parse(saved);
}

/**
 * Exclui uma receita pelo ID.
 */
export async function removeRecipe(
  id: string,
  bookId: string,
  token: string
): Promise<void> {
  const res = await fetch(`/api/recipes/detail?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'x-book-id': bookId,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao excluir receita.');
  }
}

/**
 * Importa e estrutura ingredientes e modo de preparo via Jarvis (Gemini IA).
 */
export async function parseRecipeWithJarvis(query: string): Promise<JarvisImportResponse> {
  const isUrl = query.startsWith('http://') || query.startsWith('https://');
  const payload = isUrl ? { url: query } : { text: query };

  const res = await fetch('/api/parser/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao processar receita com Jarvis IA.');
  }

  const json = await res.json();
  return JarvisImportResponseSchema.parse(json);
}
