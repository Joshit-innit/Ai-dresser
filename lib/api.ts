import axios from 'axios';

type ProcessingStage =
  | 'uploading'
  | 'extracting'
  | 'analyzing'
  | 'trying-on'
  | 'refining'
  | 'quality-check'
  | 'complete';

interface ProcessVirtualTryOnParams {
  shirt: File;
  trousers: File;
  shoes: File;
  modelImage?: File | null;
  onProgress?: (stage: ProcessingStage, progress: number) => void;
}

export async function processVirtualTryOn({
  shirt,
  trousers,
  shoes,
  modelImage,
  onProgress,
}: ProcessVirtualTryOnParams): Promise<string> {
  const formData = new FormData();
  formData.append('shirt', shirt);
  formData.append('trousers', trousers);
  formData.append('shoes', shoes);

  if (modelImage) {
    formData.append('model', modelImage);
  }

  try {
    onProgress?.('uploading', 10);

    const response = await axios.post('/api/try-on', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
          onProgress?.('uploading', progress);
        }
      },
    });

    let currentStage: ProcessingStage = 'extracting';
    let currentProgress = 50;

    const pollInterval = setInterval(() => {
      if (currentStage === 'quality-check' && currentProgress >= 95) {
        clearInterval(pollInterval);
        onProgress?.('complete', 100);
        return;
      }

      if (currentProgress >= 80 && currentStage === 'trying-on') {
        currentStage = 'refining';
        currentProgress = 85;
      } else if (currentProgress >= 90 && currentStage === 'refining') {
        currentStage = 'quality-check';
        currentProgress = 95;
      } else {
        currentProgress += 5;
      }

      if (currentStage === 'extracting' && currentProgress >= 60) {
        currentStage = 'analyzing';
      } else if (currentStage === 'analyzing' && currentProgress >= 70) {
        currentStage = 'trying-on';
      }

      onProgress?.(currentStage, currentProgress);
    }, 1000);

    const result = response.data;

    clearInterval(pollInterval);
    onProgress?.('complete', 100);

    if (result.error) {
      throw new Error(result.error);
    }

    return result.imageUrl || result.image || '/api/placeholder-result.jpg';
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unknown virtual try-on error');
  }
}
