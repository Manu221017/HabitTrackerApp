import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationMessage, isQuietHours, getNotificationPriority } from '../config/notificationConfig';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Solicitar permisos de notificación
  async requestPermissions() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permisos de notificación no concedidos');
        return false;
      }
      
      return true;
    } else {
      console.log('Debe usar un dispositivo físico para las notificaciones push');
      return false;
    }
  }

  // Obtener token de notificación
  async getPushToken() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'tu-project-id', // Necesitarás configurar esto
      });
      
      this.expoPushToken = token.data;
      await AsyncStorage.setItem('expoPushToken', token.data);
      
      return token.data;
    } catch (error) {
      console.error('Error al obtener token de notificación:', error);
      return null;
    }
  }

  // Programar notificación para un hábito específico
  async scheduleHabitReminder(habit) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      // Cancelar notificaciones existentes para este hábito
      await this.cancelHabitReminders(habit.id);

      // Si el hábito no tiene hora programada, no programar notificación
      if (!habit.time) return false;

      // Parsear la hora del hábito (formato: "HH:MM")
      const [hours, minutes] = habit.time.split(':').map(Number);
      
      // Crear fecha para hoy con la hora especificada
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Si la hora ya pasó hoy, programar para mañana
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      // Verificar si está en horas de silencio
      if (isQuietHours()) {
        console.log('No se programa notificación en horas de silencio');
        return false;
      }

      // Obtener mensaje personalizado
      const message = getNotificationMessage('habitReminder', { habitTitle: habit.title });
      
      // Programar notificación
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: { habitId: habit.id, type: 'habit_reminder' },
          sound: 'default',
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true, // Se repite diariamente
        },
      });

      // Guardar el ID de la notificación
      await this.saveNotificationId(habit.id, notificationId);
      
      console.log(`Notificación programada para ${habit.title} a las ${habit.time}`);
      return true;
    } catch (error) {
      console.error('Error al programar notificación:', error);
      return false;
    }
  }

  // Programar notificación de racha
  async scheduleStreakReminder(habitId, currentStreak) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      // Cancelar recordatorios de racha existentes
      await this.cancelStreakReminders(habitId);

      // Programar notificación para mañana a las 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      // Obtener mensaje personalizado
      const message = getNotificationMessage('streakReminder', { streak: currentStreak });
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: { habitId, type: 'streak_reminder' },
          sound: 'default',
        },
        trigger: {
          date: tomorrow,
        },
      });

      await this.saveNotificationId(`${habitId}_streak`, notificationId);
      return true;
    } catch (error) {
      console.error('Error al programar recordatorio de racha:', error);
      return false;
    }
  }

  // Programar notificación de hábitos pendientes
  async schedulePendingHabitsReminder() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      // Cancelar recordatorios existentes de hábitos pendientes
      await this.cancelPendingHabitsReminders();

      // Programar para las 8 PM diariamente
      // Obtener mensaje personalizado
      const message = getNotificationMessage('pendingHabits');
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: { type: 'pending_habits_reminder' },
          sound: 'default',
        },
        trigger: {
          hour: 20, // 8 PM
          minute: 0,
          repeats: true,
        },
      });

      await this.saveNotificationId('pending_habits', notificationId);
      return true;
    } catch (error) {
      console.error('Error al programar recordatorio de hábitos pendientes:', error);
      return false;
    }
  }

  // Cancelar notificaciones de un hábito específico
  async cancelHabitReminders(habitId) {
    try {
      const notificationId = await this.getNotificationId(habitId);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await this.removeNotificationId(habitId);
      }
    } catch (error) {
      console.error('Error al cancelar notificaciones:', error);
    }
  }

  // Cancelar recordatorios de racha
  async cancelStreakReminders(habitId) {
    try {
      const notificationId = await this.getNotificationId(`${habitId}_streak`);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await this.removeNotificationId(`${habitId}_streak`);
      }
    } catch (error) {
      console.error('Error al cancelar recordatorios de racha:', error);
    }
  }

  // Cancelar recordatorios de hábitos pendientes
  async cancelPendingHabitsReminders() {
    try {
      const notificationId = await this.getNotificationId('pending_habits');
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await this.removeNotificationId('pending_habits');
      }
    } catch (error) {
      console.error('Error al cancelar recordatorios de hábitos pendientes:', error);
    }
  }

  // Guardar ID de notificación
  async saveNotificationId(key, notificationId) {
    try {
      const notifications = await this.getStoredNotifications();
      notifications[key] = notificationId;
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error al guardar ID de notificación:', error);
    }
  }

  // Obtener ID de notificación
  async getNotificationId(key) {
    try {
      const notifications = await this.getStoredNotifications();
      return notifications[key];
    } catch (error) {
      console.error('Error al obtener ID de notificación:', error);
      return null;
    }
  }

  // Remover ID de notificación
  async removeNotificationId(key) {
    try {
      const notifications = await this.getStoredNotifications();
      delete notifications[key];
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error al remover ID de notificación:', error);
    }
  }

  // Obtener notificaciones almacenadas
  async getStoredNotifications() {
    try {
      const stored = await AsyncStorage.getItem('scheduledNotifications');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error al obtener notificaciones almacenadas:', error);
      return {};
    }
  }

  // Configurar listeners de notificación
  setupNotificationListeners() {
    // Listener para cuando se recibe una notificación
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    // Listener para cuando se toca una notificación
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación tocada:', response);
      
      // Aquí puedes manejar la navegación cuando se toca una notificación
      const data = response.notification.request.content.data;
      if (data.type === 'habit_reminder') {
        // Navegar a la pantalla de hábitos
        console.log('Navegar a hábito:', data.habitId);
      }
    });
  }

  // Limpiar listeners
  cleanup() {
    if (this.notificationListener && typeof this.notificationListener.remove === 'function') {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener && typeof this.responseListener.remove === 'function') {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  // Obtener todas las notificaciones programadas
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error al obtener notificaciones programadas:', error);
      return [];
    }
  }

  // Cancelar todas las notificaciones
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem('scheduledNotifications');
      console.log('Todas las notificaciones canceladas');
    } catch (error) {
      console.error('Error al cancelar todas las notificaciones:', error);
    }
  }

  // Programar notificaciones para todos los hábitos del usuario
  async scheduleAllHabitNotifications(userId) {
    try {
      console.log('Programando notificaciones para usuario:', userId);
      
      // Por ahora solo programamos el recordatorio de hábitos pendientes
      // En el futuro, aquí podrías obtener los hábitos del usuario y programar notificaciones
      await this.schedulePendingHabitsReminder();
      
      console.log('Notificaciones programadas exitosamente');
      return true;
    } catch (error) {
      console.error('Error al programar notificaciones:', error);
      return false;
    }
  }
}

export default new NotificationService();
