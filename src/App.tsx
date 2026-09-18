import { useState, useCallback, FC } from 'react';
import { ToastProvider, useToast } from './components/Toast/ToastContext';
import { Button } from './components/Button/Button';
import { PlusIcon } from './components/Icons/Icons';
import { useAuth } from './features/auth/hooks/useAuth';
import { AuthDialog } from './features/auth/components/AuthDialog/AuthDialog';
import { useBookSession } from './features/recipes/hooks/useBookSession';
import { useRecipes } from './features/recipes/hooks/useRecipes';
import { CategoryFilter } from './features/recipes/components/CategoryFilter/CategoryFilter';
import { RecipeCard } from './features/recipes/components/RecipeCard/RecipeCard';
import { MagazineView } from './features/recipes/components/MagazineView/MagazineView';
import { EmptyState } from './features/recipes/components/EmptyState/EmptyState';
import { RecipeDialog } from './features/recipe-editor/components/RecipeDialog/RecipeDialog';
import { persistRecipe } from './features/recipes/services/recipeApi';
import type { Recipe, RecipeInput } from './types/recipe';
import styles from './App.module.css';

const AppContent: FC = () => {
  const { user, login, register, logout, getIdToken } = useAuth();
  const { bookId, isInitializing } = useBookSession();
  const {
    recipes,
    filteredRecipes,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    activeView,
    activeRecipe,
    openDetail,
    goBackToList,
    refreshRecipes,
    deleteRecipeItem,
  } = useRecipes(bookId);

  const { showToast } = useToast();

  // Modais de estado
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const handleOpenNewRecipe = useCallback(() => {
    if (!user) {
      showToast('Entre na sua conta para criar novas receitas na nuvem.', 'info');
      setIsAuthOpen(true);
      return;
    }
    setEditingRecipe(null);
    setIsRecipeDialogOpen(true);
  }, [user, showToast]);

  const handleOpenEditRecipe = useCallback(
    (recipe: Recipe) => {
      if (!user) {
        showToast('Faça login para editar esta receita.', 'info');
        setIsAuthOpen(true);
        return;
      }
      setEditingRecipe(recipe);
      setIsRecipeDialogOpen(true);
    },
    [user, showToast]
  );

  const handleSaveRecipe = useCallback(
    async (input: RecipeInput, editId?: string | null) => {
      if (!bookId) throw new Error('Livro de receitas não inicializado.');
      const token = await getIdToken();
      if (!token) {
        setIsAuthOpen(true);
        throw new Error('Você precisa estar autenticado para salvar na nuvem.');
      }

      await persistRecipe(input, bookId, token, editId);
      await refreshRecipes();
    },
    [bookId, getIdToken, refreshRecipes]
  );

  const handleDeleteRecipe = useCallback(
    async (id: string) => {
      const token = await getIdToken();
      if (!token) {
        setIsAuthOpen(true);
        showToast('Acesso restrito. Faça login para excluir.', 'error');
        return;
      }
      await deleteRecipeItem(id, token);
      showToast('Receita excluída do acervo.', 'success');
    },
    [getIdToken, deleteRecipeItem, showToast]
  );

  return (
    <div className="app-container">
      {/* Cabeçalho da Aplicação */}
      <header className={styles.header}>
        <div className={styles.logoGroup} onClick={goBackToList} style={{ cursor: 'pointer' }}>
          <h1 className={styles.logoTitle}>Receitas da Vó</h1>
          <span className={styles.logoSubtitle}>Seu Livro Digital Minimalista</span>
        </div>

        <div className={styles.headerActions}>
          {user ? (
            <>
              <Button
                variant="primary"
                onClick={handleOpenNewRecipe}
                aria-label="Adicionar nova receita"
              >
                <PlusIcon />
                <span>Nova Receita</span>
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={logout}
                aria-label="Sair da conta"
              >
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setIsAuthOpen(true)}
                aria-label="Entrar na conta"
              >
                Entrar
              </Button>
              <Button
                variant="primary"
                onClick={handleOpenNewRecipe}
                aria-label="Adicionar nova receita"
              >
                <PlusIcon />
                <span>Nova Receita</span>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Conteúdo Principal Dinâmico */}
      <main className={styles.main}>
        {isInitializing || (isLoading && recipes.length === 0) ? (
          <div className={styles.loading}>
            <p>Carregando seu livro de receitas digital...</p>
          </div>
        ) : activeView === 'detail' && activeRecipe ? (
          <MagazineView
            recipe={activeRecipe}
            onBack={goBackToList}
            onEdit={handleOpenEditRecipe}
            onDelete={handleDeleteRecipe}
          />
        ) : (
          <>
            {recipes.length > 0 && (
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {filteredRecipes.length === 0 ? (
              recipes.length === 0 ? (
                <EmptyState
                  title="Nenhuma receita por aqui..."
                  description="Que tal começar adicionando sua primeira receita de família ou importando um link qualquer com o Jarvis IA?"
                  actionLabel="Adicionar Receita"
                  onAction={handleOpenNewRecipe}
                />
              ) : (
                <EmptyState
                  title="Nenhuma receita encontrada"
                  description={`Você ainda não tem receitas cadastradas na categoria "${selectedCategory}".`}
                />
              )
            ) : (
              <div className={styles.gridCards}>
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onClick={openDetail}
                    onEdit={handleOpenEditRecipe}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Rodapé Editorial */}
      <footer className={styles.footer}>
        <p>© 2026 Livro de Receitas Digital • Seu acervo culinário elegante e livre de distrações</p>
      </footer>

      {/* Diálogos Modais */}
      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={login}
        onRegister={register}
      />

      <RecipeDialog
        isOpen={isRecipeDialogOpen}
        onClose={() => setIsRecipeDialogOpen(false)}
        initialRecipe={editingRecipe}
        onSave={handleSaveRecipe}
        onDelete={editingRecipe ? handleDeleteRecipe : undefined}
      />
    </div>
  );
};

export const App: FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
