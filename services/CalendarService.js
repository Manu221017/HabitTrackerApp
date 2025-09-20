import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

class CalendarService {
  calendarName = 'HabitTracker';

  // Solicitar permisos y obtener el calendario de la app
  async getOrCreateCalendar() {
    // Solicitar permisos
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permiso de calendario no concedido');
    }

    // Buscar si ya existe un calendario de la app
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    let appCalendar = calendars.find(c => c.title === this.calendarName);

    if (!appCalendar) {
      // Crear un nuevo calendario
      const defaultSource = Platform.OS === 'ios'
        ? await Calendar.getDefaultCalendarAsync()
        : { isLocalAccount: true, name: this.calendarName };

      const newCalendarId = await Calendar.createCalendarAsync({
        title: this.calendarName,
        color: '#6366F1',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultSource.sourceId || undefined,
        source: defaultSource,
        name: this.calendarName,
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });
      appCalendar = await Calendar.getCalendarAsync(newCalendarId);
    }
    return appCalendar;
  }

  // Crear un evento para un hábito
  async createHabitEvent(habit) {
    try {
      const calendar = await this.getOrCreateCalendar();
      if (!habit.time) return null;

      // Calcular fecha y hora del próximo evento
      const [hours, minutes] = habit.time.split(':').map(Number);
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      if (startDate < now) startDate.setDate(startDate.getDate() + 1); // Si ya pasó hoy, poner mañana
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora

      // Crear evento recurrente diario
      const eventId = await Calendar.createEventAsync(calendar.id, {
        title: `Hábito: ${habit.title}`,
        notes: habit.description || '',
        startDate,
        endDate,
        timeZone: undefined,
        alarms: [{ relativeOffset: 0 }],
        recurrenceRule: {
          frequency: Calendar.Frequency.DAILY,
        },
      });
      return eventId;
    } catch (error) {
      console.error('Error creando evento de calendario:', error);
      return null;
    }
  }

  // Eliminar un evento
  async deleteEvent(eventId) {
    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Error eliminando evento de calendario:', error);
      return false;
    }
  }
}

export default new CalendarService();
