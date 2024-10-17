import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Line, Rect, Circle, Transformer } from 'react-konva';
import { Grid, TextField, Button, Box, Typography } from '@mui/material';
import useImage from 'use-image'; // Hook for loading images
import { v4 as uuidv4 } from 'uuid';
import { ChromePicker } from 'react-color'; // Color picker component

// Draggable Text Component with Konva
const DraggableText = ({ text, x, y, id, onDragEnd, onSelect, isSelected, transformerRef, color }) => {
  const textRef = useRef();

  useEffect(() => {
    if (isSelected) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected, transformerRef]);

  return (
    <KonvaText
      ref={textRef}
      text={text}
      x={x}
      y={y}
      fontSize={18}
      fill={color}
      draggable
      onDragEnd={(e) => onDragEnd(id, e.target.x(), e.target.y())}
      onClick={() => onSelect(id)}
      onTap={() => onSelect(id)}
    />
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
  );
};

// Draggable Shape Components with Konva
const DraggableShape = ({ type, x, y, id, onDragEnd, onSelect, isSelected, transformerRef, color }) => {
  const shapeRef = useRef();

  useEffect(() => {
    if (isSelected) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected, transformerRef]);

  return (
    <>
      {type === 'rect' && (
        <Rect
          ref={shapeRef}
          x={x}
          y={y}
          width={100}
          height={100}
          fill={color}
          shadowBlur={10}
          draggable
          onDragEnd={(e) => onDragEnd(id, e.target.x(), e.target.y())}
          onClick={() => onSelect(id)}
          onTap={() => onSelect(id)}
        />
      )}
      {type === 'circle' && (
        <Circle
          ref={shapeRef}
          x={x}
          y={y}
          radius={50}
          fill={color}
          draggable
          onDragEnd={(e) => onDragEnd(id, e.target.x(), e.target.y())}
          onClick={() => onSelect(id)}
          onTap={() => onSelect(id)}
        />
      )}
    </>
  );
};

// Canvas Component with Drawing and Shapes Functionality
const Canvas = ({ elements, setElements, color }) => {
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
                  color={el.color}
                />
              ) : el.type === 'image' ? (
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
              ) : (
                <DraggableShape
                  type={el.type}
                  x={el.x}
                  y={el.y}
                  id={el.id}
                  onDragEnd={handleDragEnd}
                  onSelect={handleSelect}
                  isSelected={el.id === selectedId}
                  transformerRef={transformerRef}
                  color={el.color}
                />
              )}
            </React.Fragment>
          ))}
          {lines.map((line, index) => (
            <Line
              key={index}
              points={line.points}
              stroke={color}
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

// Toolbox Component
const Toolbox = ({ onAddShape, color, setColor }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, backgroundColor: '#3f51b5', padding: 2, borderRadius: 1 }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>Shapes</Typography>
      <Button onClick={() => onAddShape('rect')} variant="contained" sx={{ backgroundColor: '#ff9800', color: '#fff', mb: 1 }}>
        Add Rectangle
      </Button>
      <Button onClick={() => onAddShape('circle')} variant="contained" sx={{ backgroundColor: '#ff9800', color: '#fff' }}>
        Add Circle
      </Button>
      <Typography variant="h6" sx={{ color: '#fff', mt: 2 }}>Select Color</Typography>
      <ChromePicker color={color} onChange={(newColor) => setColor(newColor.hex)} />
    </Box>
  );
};

// Rookus Express UI Component
const RookusExpress = ({ prompt, setPrompt, dressType, setDressType, color, setColor }) => {
  const handleGenerate = () => {
    const finalPrompt = `${dressType} of ${color} where artist is ${prompt}`;
    console.log('Generated Mockup: ', finalPrompt);
    // Trigger the mockup generation based on the finalPrompt
  };

  return (
    <Box sx={{ mb: 2, backgroundColor: '#2e2e2e', padding: 2, borderRadius: 1 }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Rookus Express - Generate Mockup</Typography>
      <TextField
        label="Artist Action"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: '#fff' } }}
        inputProps={{ style: { color: '#fff' } }}
      />
      <TextField
        label="Dress Type"
        value={dressType}
        onChange={(e) => setDressType(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: '#fff' } }}
        inputProps={{ style: { color: '#fff' } }}
      />
      <TextField
        label="Dress Color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: '#fff' } }}
        inputProps={{ style: { color: '#fff' } }}
      />
      <Button onClick={handleGenerate} variant="contained" sx={{ backgroundColor: '#4caf50', color: '#fff' }}>
        Generate Mockup
      </Button>
    </Box>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [elements, setElements] = useState([]);
  const [newText, setNewText] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [color, setColor] = useState('#000000');
  const [prompt, setPrompt] = useState('');
  const [dressType, setDressType] = useState('');

  const addNewText = () => {
    if (newText) {
      setElements((prev) => [...prev, { id: uuidv4(), text: newText, x: 50, y: 50, type: 'text', color }]);
      setNewText('');
    }
  };

  const addNewImage = () => {
    if (newImage) {
      setElements((prev) => [...prev, { id: uuidv4(), src: newImage, x: 50, y: 50, type: 'image' }]);
      setNewImage(null); // Clear after adding
    }
  };

  const addShape = (shapeType) => {
    setElements((prev) => [...prev, { id: uuidv4(), x: 100, y: 100, type: shapeType, color }]);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <Box sx={{ p: 2 }}>
          <TextField
            label="Enter Text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: '#fff' } }}
            inputProps={{ style: { color: '#fff' } }}
          />
          <Button onClick={addNewText} variant="contained" sx={{ backgroundColor: '#4caf50', color: '#fff', mb: 2 }}>
            Add Text
          </Button>
          <Toolbox onAddShape={addShape} color={color} setColor={setColor} />
          <RookusExpress prompt={prompt} setPrompt={setPrompt} dressType={dressType} setDressType={setDressType} color={color} setColor={setColor} />
        </Box>
      </Grid>
      <Grid item xs={12} md={9}>
        <Canvas elements={elements} setElements={setElements} color={color} />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
