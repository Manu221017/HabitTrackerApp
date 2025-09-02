import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import NotificationService from './NotificationService';

class HabitService {
  constructor() {
    this.collection = 'habits';
  }

  // Crear un nuevo hábito
  async createHabit(habitData, userId) {
    try {
      const habit = {
        ...habitData,
        userId,
        status: 'pending',
        streak: 0,
        totalCompletions: 0,
        lastCompleted: null,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.collection), habit);
      const newHabit = { id: docRef.id, ...habit };

      // Programar notificación si el hábito tiene hora
      if (habit.time) {
        await NotificationService.scheduleHabitReminder(newHabit);
      }

      return { success: true, habit: newHabit };
    } catch (error) {
      console.error('Error al crear hábito:', error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar un hábito
  async updateHabit(habitId, updates) {
    try {
      const habitRef = doc(db, this.collection, habitId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(habitRef, updateData);

      // Si se cambió la hora, reprogramar notificación
      if (updates.time !== undefined) {
        const habit = { id: habitId, ...updates };
        if (updates.time) {
          await NotificationService.scheduleHabitReminder(habit);
        } else {
          await NotificationService.cancelHabitReminders(habitId);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error al actualizar hábito:', error);
      return { success: false, error: error.message };
    }
  }

  // Marcar hábito como completado
  async completeHabit(habitId, habit) {
    try {
      const habitRef = doc(db, this.collection, habitId);
      const now = new Date();
      
      // Calcular nueva racha
      const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted.toDate()) : null;
      const daysSinceLastCompletion = lastCompleted 
        ? Math.floor((now - lastCompleted) / (1000 * 60 * 60 * 24))
        : 999; // Si nunca se completó, considerar como "muchos días"

      let newStreak = habit.streak || 0;
      if (daysSinceLastCompletion === 1) {
        // Se completó ayer, incrementar racha
        newStreak += 1;
      } else if (daysSinceLastCompletion > 1) {
        // Se perdió la racha, reiniciar
        newStreak = 1;
      } else if (daysSinceLastCompletion === 0) {
        // Ya se completó hoy, mantener racha
        newStreak = Math.max(newStreak, 1);
      }

      const updates = {
        status: 'completed',
        streak: newStreak,
        totalCompletions: (habit.totalCompletions || 0) + 1,
        lastCompleted: now,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(habitRef, updates);

      // Programar recordatorio de racha para mañana
      if (newStreak > 1) {
        await NotificationService.scheduleStreakReminder(habitId, newStreak);
      }

      return { success: true, updates };
    } catch (error) {
      console.error('Error al completar hábito:', error);
      return { success: false, error: error.message };
    }
  }

  // Marcar hábito como perdido
  async missHabit(habitId, habit) {
    try {
      const habitRef = doc(db, this.collection, habitId);
      
      const updates = {
        status: 'missed',
        streak: 0, // Perder la racha
        updatedAt: serverTimestamp(),
      };

      await updateDoc(habitRef, updates);

      // Cancelar recordatorios de racha
      await NotificationService.cancelStreakReminders(habitId);

      return { success: true, updates };
    } catch (error) {
      console.error('Error al marcar hábito como perdido:', error);
      return { success: false, error: error.message };
    }
  }

  // Marcar hábito como pendiente
  async resetHabit(habitId) {
    try {
      const habitRef = doc(db, this.collection, habitId);
      
      const updates = {
        status: 'pending',
        updatedAt: serverTimestamp(),
      };

      await updateDoc(habitRef, updates);
      return { success: true, updates };
    } catch (error) {
      console.error('Error al resetear hábito:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar hábito (soft delete)
  async deleteHabit(habitId) {
    try {
      const habitRef = doc(db, this.collection, habitId);
      
      // Soft delete
      await updateDoc(habitRef, {
        isActive: false,
        updatedAt: serverTimestamp(),
      });

      // Cancelar todas las notificaciones relacionadas
      await NotificationService.cancelHabitReminders(habitId);
      await NotificationService.cancelStreakReminders(habitId);

      return { success: true };
    } catch (error) {
      console.error('Error al eliminar hábito:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener hábitos del usuario
  async getUserHabits(userId) {
    try {
      const habitsQuery = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(
          habitsQuery,
          (snapshot) => {
            const habits = [];
            snapshot.forEach((doc) => {
              habits.push({
                id: doc.id,
                ...doc.data()
              });
            });
            resolve({ success: true, habits });
          },
          (error) => {
            console.error('Error al obtener hábitos:', error);
            reject({ success: false, error: error.message });
          }
        );

        // Retornar función de limpieza
        return unsubscribe;
      });
    } catch (error) {
      console.error('Error al obtener hábitos:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener hábitos por categoría
  async getHabitsByCategory(userId, category) {
    try {
      const habitsQuery = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(
          habitsQuery,
          (snapshot) => {
            const habits = [];
            snapshot.forEach((doc) => {
              habits.push({
                id: doc.id,
                ...doc.data()
              });
            });
            resolve({ success: true, habits });
          },
          (error) => {
            console.error('Error al obtener hábitos por categoría:', error);
            reject({ success: false, error: error.message });
          }
        );

        return unsubscribe;
      });
    } catch (error) {
      console.error('Error al obtener hábitos por categoría:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas del usuario
  async getUserStats(userId) {
    try {
      const habitsQuery = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );

      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(
          habitsQuery,
          (snapshot) => {
            const habits = [];
            snapshot.forEach((doc) => {
              habits.push({
                id: doc.id,
                ...doc.data()
              });
            });

            const stats = {
              totalHabits: habits.length,
              completedToday: habits.filter(h => h.status === 'completed').length,
              pendingToday: habits.filter(h => h.status === 'pending').length,
              missedToday: habits.filter(h => h.status === 'missed').length,
              totalStreak: habits.reduce((sum, h) => sum + (h.streak || 0), 0),
              bestStreak: habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0,
              totalCompletions: habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0),
              progressPercentage: habits.length > 0 
                ? Math.round((habits.filter(h => h.status === 'completed').length / habits.length) * 100)
                : 0
            };

            resolve({ success: true, stats });
          },
          (error) => {
            console.error('Error al obtener estadísticas:', error);
            reject({ success: false, error: error.message });
          }
        );

        return unsubscribe;
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { success: false, error: error.message };
    }
  }

  // Programar notificaciones para todos los hábitos del usuario
  async scheduleAllHabitNotifications(userId) {
    try {
      const { success, habits } = await this.getUserHabits(userId);
      if (!success) return false;

      for (const habit of habits) {
        if (habit.time && habit.isActive) {
          await NotificationService.scheduleHabitReminder(habit);
        }
      }

      // Programar recordatorio de hábitos pendientes
      await NotificationService.schedulePendingHabitsReminder();

      return true;
    } catch (error) {
      console.error('Error al programar notificaciones:', error);
      return false;
    }
  }

  // Cancelar todas las notificaciones del usuario
  async cancelAllUserNotifications(userId) {
    try {
      const { success, habits } = await this.getUserHabits(userId);
      if (!success) return false;

      for (const habit of habits) {
        await NotificationService.cancelHabitReminders(habit.id);
        await NotificationService.cancelStreakReminders(habit.id);
      }

      await NotificationService.cancelPendingHabitsReminders();
      return true;
    } catch (error) {
      console.error('Error al cancelar notificaciones:', error);
      return false;
    }
  }
}

export default new HabitService();
