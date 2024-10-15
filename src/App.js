import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import HomePage from './pages/HomePage';
import ImageGenPage from './pages/ImageGenPage';
import MockupPage from './pages/MockupPage';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generate-image" element={<ImageGenPage />} />
          <Route path="/mockup" element={<MockupPage />} />
        </Routes>
      </Router>
    </DndProvider>
  );
}

export default App;
