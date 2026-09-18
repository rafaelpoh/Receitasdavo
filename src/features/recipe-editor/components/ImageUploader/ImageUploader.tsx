import { FC, useRef, ChangeEvent, DragEvent, memo } from 'react';
import { resizeImageWithCanvas } from '../../../../utils/image';
import { sanitizeUrl } from '../../../../utils/sanitize';
import { UploadIcon, CloseIcon } from '../../../../components/Icons/Icons';
import styles from './ImageUploader.module.css';

export interface ImageUploaderProps {
  readonly imageUrl?: string;
  readonly onImageSelected: (dataUrl: string) => void;
  readonly onImageRemoved: () => void;
  readonly isOptimizing?: boolean;
}

export const ImageUploader: FC<ImageUploaderProps> = memo(({
  imageUrl,
  onImageSelected,
  onImageRemoved,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const { dataUrl } = await resizeImageWithCanvas(file);
      onImageSelected(dataUrl);
    } catch (err) {
      console.error('Erro ao otimizar imagem no cliente:', err);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const safeUrl = sanitizeUrl(imageUrl || '');

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>Foto do Prato</label>

      <div
        className={styles.dropzone}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            inputRef.current?.click();
          }
        }}
      >
        {safeUrl ? (
          <>
            <img src={safeUrl} alt="Visualização do prato" className={styles.preview} />
            <button
              type="button"
              className={styles.removeButton}
              onClick={(e) => {
                e.stopPropagation();
                onImageRemoved();
              }}
              aria-label="Remover foto"
            >
              <CloseIcon width={14} height={14} />
            </button>
          </>
        ) : (
          <div className={styles.placeholder}>
            <UploadIcon />
            <p>Clique ou arraste uma foto para cá</p>
            <span className={styles.hint}>
              Otimização e corte automático inteligente no seu navegador
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />
    </div>
  );
});

ImageUploader.displayName = 'ImageUploader';
