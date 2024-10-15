import React, { useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image'; // For loading the image

const MockupPage = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [mockup, setMockup] = useState(null);


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h2>Apply Image on Mockup</h2>
      <input type="file" onChange={handleImageUpload} />

      {uploadedImage && (
        <Stage width={window.innerWidth} height={window.innerHeight}>
          <Layer>
            <KonvaImage image={mockup} x={100} y={100} width={500} height={500} />
            <KonvaImage image={uploadedImage} x={150} y={150} width={300} height={300} />
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default MockupPage;
