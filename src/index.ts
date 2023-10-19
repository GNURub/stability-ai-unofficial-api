export interface ImageGeneratorOptions {
  count?: number;
  width?: number;
  height?: number;
  refine?: string;
  scheduler?: string;
  guidanceScale?: number;
  highNoiseFrac?: number;
  promptStrength?: number;
  numInferenceSteps?: number;
}

class ImageGenerator {
  private headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
    Accept: 'application/json',
    'Accept-Language': 'en-US,en;q=0.5',
    Referer: 'https://replicate.com/stability-ai/sdxl',
    'Content-Type': 'application/json',
    Origin: 'https://replicate.com',
    DNT: '1',
    Connection: 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    TE: 'trailers',
  };

  async genImage(
    prompt: string,
    negativePrompt: string = '',
    {
      count,
      width,
      height,
      refine,
      scheduler,
      guidanceScale,
      highNoiseFrac,
      promptStrength,
      numInferenceSteps,
    }: ImageGeneratorOptions = {}
  ) {
    count ??= 1;
    width ??= 1024;
    height ??= 1024;
    refine ??= 'expert_ensemble_refiner';
    scheduler ??= 'DDIM';
    guidanceScale ??= 7.5;
    highNoiseFrac ??= 0.8;
    promptStrength ??= 0.8;
    numInferenceSteps ??= 50;

    try {
      // Check if count is within the valid range
      if (count < 1 || count > 4) {
        throw new Error('Count must be between 1 and 4');
      }

      // Check if width and height are within the valid range
      if (width > 1024 || height > 1024) {
        throw new Error('Width and height must be 1024 or less');
      }

      // Check if scheduler is valid
      const validSchedulers = [
        'DDIM',
        'DPMSolverMultistep',
        'HeunDiscrete',
        'KarrasDPM',
        'K_EULER_ANCESTRAL',
        'K_EULER',
        'PNDM',
      ];
      if (!validSchedulers.includes(scheduler)) {
        throw new Error('Invalid scheduler value');
      }

      // Check if numInferenceSteps is within the valid range
      if (numInferenceSteps < 1 || numInferenceSteps > 500) {
        throw new Error('numInferenceSteps must be between 1 and 500');
      }

      // Check if guidanceScale is within the valid range
      if (guidanceScale < 1 || guidanceScale > 50) {
        throw new Error('guidanceScale must be between 1 and 50');
      }

      // Check if promptStrength is within the valid range
      if (promptStrength > 1) {
        throw new Error('promptStrength must be 1 or less');
      }

      // Check if highNoiseFrac is within the valid range
      if (highNoiseFrac > 1) {
        throw new Error('highNoiseFrac must be 1 or less');
      }

      const url =
        'https://replicate.com/api/models/stability-ai/sdxl/versions/2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2/predictions';

      const data = {
        inputs: {
          width,
          height,
          prompt,
          negative_prompt: negativePrompt,
          refine,
          scheduler,
          num_outputs: count,
          guidance_scale: guidanceScale,
          high_noise_frac: highNoiseFrac,
          prompt_strength: promptStrength,
          num_inference_steps: numInferenceSteps,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      const uuid = responseData.uuid;
      const image_url = await this.getImageUrl(uuid, prompt);
      return image_url;
    } catch (error) {
      throw error;
    }
  }

  private async getImageUrl(
    uuid: string,
    prompt: string
  ): Promise<{
    prompt: string;
    images: string[];
  }> {
    const url = `https://replicate.com/api/models/stability-ai/sdxl/versions/2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2/predictions/${uuid}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();

    if (responseData.prediction.status === 'succeeded') {
      return { prompt, images: responseData.prediction.output_files };
    } else {
      return this.getImageUrl(uuid, prompt);
    }
  }
}

export const imageGenerator = new ImageGenerator();
