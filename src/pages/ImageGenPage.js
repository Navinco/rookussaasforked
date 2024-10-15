import React, { useState } from 'react';
import axios from 'axios';

const ImageGenPage = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleGenerateImage = async () => {
    try {
      const response = await axios.post('/api/generate-image', { prompt });
      setGeneratedImage(response.data.image_url);
    } catch (error) {
      console.error('Error generating image', error);
    }
  };

  return (
    <div>
      <h2>Generate Image via Prompt</h2>
      <input
        type="text"
        placeholder="Enter prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleGenerateImage}>Generate Image</button>

      {generatedImage && (
        <div>
          <img src={generatedImage} alt="Generated" />
        </div>
      )}
    </div>
  );
};

export default ImageGenPage;
