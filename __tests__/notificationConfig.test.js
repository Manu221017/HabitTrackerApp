import NOTIFICATION_CONFIG, {
  getNotificationMessage,
  getCategoryConfig,
  isQuietHours,
  getNotificationPriority,
} from '../backend/config/notificationConfig';

describe('notificationConfig', () => {
  describe('getNotificationMessage', () => {
    it('devuelve título y cuerpo con placeholders reemplazados', () => {
      const result = getNotificationMessage('habitReminder', { habitTitle: 'Leer 10 minutos' });
      expect(result).toEqual({
        title: NOTIFICATION_CONFIG.messages.habitReminder.title,
        body: 'Es hora de: Leer 10 minutos',
      });
    });

    it('devuelve null si el tipo no existe', () => {
      const result = getNotificationMessage('tipoInexistente', { foo: 'bar' });
      expect(result).toBeNull();
    });
  });

  describe('getCategoryConfig', () => {
    it('devuelve la configuración de categoría existente', () => {
      const healthConfig = getCategoryConfig('health');
      expect(healthConfig).toBe(NOTIFICATION_CONFIG.categories.health);
    });

    it('usa la categoría personal como fallback', () => {
      const fallbackConfig = getCategoryConfig('unknown-category');
      expect(fallbackConfig).toBe(NOTIFICATION_CONFIG.categories.personal);
    });
  });

  describe('isQuietHours', () => {
    const RealDate = Date;

    afterEach(() => {
      global.Date = RealDate;
      NOTIFICATION_CONFIG.quietHours.enabled = false;
    });

    it('devuelve false cuando quietHours está desactivado', () => {
      NOTIFICATION_CONFIG.quietHours.enabled = false;
      expect(isQuietHours()).toBe(false);
    });

    it('respeta quietHours que cruzan medianoche', () => {
      NOTIFICATION_CONFIG.quietHours.enabled = true;
      NOTIFICATION_CONFIG.quietHours.start = '22:00';
      NOTIFICATION_CONFIG.quietHours.end = '08:00';

      const mockDate = new RealDate(2025, 0, 1, 23, 0, 0, 0);

      global.Date = class extends RealDate {
        constructor(...args) {
          if (args.length === 0) {
            return mockDate;
          }
          return new RealDate(...args);
        }
      };

      expect(isQuietHours()).toBe(true);
    });
  });

  describe('getNotificationPriority', () => {
    it('devuelve la prioridad base de la categoría', () => {
      const habit = { category: 'learning', streak: 0, status: 'active' };
      const priority = getNotificationPriority(habit);
      expect(priority).toBe(NOTIFICATION_CONFIG.categories.learning.priority);
    });

    it('eleva prioridad cuando la racha supera el umbral', () => {
      const habit = {
        category: 'personal',
        streak: NOTIFICATION_CONFIG.streaks.reminderThreshold,
        status: 'active',
      };
      const priority = getNotificationPriority(habit);
      expect(priority).toBe('high');
    });

    it('eleva prioridad cuando el hábito está perdido', () => {
      const habit = {
        category: 'personal',
        streak: 0,
        status: 'missed',
      };
      const priority = getNotificationPriority(habit);
      expect(priority).toBe('high');
    });
  });
});

