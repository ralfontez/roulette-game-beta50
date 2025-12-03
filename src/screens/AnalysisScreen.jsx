import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { addSpin, deleteLastSpin } from '../firebase/services';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// Secuencia real de la Ruleta Europea (para ver vecinos)
const ROULETTE_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 
  10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const AnalysisScreen = () => {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem('currentSessionId');

  // Estados
  const [history, setHistory] = useState([]);         // Historial completo
  const [manualInput, setManualInput] = useState(''); // Caja de texto ingreso
  const [analysisN, setAnalysisN] = useState('15');   // Caja de texto análisis (default 15)
  const [highlighted, setHighlighted] = useState([]); // Números resaltados por análisis
  const [coldNumbers, setColdNumbers] = useState([]); // Top 5 fríos
  const [inputEnabled, setInputEnabled] = useState(false); // Toggle habilitar ingreso

  // 1. Cargar datos en tiempo real (igual que pantalla 2)
  useEffect(() => {
    if (!sessionId) return;
    const q = query(collection(db, "sessions", sessionId, "spins"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => d.data().number);
      setHistory(data);
    });
    return () => unsubscribe();
  }, [sessionId]);

  // 2. Calcular "Números Fríos" cada vez que cambia el historial
  useEffect(() => {
    if (history.length === 0) return;

    const delays = [];
    // Recorremos los 37 números (0-36)
    for (let i = 0; i <= 36; i++) {
      const lastIndex = history.indexOf(i); // Buscar la aparición más reciente
      // Si no ha salido nunca, el retraso es el total de giros
      const delay = lastIndex === -1 ? history.length : lastIndex; 
      delays.push({ number: i, delay: delay });
    }

    // Ordenamos por mayor retraso y tomamos los top 5
    const topCold = delays.sort((a, b) => b.delay - a.delay).slice(0, 5);
    setColdNumbers(topCold);
  }, [history]);

  // --- MANEJADORES ---

  // Botón: Ingresar número manualmente
  const handleManualSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(manualInput);
    if (!isNaN(num) && num >= 0 && num <= 36) {
      addSpin(sessionId, num);
      setManualInput('');
    } else {
      alert("Ingresa un número válido (0-36)");
    }
  };

  // Botón: Analizar coincidencias (Últimos N)
  const handleAnalyze = () => {
    const n = parseInt(analysisN);
    if (!isNaN(n) && n > 0) {
      // Tomamos los últimos N números del historial
      const subset = history.slice(0, n);
      // Eliminamos duplicados para resaltar en la ruleta
      setHighlighted([...new Set(subset)]);
    }
  };

  // Determinar color base (Azul/Blanco personalizado)
  const getBaseColor = (num) => {
    if (num === 0) return '#4CAF50'; // Verde
    // Lógica simple para ejemplo: Pares Azul, Impares Blanco
    // (Puedes ajustar esto a la lógica real de tu ruleta modificada)
    return num % 2 === 0 ? '#004481' : '#FFFFFF'; 
  };

  const getTextColor = (num) => {
    if (num === 0) return 'white';
    return num % 2 === 0 ? 'white' : '#004481';
  };

  return (
    <div style={styles.container}>
      {/* HEADER DE CONTROLES SUPERIOR */}
      <div style={styles.topBar}>
        <button onClick={() => navigate(-1)} style={styles.navBtn}>⬅ Atrás</button>
        <button onClick={() => deleteLastSpin(sessionId)} style={styles.delBtn}>Eliminar Último</button>
        <button 
          onClick={() => setInputEnabled(!inputEnabled)} 
          style={{...styles.actionBtn, background: inputEnabled ? '#4CAF50' : '#777'}}
        >
          {inputEnabled ? "Ingreso ON" : "Habilitar Ingreso"}
        </button>
      </div>

      {/* ZONA DE INGRESO MANUAL (Visible solo si se habilita) */}
      {inputEnabled && (
        <form onSubmit={handleManualSubmit} style={styles.inputRow}>
          <input 
            type="number" 
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="#"
            style={styles.inputBox}
          />
          <button type="submit" style={styles.okBtn}>OK</button>
        </form>
      )}

      {/* --- LA RULETA (VISTA VISUAL) --- */}
      <div style={styles.wheelContainer}>
        {ROULETTE_ORDER.map((num) => {
          // Chequear si es frío
          const isCold = coldNumbers.find(c => c.number === num);
          // Chequear si está en el análisis (match)
          const isMatch = highlighted.includes(num);

          return (
            <div key={num} style={{
              ...styles.numberCell,
              backgroundColor: getBaseColor(num),
              color: getTextColor(num),
              // Borde Cian si es Frío, Naranja si es Match, Gris si nada
              border: isCold ? '3px solid #00E5FF' : (isMatch ? '3px solid #FF9800' : '1px solid #ccc'),
              transform: isCold || isMatch ? 'scale(1.1)' : 'scale(1)',
              zIndex: isCold || isMatch ? 10 : 1,
            }}>
              <span style={styles.numText}>{num}</span>
              
              {/* Indicador de "Retraso" para los fríos */}
              {isCold && (
                <div style={styles.coldBadge}>
                  ❄ {isCold.delay}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- ZONA DE ANÁLISIS INFERIOR --- */}
      <div style={styles.analysisPanel}>
        <div style={styles.analysisRow}>
          <span style={{color: 'white'}}>Analizar últimos:</span>
          <input 
            type="number" 
            value={analysisN}
            onChange={(e) => setAnalysisN(e.target.value)}
            style={styles.smallInput}
          />
          <button onClick={handleAnalyze} style={styles.analyzeBtn}>MARCAR</button>
        </div>
        <p style={{color: '#ccc', fontSize: '0.8rem', marginTop: '5px'}}>
          * Marca en Naranja las coincidencias. En Cian los 5 más fríos.
        </p>
      </div>
    </div>
  );
};

// --- ESTILOS ---
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#222', // Fondo oscuro para resaltar la ruleta
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '15px',
  },
  navBtn: { padding: '10px', borderRadius: '8px', border: 'none', background: '#555', color: 'white' },
  delBtn: { padding: '10px', borderRadius: '8px', border: 'none', background: '#F44336', color: 'white' },
  actionBtn: { padding: '10px', borderRadius: '8px', border: 'none', color: 'white', flex: 1 },
  
  inputRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    justifyContent: 'center'
  },
  inputBox: {
    padding: '10px',
    fontSize: '1.2rem',
    width: '60px',
    textAlign: 'center',
    borderRadius: '5px',
    border: 'none'
  },
  okBtn: {
    padding: '10px 20px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold'
  },

  /* GRID DE RULETA */
  wheelContainer: {
    display: 'grid',
    // Grid adaptable para simular la rueda
    gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))', 
    gap: '8px',
    padding: '10px',
    flex: 1, // Ocupa el espacio disponible
  },
  numberCell: {
    aspectRatio: '1',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
    transition: 'all 0.3s ease',
  },
  numText: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  coldBadge: {
    position: 'absolute',
    bottom: '-5px',
    backgroundColor: '#00E5FF',
    color: '#000',
    fontSize: '0.6rem',
    padding: '2px 4px',
    borderRadius: '4px',
    fontWeight: 'bold',
    boxShadow: '0 2px 2px rgba(0,0,0,0.3)'
  },

  /* PANEL INFERIOR */
  analysisPanel: {
    backgroundColor: '#333',
    padding: '15px',
    borderRadius: '15px',
    marginTop: 'auto', // Empuja al fondo
  },
  analysisRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px'
  },
  smallInput: {
    padding: '8px',
    width: '50px',
    borderRadius: '5px',
    border: 'none',
    textAlign: 'center'
  },
  analyzeBtn: {
    flex: 1,
    padding: '10px',
    background: '#FF9800', // Naranja
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default AnalysisScreen;