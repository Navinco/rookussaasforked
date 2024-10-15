import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva';
import { Grid, TextField, Button, Box, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import useImage from 'use-image'; // Hook for loading images
import { v4 as uuidv4 } from 'uuid';

// Draggable Text Component with Konva
const DraggableText = ({ text, x, y, id, onDragEnd, onSelect, isSelected, transformerRef }) => {
  const textRef = useRef();

  useEffect(() => {
    if (isSelected) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected, transformerRef]);

  return (
    <>
      <KonvaText
        ref={textRef}
        text={text}
        x={x}
        y={y}
        fontSize={18}
        fill="yellow"
        draggable
        onDragEnd={(e) => onDragEnd(id, e.target.x(), e.target.y())}
        onClick={() => onSelect(id)}
        onTap={() => onSelect(id)}
      />
    </>
  );
};

// Draggable Image Component with Konva
const DraggableImage = ({ src, x, y, id, onDragEnd, onSelect, isSelected, transformerRef }) => {
  const [image] = useImage(src);
  const imageRef = useRef();

  useEffect(() => {
    if (isSelected) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected, transformerRef]);

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={image}
        x={x}
        y={y}
        width={100}
        height={100}
        draggable
        onDragEnd={(e) => onDragEnd(id, e.target.x(), e.target.y())}
        onClick={() => onSelect(id)}
        onTap={() => onSelect(id)}
      />
    </>
  );
};

// Canvas Component using Konva
const Canvas = ({ elements, setElements }) => {
  const [selectedId, setSelectedId] = useState(null);
  const transformerRef = useRef();

  const handleDragEnd = (id, x, y) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, x, y } : el
      )
    );
  };

  const handleDelete = () => {
    if (selectedId) {
      setElements((prev) => prev.filter((el) => el.id !== selectedId));
      setSelectedId(null); // Clear selection after delete
    }
  };

  const handleSelect = (id) => {
    setSelectedId(id === selectedId ? null : id); // Deselect if already selected
  };

  return (
    <>
      <Stage width={window.innerWidth * 0.75} height={500} style={{ backgroundColor: '#1a1a1a' }}>
        <Layer>
          {elements.map((el) => (
            <React.Fragment key={el.id}>
              {el.type === 'text' ? (
                <DraggableText
                  text={el.text}
                  x={el.x}
                  y={el.y}
                  id={el.id}
                  onDragEnd={handleDragEnd}
                  onSelect={handleSelect}
                  isSelected={el.id === selectedId}
                  transformerRef={transformerRef}
                />
              ) : (
                <DraggableImage
                  src={el.src}
                  x={el.x}
                  y={el.y}
                  id={el.id}
                  onDragEnd={handleDragEnd}
                  onSelect={handleSelect}
                  isSelected={el.id === selectedId}
                  transformerRef={transformerRef}
                />
              )}
            </React.Fragment>
          ))}
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
      {selectedId && (
        <Button onClick={handleDelete} variant="contained" sx={{ mt: 2, backgroundColor: '#ff0000', color: '#fff' }}>
          Delete Selected
        </Button>
      )}
    </>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('rookus-express');
  const [userPhoto, setUserPhoto] = useState(null);
  const [tryOnImage, setTryOnImage] = useState(null);
  const [elements, setElements] = useState([]);
  const [newText, setNewText] = useState('');
  const [newImage, setNewImage] = useState(null);

  const handleModelChange = (event) => {
    setModel(event.target.value);
    setPrompt('');
    setImage(null);
    setUserPhoto(null);
    setTryOnImage(null);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleUserPhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUserPhoto(URL.createObjectURL(file));
    }
  };

  const handleTryOnImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTryOnImage(URL.createObjectURL(file));
    }
  };

  const handleAddText = () => {
    if (newText) {
      setElements((prev) => [
        ...prev,
        { type: 'text', text: newText, x: 50, y: 50, id: uuidv4() },
      ]);
      setNewText('');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const uploadedImage = URL.createObjectURL(file);
      setNewImage(uploadedImage);
      setElements((prev) => [
        ...prev,
        { type: 'image', src: uploadedImage, x: 50, y: 50, id: uuidv4() },
      ]);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#1a1a1a', color: '#fff', height: '100vh', padding: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3} sx={{ padding: 3 }}>
          <Typography variant="h5" gutterBottom>
            Model
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: '#ffcc00' }}>Select Model</InputLabel>
            <Select
              value={model}
              onChange={handleModelChange}
              label="Select Model"
              sx={{ color: '#fff', backgroundColor: '#2c2c2c' }}
              inputProps={{ style: { color: '#fff' } }}
              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: '#2c2c2c',
                    color: '#ffcc00',
                  },
                },
              }}
            >
              <MenuItem value="rookus-express">Rookus Express</MenuItem>
              <MenuItem value="rookus-img2img">Rookus Img2Img</MenuItem>
              <MenuItem value="rookus-vrtryon">Rookus VrTryon</MenuItem>
            </Select>
          </FormControl>

          {model === 'rookus-img2img' ? (
            <>
              <Typography variant="h6" gutterBottom>
                Upload Image
              </Typography>
              <Button
                variant="contained"
                component="label"
                sx={{ backgroundColor: '#ffcc00', color: '#000', mb: 2 }}
                fullWidth
              >
                Upload Image
                <input type="file" hidden onChange={handleImageChange} />
              </Button>
              <Typography variant="h6" gutterBottom>
                What do you want to change here?
              </Typography>
              <TextField
                fullWidth
                label="Describe changes"
                variant="outlined"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{ input: { color: '#fff' }, backgroundColor: '#2c2c2c' }}
                InputLabelProps={{ style: { color: '#ffcc00' } }}
              />
            </>
          ) : model === 'rookus-vrtryon' ? (
            <>
              <Typography variant="h6" gutterBottom>
                Upload User Photo
              </Typography>
              <Button
                variant="contained"
                component="label"
                sx={{ backgroundColor: '#ffcc00', color: '#000', mb: 2 }}
                fullWidth
              >
                Upload User Photo
                <input type="file" hidden onChange={handleUserPhotoChange} />
              </Button>
              <Typography variant="h6" gutterBottom>
                Upload Try-On Image
              </Typography>
              <Button
                variant="contained"
                component="label"
                sx={{ backgroundColor: '#ffcc00', color: '#000', mb: 2 }}
                fullWidth
              >
                Upload Try-On Image
                <input type="file" hidden onChange={handleTryOnImageChange} />
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Enter Prompt
              </Typography>
              <TextField
                fullWidth
                label="Enter Prompt"
                variant="outlined"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{ input: { color: '#fff' }, backgroundColor: '#2c2c2c' }}
                InputLabelProps={{ style: { color: '#ffcc00' } }}
              />
            </>
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Add Text to Canvas
          </Typography>
          <TextField
            fullWidth
            label="Enter Text"
            variant="outlined"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            sx={{ input: { color: '#fff' }, backgroundColor: '#2c2c2c' }}
            InputLabelProps={{ style: { color: '#ffcc00' } }}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2, backgroundColor: '#ffcc00', color: '#000' }}
            onClick={handleAddText}
          >
            Add Text
          </Button>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Upload Image to Canvas
          </Typography>
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ backgroundColor: '#ffcc00', color: '#000' }}
          >
            Upload Image
            <input type="file" hidden onChange={handleImageUpload} />
          </Button>
        </Grid>

        <Grid item xs={12} md={9} sx={{ backgroundColor: '#0d0d0d', padding: 3 }}>
          <Canvas elements={elements} setElements={setElements} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
