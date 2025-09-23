import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import GamificationService from '../services/GamificationService';

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

  const todayIndex = new Date().getDay(); // 0 = Domingo ... 6 = Sábado
  const todaysHabits = useMemo(() => {
    return habits.filter(h => {
      const days = Array.isArray(h.daysOfWeek) ? h.daysOfWeek : [];
      if (days.length === 0) return true; // Sin configuración => aparece todos los días
      // Normalizar posibles strings a índices si existieran
      const normalized = days.map(d => {
        if (typeof d === 'number') return d;
        if (typeof d === 'string') {
          const lower = d.toLowerCase();
          const map = {
            'domingo': 0, 'dom': 0, 'sun': 0,
            'lunes': 1, 'lun': 1, 'mon': 1,
            'martes': 2, 'mar': 2, 'tue': 2,
            'miércoles': 3, 'miercoles': 3, 'mié': 3, 'mie': 3, 'wed': 3,
            'jueves': 4, 'jue': 4, 'thu': 4,
            'viernes': 5, 'vie': 5, 'fri': 5,
            'sábado': 6, 'sabado': 6, 'sáb': 6, 'sab': 6, 'sat': 6,
          };
          return map[lower];
        }
        return undefined;
      }).filter(v => v !== undefined);
      return normalized.includes(todayIndex);
    });
  }, [habits, todayIndex]);

  const value = {
    habits,
    todaysHabits,
    loading,
    error,
    setError,
    // Helper functions
    getHabitById: (id) => habits.find(habit => habit.id === id),
    getHabitsByCategory: (category) => habits.filter(habit => habit.category === category),
    getCompletedHabits: () => todaysHabits.filter(habit => habit.status === 'completed'),
    getPendingHabits: () => todaysHabits.filter(habit => habit.status === 'pending'),
    getTotalStreak: () => habits.reduce((sum, habit) => sum + (habit.streak || 0), 0),
    getBestStreak: () => habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0,
    getProgressPercentage: () => {
      if (todaysHabits.length === 0) return 0;
      const completed = todaysHabits.filter(h => h.status === 'completed').length;
      return Math.round((completed / todaysHabits.length) * 100) || 0;
    },
    // Gamification functions
    completeHabit: async (habitId) => {
      try {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return false;
        
        // Calcular puntos por completar el hábito
        const points = GamificationService.calculateHabitPoints(habit, habit.streak || 0);
        
        // Obtener progreso actual del usuario
        const currentProgress = await GamificationService.getUserProgress(user.uid);
     
        // Actualizar puntos y verificar si subió de nivel
        const newTotalPoints = currentProgress.totalPoints + points;
        const newLevel = GamificationService.calculateLevel(newTotalPoints);
        const levelUp = newLevel > currentProgress.level;
        
        // Actualizar progreso
        const updatedProgress = {
          ...currentProgress,
          totalPoints: newTotalPoints,
          level: newLevel,
          stats: {
            ...currentProgress.stats,
            totalHabitsCompleted: currentProgress.stats.totalHabitsCompleted + 1
          },
          lastUpdated: new Date().toISOString()
        };
        
        // Guardar progreso actualizado
        await GamificationService.saveUserProgress(user.uid, updatedProgress);
        
        // Verificar logros
        const userStats = {
          totalHabits: habits.length,
          completedHabits: habits.filter(h => h.status === 'completed').length + 1,
          bestStreak: Math.max(...habits.map(h => h.streak || 0)),
          totalCompletions: habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0) + 1,
          categoriesCompleted: new Set(habits.map(h => h.category)).size,
        };
        
        const newAchievements = await GamificationService.checkAchievements(userStats, user.uid);
        
        // Notificar subida de nivel si ocurrió
        if (levelUp) {
          const rewards = GamificationService.getLevelRewards(newLevel);
          await GamificationService.notifyLevelUp(newLevel, rewards);
        }
        
        // Notificar logros desbloqueados
        for (const achievement of newAchievements) {
          if (!currentProgress.achievements.find(a => a.id === achievement.id)) {
            await GamificationService.notifyAchievement(achievement);
          }
        }
        
        return { success: true, points, levelUp, newAchievements };
      } catch (error) {
        console.error('Error al completar hábito con gamificación:', error);
        return { success: false, error };
      }
    },
    getGamificationStats: async () => {
      try {
        const progress = await GamificationService.getUserProgress(user.uid);
        const userStats = {
          totalHabits: habits.length,
          completedHabits: todaysHabits.filter(h => h.status === 'completed').length,
          bestStreak: Math.max(...habits.map(h => h.streak || 0)),
          totalCompletions: habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0),
          categoriesCompleted: new Set(habits.map(h => h.category)).size,
        };
        
        return GamificationService.calculateGamificationStats(userStats, progress);
      } catch (error) {
        console.error('Error al obtener estadísticas de gamificación:', error);
        return null;
      }
    }
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}; 