export interface ProcessedImage {
  readonly base64: string;
  readonly contentType: string;
  readonly dataUrl: string;
}

/**
 * Redimensiona e comprime uma imagem no lado do cliente utilizando Canvas HTML5.
 * Limita largura/altura a no máximo 800px em formato JPEG (qualidade 0.8),
 * economizando largura de banda de rede e armazenamento no backend.
 */
export function resizeImageWithCanvas(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter contexto 2D do Canvas.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1] ?? '';

        resolve({
          base64,
          contentType: 'image/jpeg',
          dataUrl,
        });
      };

      img.onerror = () => reject(new Error('Falha ao decodificar imagem.'));
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Falha na leitura do arquivo local.'));
    reader.readAsDataURL(file);
  });
}
