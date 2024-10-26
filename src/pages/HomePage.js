import { MenuItem, Select, IconButton, Tooltip } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Line, Rect, Circle, Transformer } from 'react-konva';
import { Grid, TextField, Button, Box, Typography } from '@mui/material';
import useImage from 'use-image';
import { v4 as uuidv4 } from 'uuid';
import { ChromePicker } from 'react-color';
import ClearIcon from '@mui/icons-material/Clear';
import RectangleIcon from '@mui/icons-material/Rectangle'; // Rectangle shape icon
import CircleIcon from '@mui/icons-material/Circle'; // Circle shape icon
import TextFieldsIcon from '@mui/icons-material/TextFields'; // Text icon
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto'; // Image icon
import ColorLensIcon from '@mui/icons-material/ColorLens'; // Color picker icon



// Draggable Text Component with Konva
const DraggableText = ({ text, x, y, id, onDragEnd, onSelect, isSelected, transformerRef, color, fontFamily }) => {
  const textRef = useRef();

  useEffect(() => {
    if (isSelected) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer().batchDraw();
    } else {
      transformerRef.current.nodes([]); // Clear transformer nodes if not selected
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
      fontFamily={fontFamily}
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
    } else {
      transformerRef.current.nodes([]); // Clear transformer nodes if not selected
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

// Draggable Shape Component with Konva
const DraggableShape = ({ type, x, y, id, onDragEnd, onSelect, isSelected, transformerRef, color }) => {
  const shapeRef = useRef();

  useEffect(() => {
    if (isSelected) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    } else {
      transformerRef.current.nodes([]); // Clear transformer nodes if not selected
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
    if (id === selectedId) {
      setSelectedId(null); // Deselect if already selected
    } else {
      setSelectedId(id); // Select new id
    }
  };

  return (
    <>
      <Stage
        ref={stageRef}
        width={window.innerWidth * 0.75}
        height={700}
        style={{ backgroundColor: '#1a1a1a' }}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          {elements.map((el) => {
            if (el.type === 'text') {
              return (
                <DraggableText
                  key={el.id}
                  text={el.text}
                  x={el.x}
                  y={el.y}
                  id={el.id}
                  onDragEnd={handleDragEnd}
                  onSelect={handleSelect}
                  isSelected={el.id === selectedId}
                  transformerRef={transformerRef}
                  color={el.color}
                  fontFamily={el.fontFamily}
                />
              );
            }
            if (el.type === 'image') {
              return (
                <DraggableImage
                  key={el.id}
                  src={el.src}
                  x={el.x}
                  y={el.y}
                  id={el.id}
                  onDragEnd={handleDragEnd}
                  onSelect={handleSelect}
                  isSelected={el.id === selectedId}
                  transformerRef={transformerRef}
                />
              );
            }
            return (
              <DraggableShape
                key={el.id}
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
            );
          })}
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
        <Tooltip title="Delete Selected">
          <IconButton onClick={handleDelete} sx={{ mt: 2, color: '#ff0000' }}>
            <ClearIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

// Toolbox Component
// Compact Toolbox Component (Icon-based)
const Toolbox = ({ onAddShape, color, setColor }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: '#3f51b5',
        padding: '4px', // Reduce padding
        borderRadius: '8px',
        width: '100%',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Tooltip title="Add Rectangle">
        <IconButton onClick={() => onAddShape('rect')} sx={{ color: '#fff', padding: '4px' }}>
          <RectangleIcon fontSize="small" /> {/* Use small icons */}
        </IconButton>
      </Tooltip>
      <Tooltip title="Add Circle">
        <IconButton onClick={() => onAddShape('circle')} sx={{ color: '#fff', padding: '4px' }}>
          <CircleIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add Text">
        <IconButton onClick={() => onAddShape('text')} sx={{ color: '#fff', padding: '4px' }}>
          <TextFieldsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add Image">
        <IconButton onClick={() => onAddShape('image')} sx={{ color: '#fff', padding: '4px' }}>
          <InsertPhotoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Select Color">
        <IconButton sx={{ color: '#fff', padding: '4px' }}>
          <ColorLensIcon fontSize="small" />
        </IconButton>
        <ChromePicker
          color={color}
          onChangeComplete={(newColor) => setColor(newColor.hex)}
          disableAlpha
          style={{ position: 'absolute', zIndex: 2 }} // Make sure color picker is visible
        />
      </Tooltip>
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
      <Typography variant="h6" sx={{ color: '#fff' }}>Generate Mockup</Typography>
      <TextField
        label="Enter Artist Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        fullWidth
        sx={{ mb: 1 }}
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
  const [newImageFile, setNewImageFile] = useState(null);
  const [color, setColor] = useState('#000000');
  const [prompt, setPrompt] = useState('');
  const [dressType, setDressType] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [showTextOptions, setShowTextOptions] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);


  const addNewText = () => {
    if (newText) {
      setElements((prev) => [...prev, { id: uuidv4(), text: newText, x: 50, y: 50, type: 'text', color, fontFamily }]);
      setNewText(''); // Clear input after adding
    }
  };

  const addNewImage = () => {
    if (newImageFile) {
      const imageUrl = URL.createObjectURL(newImageFile);
      setElements((prev) => [...prev, { id: uuidv4(), src: imageUrl, x: 50, y: 50, type: 'image' }]);
      setNewImageFile(null); // Clear after adding
    }
  };

  const addShape = (shapeType) => {
    setElements((prev) => [...prev, { id: uuidv4(), x: 100, y: 100, type: shapeType, color }]);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <Box sx={{ p: 2, height: '100vh', backgroundColor: '#2c2c2c', borderRadius: 1, overflowY: 'auto' }}>
          
          {/* Button to show/hide text input options */}
          <Button
            onClick={() => setShowTextOptions((prev) => !prev)}
            variant="contained"
            sx={{ backgroundColor: '#4caf50', color: '#fff', mb: 2 }}
          >
            {showTextOptions ? 'Hide Text Options' : 'Add Text'}
          </Button>
          
          {showTextOptions && (
            <>
              <TextField
                label="Enter Text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: '#fff' } }}
                inputProps={{ style: { color: '#fff' } }}
              />
              
              {/* Font Selection Dropdown */}
              <Select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                fullWidth
                sx={{ mb: 2, color: '#fff', backgroundColor: '#1a1a1a', borderRadius: '4px' }}
              >
                <MenuItem value="Arial">Arial</MenuItem>
                <MenuItem value="Courier New">Courier New</MenuItem>
                <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                <MenuItem value="Comic Sans MS">Comic Sans MS</MenuItem>
              </Select>
  
              <Button onClick={addNewText} variant="contained" sx={{ backgroundColor: '#4caf50', color: '#fff', mb: 2 }}>
                Add Text
              </Button>
            </>
          )}
  
          {/* Button to show/hide file input */}
          <Button
            onClick={() => setShowFileOptions((prev) => !prev)}
            variant="contained"
            sx={{ backgroundColor: '#4caf50', color: '#fff', mb: 2 }}
          >
            {showFileOptions ? 'Hide File Options' : 'Choose File'}
          </Button>
  
          {showFileOptions && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImageFile(e.target.files[0])} // Set the selected file
                style={{ marginBottom: '8px', display: 'block' }}
              />
              <Button onClick={addNewImage} variant="contained" sx={{ backgroundColor: '#4caf50', color: '#fff', mb: 2 }}>
                Add Image
              </Button>
            </>
          )}
  
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
