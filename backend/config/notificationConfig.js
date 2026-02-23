// Configuración de notificaciones para la aplicación
export const NOTIFICATION_CONFIG = {
  general: {
    sound: 'default',
    priority: 'high',
    autoDismiss: false,
  },
  messages: {
    habitReminder: { title: '🎯 Recordatorio de Hábito', body: 'Es hora de: {habitTitle}' },
    streakReminder: { title: '🔥 ¡Mantén tu racha!', body: 'Tienes una racha de {streak} días. ¡No la rompas hoy!' },
    pendingHabits: { title: '📋 Hábitos Pendientes', body: 'Revisa tus hábitos del día antes de que termine' },
    dailyDigest: { title: '📊 Resumen del Día', body: 'Completaste {completed} de {total} hábitos hoy' },
    weeklyReport: { title: '📈 Reporte Semanal', body: 'Tu progreso semanal está listo. ¡Revisa tus estadísticas!' },
    achievement: { title: '🏆 ¡Logro Desbloqueado!', body: '¡Felicidades! Has alcanzado: {achievementName} (+{points} pts)' },
    levelUp: { title: '🎉 ¡Subiste de Nivel!', body: '¡Felicidades! Has alcanzado el {levelTitle}' },
    pointsEarned: { title: '⭐ Puntos Ganados', body: '¡Ganaste {points} puntos por completar tu hábito!' },
    motivation: { title: '💪 ¡Tú Puedes!', body: 'Cada pequeño paso te acerca a tus metas' },
  },
  schedules: {
    pendingHabitsReminder: { hour: 20, minute: 0, repeats: true },
    dailyDigest: { hour: 21, minute: 0, repeats: true },
    weeklyReport: { dayOfWeek: 1, hour: 9, minute: 0, repeats: true },
    motivation: { hour: 7, minute: 0, repeats: true },
  },
  streaks: {
    reminderThreshold: 3,
    specialMessages: { 7: '¡Una semana completa! 🎉', 14: '¡Dos semanas! Eres increíble 🌟', 30: '¡Un mes! ¡Eres una máquina! 🚀', 100: '¡100 días! ¡Leyenda! 👑' },
  },
  categories: {
    health: { icon: '🏃‍♂️', color: '#10B981', priority: 'high' },
    work: { icon: '💼', color: '#3B82F6', priority: 'high' },
    learning: { icon: '📚', color: '#8B5CF6', priority: 'medium' },
    personal: { icon: '❤️', color: '#F59E0B', priority: 'medium' },
    fitness: { icon: '💪', color: '#EF4444', priority: 'high' },
  },
  sounds: { default: 'default', gentle: 'gentle_reminder', urgent: 'urgent_alert', celebration: 'celebration' },
  badges: { enabled: false, maxCount: 99 },
  repetition: { maxReminders: 3, reminderInterval: 30, finalReminder: 60 },
  timezone: { useDeviceTimezone: true, defaultTimezone: 'America/Mexico_City' },
  quietHours: { enabled: false, start: '22:00', end: '08:00', allowImportantHabits: true, importantHabitCategories: ['health', 'medication'] },
  pushNotifications: { enabled: false, services: { expo: true, firebase: false, onesignal: false }, topics: { general: true, habits: true, achievements: true, motivation: true } },
};

export const getNotificationMessage = (type, data = {}) => {
  const messageTemplate = NOTIFICATION_CONFIG.messages[type];
  if (!messageTemplate) return null;
  let title = messageTemplate.title;
  let body = messageTemplate.body;
  Object.keys(data).forEach(key => {
    const placeholder = `{${key}}`;
    title = title.replace(placeholder, data[key]);
    body = body.replace(placeholder, data[key]);
  });
  return { title, body };
};

export const getCategoryConfig = (category) => {
  return NOTIFICATION_CONFIG.categories[category] || NOTIFICATION_CONFIG.categories.personal;
};

export const isQuietHours = () => {
  if (!NOTIFICATION_CONFIG.quietHours.enabled) return false;
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = NOTIFICATION_CONFIG.quietHours.start.split(':').map(Number);
  const [endHour, endMinute] = NOTIFICATION_CONFIG.quietHours.end.split(':').map(Number);
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  } else {
    return currentTime >= startTime && currentTime <= endTime;
  }
};

export const getNotificationPriority = (habit) => {
  const categoryConfig = getCategoryConfig(habit.category);
  const basePriority = categoryConfig.priority;
  if (habit.streak >= NOTIFICATION_CONFIG.streaks.reminderThreshold) return 'high';
  if (habit.status === 'missed') return 'high';
  return basePriority;
};

export default NOTIFICATION_CONFIG;
