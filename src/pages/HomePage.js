import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Line, Transformer } from 'react-konva';
import { Grid, TextField, Button, Box, Typography, MenuItem, Select, FormControl, InputLabel, ToggleButtonGroup, ToggleButton } from '@mui/material';
import useImage from 'use-image'; // Hook for loading images
import { v4 as uuidv4 } from 'uuid';

// Simulated background removal function
const removeBackground = async (imageFile) => {
  // Mock background removal (replace with API call)
  return URL.createObjectURL(imageFile);
};

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

// Canvas Component with Drawing Functionality
const Canvas = ({ elements, setElements }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const transformerRef = useRef();
  const stageRef = useRef();

  const handleMouseDown = (e) => {
    if (!isDrawing) return;

    const pos = stageRef.current.getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || lines.length === 0) return;

    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

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
      <Stage
        ref={stageRef}
        width={window.innerWidth * 0.75}
        height={500}
        style={{ backgroundColor: '#1a1a1a' }}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
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
          {lines.map((line, index) => (
            <Line
              key={index}
              points={line.points}
              stroke="#ffcc00"
              strokeWidth={3}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation="source-over"
            />
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
  const [drawMode, setDrawMode] = useState(false); // Track draw mode

  const handleModelChange = (event) => {
    setModel(event.target.value);
    setPrompt('');
    setImage(null);
    setUserPhoto(null);
    setTryOnImage(null);
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const processedImage = await removeBackground(file);
      setImage(processedImage);
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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const processedImage = await removeBackground(file);
      setNewImage(processedImage);
      setElements((prev) => [
        ...prev,
        { type: 'image', src: processedImage, x: 50, y: 50, id: uuidv4() },
      ]);
    }
  };

  const handleToggleDrawMode = () => {
    setDrawMode((prevMode) => !prevMode); // Toggle draw mode
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
              sx={{ backgroundColor: '#333', color: '#fff', borderColor: '#ffcc00' }}
            >
              <MenuItem value="rookus-express">Rookus Express</MenuItem>
              <MenuItem value="diffusion-model">Diffusion Model</MenuItem>
            </Select>
          </FormControl>

          {/* Draw Mode Toggle */}
          <Typography variant="h6">Draw Mode</Typography>
          <ToggleButtonGroup
            value={drawMode ? 'enabled' : 'disabled'}
            exclusive
            onChange={handleToggleDrawMode}
            aria-label="draw mode"
            sx={{ mb: 3 }}
          >
            <ToggleButton value="enabled" aria-label="enabled" sx={{ color: '#fff' }}>
              Enabled
            </ToggleButton>
            <ToggleButton value="disabled" aria-label="disabled" sx={{ color: '#fff' }}>
              Disabled
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Add Text Field */}
          <TextField
            label="Add Text"
            variant="outlined"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            fullWidth
            sx={{ mb: 2, backgroundColor: '#333', input: { color: '#ffcc00' } }}
          />
          <Button variant="contained" onClick={handleAddText} fullWidth sx={{ backgroundColor: '#ffcc00', mb: 2 }}>
            Add Text
          </Button>

          {/* Add Image */}
          <Typography variant="h6" gutterBottom>
            Add Image
          </Typography>
          <Button variant="contained" component="label" fullWidth sx={{ backgroundColor: '#ffcc00' }}>
            Upload Image
            <input type="file" hidden onChange={handleImageUpload} />
          </Button>
        </Grid>

        <Grid item xs={12} md={9}>
          {/* Canvas */}
          <Canvas elements={elements} setElements={setElements} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
