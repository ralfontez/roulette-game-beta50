import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { addSpin, deleteLastSpin } from '../firebase/services';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const InputScreen = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Obtenemos el ID de la sesión actual
  const sessionId = localStorage.getItem('currentSessionId');
  
  // Referencia para hacer scroll automático a la lista si es necesario
  const listRef = useRef(null);

  // 1. Escuchar en TIEMPO REAL los cambios en la base de datos
  useEffect(() => {
    if (!sessionId) return;

    const q = query(
      collection(db, "sessions", sessionId, "spins"),
      orderBy("timestamp", "desc") // Ordenamos del más reciente al más antiguo 
    );

    // onSnapshot actualiza la app automáticamente cuando cambia la DB
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const spinsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(spinsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  // Manejadores de botones
  const handleNumberClick = (number) => {
    addSpin(sessionId, number);
  };

  const handleDelete = () => {
    deleteLastSpin(sessionId); // Borra el último ingresado [cite: 14]
  };

  const handleNext = () => {
    navigate('/analysis'); // Va a la Pantalla 3 (Ruleta visual) [cite: 16]
  };

  // Generamos el array de números [0, 1, 2... 36]
  const numbers = Array.from({ length: 37 }, (_, i) => i);

  return (
    <div style={styles.container}>
      {/* --- SECCIÓN 1: BOTONES DE INGRESO (0-36) --- */}
      <div style={styles.gridContainer}>
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            style={{
              ...styles.numberBtn,
              // El 0 suele destacarse, pero pediste botones amarillos 
              backgroundColor: '#FFEB3B', 
            }}
          >
            {num}
          </button>
        ))}
      </div>

      {/* --- SECCIÓN 2: CONTROLES (Borrar y Play) --- */}
      <div style={styles.controlsBar}>
        {/* Botón Eliminar [cite: 14] */}
        <button onClick={handleDelete} style={styles.deleteBtn}>
          🗑️ BORRAR
        </button>
        
        {/* Botón Play/Siguiente [cite: 16] */}
        <button onClick={handleNext} style={styles.playBtn}>
          PLAY ▶
        </button>
      </div>

      {/* --- SECCIÓN 3: LISTA DE HISTORIAL (Últimos ingresos) --- */}
      <div style={styles.historyContainer}>
        <h3 style={styles.historyTitle}>Últimos Registros:</h3>
        <div style={styles.historyList} ref={listRef}>
            {/* Visualizamos el último registro primero, como pediste 22, 6, 5...  */}
            {history.map((spin, index) => (
              <div key={spin.id} style={styles.historyItem}>
                <span style={styles.historyNumber}>{spin.number}</span>
                {index === 0 && <span style={styles.newBadge}>NUEVO</span>}
              </div>
            ))}
            {history.length === 0 && !loading && (
              <p style={{color: '#aaa'}}>Esperando números...</p>
            )}
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS RESPONSIVE (CSS-in-JS) ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#004481', // Fondo Azul (según mockup/pedido)
    color: 'white',
    padding: '10px',
    boxSizing: 'border-box',
  },
  gridContainer: {
    display: 'grid',
    // Grid adaptable: crea tantas columnas como quepan (aprox 5 o 6 en celular)
    gridTemplateColumns: 'repeat(auto-fill, minmax(55px, 1fr))', 
    gap: '8px',
    padding: '10px',
    overflowY: 'auto', // Permite scroll si la pantalla es muy pequeña
    maxHeight: '55vh', // Ocupa la mitad superior de la pantalla
    backgroundColor: 'rgba(255,255,255,0.1)', // Fondo semi-transparente para agrupar
    borderRadius: '15px',
  },
  numberBtn: {
    aspectRatio: '1', // Mantiene los botones redondos/cuadrados
    borderRadius: '50%', // Botones redondos como en mockup 2
    border: 'none',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 10px',
    gap: '20px',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#F44336', // Rojo para acción destructiva
    color: 'white',
    border: 'none',
    padding: '15px',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  playBtn: {
    flex: 1,
    backgroundColor: '#4CAF50', // Verde para avanzar
    color: 'white',
    border: 'none',
    padding: '15px',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: 'white', // Fondo blanco para la lista
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    padding: '15px',
    marginTop: '10px',
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  historyTitle: {
    margin: '0 0 10px 0',
    fontSize: '1rem',
    color: '#004481',
    borderBottom: '2px solid #eee',
    paddingBottom: '5px'
  },
  historyList: {
    display: 'flex',
    flexWrap: 'wrap', // Para que se acomoden horizontalmente si prefieres
    gap: '10px',
    overflowY: 'auto',
    alignContent: 'flex-start',
  },
  historyItem: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #004481',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    position: 'relative',
    backgroundColor: '#fff'
  },
  historyNumber: {
    zIndex: 1
  },
  newBadge: {
    position: 'absolute',
    top: '-10px',
    fontSize: '0.6rem',
    backgroundColor: '#FF9800',
    color: 'white',
    padding: '2px 4px',
    borderRadius: '4px',
    whiteSpace: 'nowrap'
  }
};

export default InputScreen;