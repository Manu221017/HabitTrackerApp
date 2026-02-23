import NotificationService from '../services/NotificationService';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationMessage, isQuietHours } from '../config/notificationConfig';

jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('../config/notificationConfig', () => ({
  getNotificationMessage: jest.fn(),
  isQuietHours: jest.fn(),
  getNotificationPriority: jest.fn(),
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Device.isDevice = true;

    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.scheduleNotificationAsync.mockResolvedValue('notification-id-123');
    Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'expo-token-123' });

    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.removeItem.mockResolvedValue();

    getNotificationMessage.mockReturnValue({
      title: 'Título de prueba',
      body: 'Cuerpo de prueba',
    });
    isQuietHours.mockReturnValue(false);
  });

  describe('requestPermissions', () => {
    it('devuelve false si no es un dispositivo físico', async () => {
      Device.isDevice = false;

      const result = await NotificationService.requestPermissions();

      expect(result).toBe(false);
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    });

    it('devuelve true cuando los permisos ya están concedidos', async () => {
      Device.isDevice = true;
      Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });

      const result = await NotificationService.requestPermissions();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });
  });

  describe('getPushToken', () => {
    it('devuelve null cuando no hay permisos', async () => {
      jest.spyOn(NotificationService, 'requestPermissions').mockResolvedValueOnce(false);

      const token = await NotificationService.getPushToken();

      expect(token).toBeNull();
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    });

    it('guarda y devuelve el token cuando hay permisos', async () => {
      jest.spyOn(NotificationService, 'requestPermissions').mockResolvedValueOnce(true);

      const token = await NotificationService.getPushToken();

      expect(token).toBe('expo-token-123');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('expoPushToken', 'expo-token-123');
    });
  });

  describe('scheduleHabitReminder', () => {
    const baseHabit = {
      id: 'habit-1',
      title: 'Beber agua',
      time: '08:30',
    };

    it('devuelve false si no obtiene permisos', async () => {
      jest.spyOn(NotificationService, 'requestPermissions').mockResolvedValueOnce(false);

      const result = await NotificationService.scheduleHabitReminder(baseHabit);

      expect(result).toBe(false);
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('devuelve false si el hábito no tiene hora', async () => {
      jest.spyOn(NotificationService, 'requestPermissions').mockResolvedValueOnce(true);

      const result = await NotificationService.scheduleHabitReminder({
        ...baseHabit,
        time: null,
      });

      expect(result).toBe(false);
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('no programa notificación en horas de silencio', async () => {
      jest.spyOn(NotificationService, 'requestPermissions').mockResolvedValueOnce(true);
      isQuietHours.mockReturnValueOnce(true);

      const result = await NotificationService.scheduleHabitReminder(baseHabit);

      expect(result).toBe(false);
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('programa la notificación con la hora correcta', async () => {
      jest.spyOn(NotificationService, 'requestPermissions').mockResolvedValueOnce(true);
      isQuietHours.mockReturnValueOnce(false);

      const result = await NotificationService.scheduleHabitReminder(baseHabit);

      expect(result).toBe(true);
      expect(getNotificationMessage).toHaveBeenCalledWith('habitReminder', {
        habitTitle: baseHabit.title,
      });
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Título de prueba',
            body: 'Cuerpo de prueba',
            data: { habitId: baseHabit.id, type: 'habit_reminder' },
          }),
          trigger: expect.objectContaining({
            hour: 8,
            minute: 30,
            repeats: true,
          }),
        }),
      );
    });
  });
});

