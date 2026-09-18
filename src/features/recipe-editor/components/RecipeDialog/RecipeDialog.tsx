import { FC, useState, FormEvent, memo } from 'react';
import type { Recipe, RecipeInput, RecipeCategory } from '../../../../types/recipe';
import { RECIPE_CATEGORIES } from '../../../../types/recipe';
import { Modal } from '../../../../components/Modal/Modal';
import { TextInput, TextArea, Select } from '../../../../components/Input/Input';
import { Button } from '../../../../components/Button/Button';
import { SparkleIcon, DeleteIcon } from '../../../../components/Icons/Icons';
import { useToast } from '../../../../components/Toast/ToastContext';
import { ImageUploader } from '../ImageUploader/ImageUploader';
import { useRecipeForm } from '../../hooks/useRecipeForm';
import { useJarvisImport } from '../../hooks/useJarvisImport';
import styles from './RecipeDialog.module.css';

export interface RecipeDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialRecipe: Recipe | null;
  readonly onSave: (input: RecipeInput, editId?: string | null) => Promise<void>;
  readonly onDelete?: ((id: string) => Promise<void>) | undefined;
}

export const RecipeDialog: FC<RecipeDialogProps> = memo(({
  isOpen,
  onClose,
  initialRecipe,
  onSave,
  onDelete,
}) => {
  const {
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
  } = useRecipeForm(initialRecipe);

  const { isImporting, importFromJarvis } = useJarvisImport();
  const { showToast } = useToast();

  const [aiQuery, setAiQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleJarvisSubmit = async () => {
    if (!aiQuery.trim()) {
      showToast('Insira uma URL ou lista de ingredientes.', 'warning');
      return;
    }
    showToast('Jarvis IA está interpretando a receita...', 'info');
    const result = await importFromJarvis(aiQuery);
    if (result) {
      applyJarvisData(result);
      setAiQuery('');
      showToast('Receita estruturada com sucesso! Ajuste os dados abaixo.', 'success');
    } else {
      showToast('Não foi possível interpretar a receita.', 'error');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validatedInput = validateAndGetInput();
    if (!validatedInput) {
      showToast('Preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(validatedInput, initialRecipe?._id ?? null);
      showToast(initialRecipe ? 'Receita atualizada!' : 'Receita criada com sucesso!', 'success');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar receita.';
      showToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialRecipe || !onDelete) return;
    if (window.confirm(`Deseja realmente excluir "${initialRecipe.title}"?`)) {
      try {
        await onDelete(initialRecipe._id);
        showToast('Receita excluída com sucesso.', 'success');
        onClose();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao excluir receita.';
        showToast(message, 'error');
      }
    }
  };

  const isEditing = Boolean(initialRecipe);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Receita' : 'Nova Receita'}
    >
      {/* Seção Inteligente do Jarvis */}
      <section className={styles.aiSection}>
        <div className={styles.aiHeader}>
          <SparkleIcon />
          <span>Importação Inteligente (Jarvis IA)</span>
        </div>
        <p className={styles.aiDescription}>
          Cole a URL de um site de culinária ou digite ingredientes brutos para preencher tudo automaticamente.
        </p>
        <div className={styles.aiInputRow}>
          <TextInput
            id="ai-query"
            placeholder="Ex: https://tudogostoso.com.br/... ou 'bolo de cenoura com chocolate'"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            disabled={isImporting}
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleJarvisSubmit}
            isLoading={isImporting}
          >
            <SparkleIcon />
            <span>Importar</span>
          </Button>
        </div>
      </section>

      {/* Formulário de Criação/Edição */}
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <TextInput
            id="recipe-title"
            label="Nome da Receita *"
            placeholder="Ex: Bolo de Fubá Cremoso"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            required
          />

          <Select
            id="recipe-category"
            label="Categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value as RecipeCategory)}
          >
            {RECIPE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        <TextArea
          id="recipe-ingredients"
          label="Ingredientes * (Um por linha)"
          placeholder={'3 ovos\n2 xícaras de açúcar\n1 xícara de fubá'}
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          error={errors.ingredients}
          required
        />

        <TextArea
          id="recipe-preparation"
          label="Modo de Preparo * (Um passo por linha)"
          placeholder={'Bata os ovos no liquidificador\nDespeje em uma forma untada\nAsse por 40 minutos a 180ºC'}
          value={preparationText}
          onChange={(e) => setPreparationText(e.target.value)}
          error={errors.preparation}
          required
        />

        <ImageUploader
          imageUrl={imageUrl}
          onImageSelected={(url) => setImageUrl(url)}
          onImageRemoved={() => setImageUrl('')}
        />

        <div className={styles.actions}>
          {isEditing && onDelete && (
            <div className={styles.deleteButtonWrapper}>
              <Button
                type="button"
                variant="danger"
                size="small"
                onClick={handleDelete}
              >
                <DeleteIcon />
                <span>Excluir</span>
              </Button>
            </div>
          )}

          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button type="submit" variant="primary" isLoading={isSaving}>
            Salvar Receita
          </Button>
        </div>
      </form>
    </Modal>
  );
});

RecipeDialog.displayName = 'RecipeDialog';
