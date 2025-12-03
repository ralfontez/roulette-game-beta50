import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../firebase/services';

const StartScreen = () => {
  const navigate = useNavigate();

  const handleStart = async () => {
    // 1. Creamos la sesión en Firebase
    const sessionId = await createSession();
    
    // 2. Guardamos el ID de la sesión en el navegador para no perderlo
    localStorage.setItem('currentSessionId', sessionId);
    
    // 3. Navegamos a la Pantalla 2 (InputScreen)
    navigate('/input');
  };

  return (
    <div style={styles.container}>
      {/* El mockup muestra un diseño simple centrado */}
      <div style={styles.card}>
        <h1 style={styles.title}>ROULETTE TRACKER</h1>
        
        {/* Botón START verde estilo mockup  */}
        <button onClick={handleStart} style={styles.startButton}>
          START
        </button>
      </div>
    </div>
  );
};

// Estilos básicos en línea (luego podemos pasarlo a CSS separado)
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0', // Fondo neutro
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '90%',
    maxWidth: '400px'
  },
  title: {
    color: '#004481', // Azul corporativo
    marginBottom: '40px',
    fontFamily: 'Arial, sans-serif'
  },
  startButton: {
    backgroundColor: '#76ff03', // Verde brillante como el mockup 
    color: '#333',
    fontSize: '2rem',
    fontWeight: 'bold',
    padding: '20px 40px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    width: '100%',
    textTransform: 'uppercase',
    boxShadow: '0 4px 0 #4caf50' // Efecto 3D simple
  }
};

export default StartScreen;