import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationMessage, isQuietHours, getNotificationPriority } from '../config/notificationConfig';

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

  async getPushToken() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'habittrackerapp-5a791',
      });

      this.expoPushToken = token.data;
      await AsyncStorage.setItem('expoPushToken', token.data);

      return token.data;
    } catch (error) {
      console.error('Error al obtener token de notificación:', error);
      return null;
    }
  }

  async scheduleHabitReminder(habit) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      await this.cancelHabitReminders(habit.id);

      if (!habit.time) return false;

      const [hours, minutes] = habit.time.split(':').map(Number);

      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      if (isQuietHours()) {
        console.log('No se programa notificación en horas de silencio');
        return false;
      }

      const message = getNotificationMessage('habitReminder', { habitTitle: habit.title });

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
          repeats: true,
        },
      });

      await this.saveNotificationId(habit.id, notificationId);

      console.log(`Notificación programada para ${habit.title} a las ${habit.time}`);
      return true;
    } catch (error) {
      console.error('Error al programar notificación:', error);
      return false;
    }
  }

  async scheduleStreakReminder(habitId, currentStreak) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      await this.cancelStreakReminders(habitId);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

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

  async schedulePendingHabitsReminder() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      await this.cancelPendingHabitsReminders();

      const message = getNotificationMessage('pendingHabits');

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: { type: 'pending_habits_reminder' },
          sound: 'default',
        },
        trigger: {
          hour: 20,
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

  async saveNotificationId(key, notificationId) {
    try {
      const notifications = await this.getStoredNotifications();
      notifications[key] = notificationId;
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error al guardar ID de notificación:', error);
    }
  }

  async getNotificationId(key) {
    try {
      const notifications = await this.getStoredNotifications();
      return notifications[key];
    } catch (error) {
      console.error('Error al obtener ID de notificación:', error);
      return null;
    }
  }

  async removeNotificationId(key) {
    try {
      const notifications = await this.getStoredNotifications();
      delete notifications[key];
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error al remover ID de notificación:', error);
    }
  }

  async getStoredNotifications() {
    try {
      const stored = await AsyncStorage.getItem('scheduledNotifications');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error al obtener notificaciones almacenadas:', error);
      return {};
    }
  }

  setupNotificationListeners() {
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación tocada:', response);
      const data = response.notification.request.content.data;
      if (data.type === 'habit_reminder') {
        console.log('Navegar a hábito:', data.habitId);
      }
    });
  }

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

  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error al obtener notificaciones programadas:', error);
      return [];
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem('scheduledNotifications');
      console.log('Todas las notificaciones canceladas');
    } catch (error) {
      console.error('Error al cancelar todas las notificaciones:', error);
    }
  }

  async scheduleAllHabitNotifications(userId) {
    try {
      console.log('Programando notificaciones para usuario:', userId);
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
