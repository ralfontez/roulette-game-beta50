// src/firebase/services.js
import { db } from "./config";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  deleteDoc 
} from "firebase/firestore";

// 1. Crear una nueva sesión al presionar "EMPEZAR"
export const createSession = async () => {
  try {
    const docRef = await addDoc(collection(db, "sessions"), {
      createdAt: serverTimestamp(),
      status: "active"
    });
    return docRef.id; // Retornamos el ID para saber en qué sesión estamos
  } catch (e) {
    console.error("Error creando sesión: ", e);
  }
};

// 2. Registrar un número (0-36)
export const addSpin = async (sessionId, number) => {
  if (!sessionId) return;
  
  // Lógica simple para color (Azul/Blanco como pediste, en vez de Rojo/Negro)
  // Nota: Deberás definir qué números son "Azules" y cuáles "Blancos"
  // Aquí pongo un ejemplo genérico, ajustaremos la lógica real luego.
  const color = number === 0 ? "green" : (number % 2 === 0 ? "azul" : "blanco");

  try {
    await addDoc(collection(db, "sessions", sessionId, "spins"), {
      number: number,
      color: color,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Error guardando giro: ", e);
  }
};

// 3. Eliminar el último registro (Corrección de error)
export const deleteLastSpin = async (sessionId) => {
  if (!sessionId) return;

  try {
    // Buscamos el último ingresado (orden descendente por fecha, dame solo 1)
    const spinsRef = collection(db, "sessions", sessionId, "spins");
    const q = query(spinsRef, orderBy("timestamp", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (e) {
    console.error("Error eliminando último giro: ", e);
  }
};