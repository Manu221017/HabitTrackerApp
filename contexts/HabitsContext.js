import React, { createContext, useState, useContext, useEffect } from 'react';
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const HabitsContext = createContext({});

export const useHabits = () => {
  return useContext(HabitsContext);
};

export const HabitsProvider = ({ children }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create real-time listener for user's habits
    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      habitsQuery,
      (snapshot) => {
        const habitsData = [];
        snapshot.forEach((doc) => {
          habitsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setHabits(habitsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to habits:', error);
        setError('Error al cargar los hábitos');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const value = {
    habits,
    loading,
    error,
    setError,
    // Helper functions
    getHabitById: (id) => habits.find(habit => habit.id === id),
    getHabitsByCategory: (category) => habits.filter(habit => habit.category === category),
    getCompletedHabits: () => habits.filter(habit => habit.status === 'completed'),
    getPendingHabits: () => habits.filter(habit => habit.status === 'pending'),
    getTotalStreak: () => habits.reduce((sum, habit) => sum + (habit.streak || 0), 0),
    getBestStreak: () => habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0,
    getProgressPercentage: () => {
      if (habits.length === 0) return 0;
      const completed = habits.filter(h => h.status === 'completed').length;
      return Math.round((completed / habits.length) * 100) || 0;
    }
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}; 