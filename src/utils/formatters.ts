/**
 * Formata datas de forma legível no padrão pt-BR.
 */
export function formatDate(dateVal: string | Date | undefined | null): string {
  if (!dateVal) return 'Data não informada';
  const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  if (isNaN(date.getTime())) return 'Data inválida';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Monta o link público para compartilhamento social da receita.
 */
export function formatShareUrl(recipeId: string): string {
  return `${window.location.origin}/share.html?id=${encodeURIComponent(recipeId)}`;
}
