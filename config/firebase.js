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
  serverTimestamp 
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

export default app; 