import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { addSpin, deleteLastSpin } from '../firebase/services';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const InputScreen = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const sessionId = localStorage.getItem('currentSessionId');
  const listRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    const q = query(
      collection(db, "sessions", sessionId, "spins"),
      orderBy("timestamp", "desc")
    );

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

  const handleNumberClick = (number) => {
    addSpin(sessionId, number);
  };

  const handleDelete = () => {
    deleteLastSpin(sessionId);
  };

  const handleNext = () => {
    navigate('/analysis');
  };

  // Generamos solo los números del 1 al 36 para la grilla inferior
  const numbers1to36 = Array.from({ length: 36 }, (_, i) => i + 1);

  return (
    <div style={styles.container}>
      
      <div style={styles.scrollableArea}>
        {/* --- FILA DEL CERO (Solo) --- */}
        <div style={styles.zeroRow}>
          <button
            onClick={() => handleNumberClick(0)}
            style={{...styles.numberBtn, ...styles.zeroBtn}}
          >
            0
          </button>
        </div>

        {/* --- GRILLA DEL 1 al 36 (Filas de 6) --- */}
        <div style={styles.gridContainer}>
          {numbers1to36.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              style={styles.numberBtn}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* --- CONTROLES --- */}
      <div style={styles.controlsBar}>
        <button onClick={handleDelete} style={styles.deleteBtn}>
          🗑️ BORRAR
        </button>
        <button onClick={handleNext} style={styles.playBtn}>
          PLAY ▶
        </button>
      </div>

      {/* --- HISTORIAL --- */}
      <div style={styles.historyContainer}>
        <h3 style={styles.historyTitle}>Últimos Registros:</h3>
        <div style={styles.historyList} ref={listRef}>
            {history.map((spin, index) => (
              <div key={spin.id} style={styles.historyItem}>
                <span style={styles.historyNumber}>{spin.number}</span>
                {index === 0 && <span style={styles.newBadge}>NUEVO</span>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#004481', 
    color: 'white',
    padding: '10px',
    boxSizing: 'border-box',
  },
  scrollableArea: {
    overflowY: 'auto', // Permite scroll si la pantalla es muy chica verticalmente
    flexShrink: 0,
  },
  // Estilo específico para el contenedor del 0
  zeroRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  // Estilo específico para el botón 0 (más ancho o diferente color si quieres)
  zeroBtn: {
    width: '100%', // Que ocupe todo el ancho disponible o gran parte
    maxWidth: '200px',
    borderRadius: '10px', // Menos redondo, más tipo "barra"
    aspectRatio: 'auto',  // Quitamos la proporción 1:1 forzada
    padding: '15px',
    backgroundColor: '#4CAF50', // Verde clásico del 0
    color: 'white',
  },
  gridContainer: {
    display: 'grid',
    // AQUÍ ESTÁ LA CLAVE: 6 columnas de igual tamaño (1fr)
    gridTemplateColumns: 'repeat(6, 1fr)', 
    gap: '8px',
    marginBottom: '10px',
    // 
    overflowY: 'auto', // Permite scroll si la pantalla es muy pequeña
    maxHeight: '70vh', // Ocupa la mitad superior de la pantalla
    backgroundColor: 'rgba(255,255,255,0.1)', // Fondo semi-transparente para agrupar
    borderRadius: '5px',
  },
  numberBtn: {
    aspectRatio: '1', // Mantiene botones cuadrados/redondos
    borderRadius: '50%',
    border: 'none',
    fontSize: '1.1rem', // Un poco más chico para asegurar que quepan 6
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#FFEB3B', // Amarillos
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Asegura que llene su celda de la grilla
  },
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    gap: '15px',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#F44336',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  playBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    padding: '15px',
    marginTop: '5px',
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: '150px' // Altura mínima para asegurar que se vea la lista
  },
  historyTitle: {
    margin: '0 0 10px 0',
    fontSize: '1rem',
    color: '#004481',
    borderBottom: '2px solid #eee',
  },
  historyList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    overflowY: 'auto',
    alignContent: 'flex-start',
  },
  historyItem: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    border: '2px solid #004481',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
    position: 'relative',
    backgroundColor: '#fff'
  },
  newBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-5px',
    fontSize: '0.5rem',
    backgroundColor: '#FF9800',
    color: 'white',
    padding: '2px 3px',
    borderRadius: '3px',
  }
};

export default InputScreen;