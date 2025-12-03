import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importamos las pantallas que ya tenemos
import StartScreen from './screens/StartScreen';
import InputScreen from './screens/InputScreen';
import AnalysisScreen from './screens/AnalysisScreen'; // La crearemos luego

// Componente Placeholder para la pantalla 3 (Análisis)
//const AnalysisScreen = () => <h1>Pantalla 3: Análisis de Ruleta</h1>; 

const App = () => {
  return (
    // Usamos el Router para gestionar la navegación
    <Router>
      <Routes>
        {/* Ruta principal: Pantalla de inicio */}
        <Route path="/" element={<StartScreen />} />
        
        {/* Ruta para el ingreso rápido de números (Botones amarillos) */}
        <Route path="/input" element={<InputScreen />} />
        
        {/* Ruta para la vista de ruleta y análisis (Pendiente) */}
        <Route path="/analysis" element={<AnalysisScreen />} />
        
        {/* Si el usuario intenta ir a una ruta inexistente */}
        <Route path="*" element={<h1>404 | Página no encontrada</h1>} />
      </Routes>
    </Router>
  );
};

export default App;