// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { 
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_E-JAqxL3uRpLCeNLqPB2c35ILowTlDg",
  authDomain: "habittrackerapp-5a791.firebaseapp.com",
  projectId: "habittrackerapp-5a791",
  storageBucket: "habittrackerapp-5a791.firebasestorage.app",
  messagingSenderId: "919333458595",
  appId: "1:919333458595:web:5bcab2c31b8d91c5516516",
  measurementId: "G-STNN8JQN06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Authentication functions
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = 'Error al crear la cuenta';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Este correo electrónico ya está registrado';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Correo electrónico inválido';
        break;
      case 'auth/weak-password':
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = 'Error al iniciar sesión';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No existe una cuenta con este correo electrónico';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Correo electrónico inválido';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth state listener
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Habits functions
export const createHabit = async (habitData) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const habitDoc = {
      ...habitData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      streak: 0,
      totalCompletions: 0,
      lastCompleted: null,
      isActive: true
    };

    const docRef = await addDoc(collection(db, 'habits'), habitDoc);
    return { success: true, habitId: docRef.id, habit: { ...habitDoc, id: docRef.id } };
  } catch (error) {
    console.error('Error creating habit:', error);
    return { success: false, error: 'Error al crear el hábito' };
  }
};

export const getUserHabits = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const q = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const habits = [];
    
    querySnapshot.forEach((doc) => {
      habits.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, habits };
  } catch (error) {
    console.error('Error getting habits:', error);
    return { success: false, error: 'Error al obtener los hábitos' };
  }
};

export const updateHabitStatus = async (habitId, status, date = new Date()) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const habitRef = doc(db, 'habits', habitId);
    
    // Get current habit data
    const habitDoc = await getDocs(query(
      collection(db, 'habits'),
      where('__name__', '==', habitId),
      where('userId', '==', user.uid)
    ));

    if (habitDoc.empty) {
      return { success: false, error: 'Hábito no encontrado' };
    }

    const habitData = habitDoc.docs[0].data();
    let newStreak = habitData.streak || 0;
    let totalCompletions = habitData.totalCompletions || 0;

    if (status === 'completed') {
      newStreak += 1;
      totalCompletions += 1;
    } else if (status === 'missed') {
      newStreak = 0;
    }

    await updateDoc(habitRef, {
      status,
      streak: newStreak,
      totalCompletions,
      lastCompleted: status === 'completed' ? date : null,
      updatedAt: serverTimestamp()
    });

    // Persist daily log for calendar/stats
    try {
      await setHabitLogStatus(habitId, date, status, user.uid);
    } catch (e) {
      console.warn('No se pudo guardar el log del hábito:', e?.message || e);
    }

    return { 
      success: true, 
      habit: { 
        ...habitData, 
        status, 
        streak: newStreak, 
        totalCompletions,
        lastCompleted: status === 'completed' ? date : null
      } 
    };
  } catch (error) {
    console.error('Error updating habit status:', error);
    return { success: false, error: 'Error al actualizar el hábito' };
  }
};

export const deleteHabit = async (habitId) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Soft delete - mark as inactive
    const habitRef = doc(db, 'habits', habitId);
    await updateDoc(habitRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting habit:', error);
    return { success: false, error: 'Error al eliminar el hábito' };
  }
};

// ------------------------------
// Logs diarios para calendario/estadísticas
// ------------------------------

const formatDateParts = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return {
    year,
    month,
    day,
    dateKey: `${year}-${month}-${day}`,
    monthKey: `${year}-${month}`,
  };
};

export const setHabitLogStatus = async (habitId, date, status, forcedUserId) => {
  const user = forcedUserId ? { uid: forcedUserId } : getCurrentUser();
  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }
  const { dateKey, monthKey, year, month, day } = formatDateParts(date instanceof Date ? date : new Date(date));
  // Deterministic document id to avoid duplicates per habit/day
  const logId = `${user.uid}_${habitId}_${dateKey}`;
  const logRef = doc(db, 'habitLogs', logId);
  await setDoc(logRef, {
    id: logId,
    userId: user.uid,
    habitId,
    status,
    dateKey,
    monthKey,
    year,
    month,
    day,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return { success: true };
};

export const getLogsByMonth = async (year, month) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }
    const monthKey = `${String(year)}-${String(month).padStart(2, '0')}`;
    const q = query(
      collection(db, 'habitLogs'),
      where('userId', '==', user.uid),
      where('monthKey', '==', monthKey)
    );
    const snap = await getDocs(q);
    const logs = [];
    snap.forEach(d => logs.push({ id: d.id, ...d.data() }));
    return { success: true, logs };
  } catch (error) {
    console.error('Error getting logs by month:', error);
    return { success: false, error: 'Error al obtener registros' };
  }
};

// ------------------------------
// Recordatorios (metadata en Firestore)
// ------------------------------

export const updateHabitReminder = async (habitId, fields) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }
    const habitRef = doc(db, 'habits', habitId);
    await updateDoc(habitRef, {
      reminderEnabled: !!fields.reminderEnabled,
      reminderTime: fields.reminderTime || null, // 'HH:mm'
      notificationId: fields.notificationId || null,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating habit reminder:', error);
    return { success: false, error: 'Error al actualizar el recordatorio' };
  }
};

export default app; 