// Configuración de notificaciones para la aplicación
export const NOTIFICATION_CONFIG = {
  // Configuración general
  general: {
    sound: 'default',
    priority: 'high',
    autoDismiss: false,
  },

  // Mensajes de notificaciones
  messages: {
    habitReminder: {
      title: '🎯 Recordatorio de Hábito',
      body: 'Es hora de: {habitTitle}',
    },
    
    streakReminder: {
      title: '🔥 ¡Mantén tu racha!',
      body: 'Tienes una racha de {streak} días. ¡No la rompas hoy!',
    },
    
    pendingHabits: {
      title: '📋 Hábitos Pendientes',
      body: 'Revisa tus hábitos del día antes de que termine',
    },
    
    dailyDigest: {
      title: '📊 Resumen del Día',
      body: 'Completaste {completed} de {total} hábitos hoy',
    },
    
    weeklyReport: {
      title: '📈 Reporte Semanal',
      body: 'Tu progreso semanal está listo. ¡Revisa tus estadísticas!',
    },
    
    achievement: {
      title: '🏆 ¡Logro Desbloqueado!',
      body: '¡Felicidades! Has alcanzado: {achievementName} (+{points} pts)',
    },
    
    levelUp: {
      title: '🎉 ¡Subiste de Nivel!',
      body: '¡Felicidades! Has alcanzado el {levelTitle}',
    },
    
    pointsEarned: {
      title: '⭐ Puntos Ganados',
      body: '¡Ganaste {points} puntos por completar tu hábito!',
    },
    
    motivation: {
      title: '💪 ¡Tú Puedes!',
      body: 'Cada pequeño paso te acerca a tus metas',
    },
  },

  // Horarios de notificaciones
  schedules: {
    pendingHabitsReminder: {
      hour: 20, // 8 PM
      minute: 0,
      repeats: true,
    },
    
    dailyDigest: {
      hour: 21, // 9 PM
      minute: 0,
      repeats: true,
    },
    
    weeklyReport: {
      dayOfWeek: 1, // Lunes
      hour: 9, // 9 AM
      minute: 0,
      repeats: true,
    },
    
    motivation: {
      hour: 7, // 7 AM
      minute: 0,
      repeats: true,
    },
  },

  // Configuración de rachas
  streaks: {
    // Programar recordatorio de racha cuando se alcance este número
    reminderThreshold: 3,
    
    // Mensajes especiales para rachas específicas
    specialMessages: {
      7: '¡Una semana completa! 🎉',
      14: '¡Dos semanas! Eres increíble 🌟',
      30: '¡Un mes! ¡Eres una máquina! 🚀',
      100: '¡100 días! ¡Leyenda! 👑',
    },
  },

  // Configuración de categorías
  categories: {
    health: {
      icon: '🏃‍♂️',
      color: '#10B981', // Verde
      priority: 'high',
    },
    
    work: {
      icon: '💼',
      color: '#3B82F6', // Azul
      priority: 'high',
    },
    
    learning: {
      icon: '📚',
      color: '#8B5CF6', // Púrpura
      priority: 'medium',
    },
    
    personal: {
      icon: '❤️',
      color: '#F59E0B', // Amarillo
      priority: 'medium',
    },
    
    fitness: {
      icon: '💪',
      color: '#EF4444', // Rojo
      priority: 'high',
    },
  },

  // Configuración de sonidos (para futuras implementaciones)
  sounds: {
    default: 'default',
    gentle: 'gentle_reminder',
    urgent: 'urgent_alert',
    celebration: 'celebration',
  },

  // Configuración de badges
  badges: {
    enabled: false, // Los badges pueden ser molestos
    maxCount: 99,
  },

  // Configuración de repetición
  repetition: {
    // Si un hábito no se completa, cuántas veces recordar
    maxReminders: 3,
    
    // Intervalo entre recordatorios (en minutos)
    reminderInterval: 30,
    
    // Recordatorio final antes de marcar como perdido
    finalReminder: 60, // 1 hora antes
  },

  // Configuración de zona horaria
  timezone: {
    // Usar la zona horaria del dispositivo
    useDeviceTimezone: true,
    
    // Zona horaria por defecto (si no se puede detectar)
    defaultTimezone: 'America/Mexico_City',
  },

  // Configuración de quiet hours (horas de silencio)
  quietHours: {
    enabled: false,
    start: '22:00', // 10 PM
    end: '08:00',  // 8 AM
    
    // Excepciones para hábitos importantes
    allowImportantHabits: true,
    
    // Definir qué hábitos son importantes
    importantHabitCategories: ['health', 'medication'],
  },

  // Configuración de notificaciones push (para futuras implementaciones)
  pushNotifications: {
    enabled: false,
    
    // Servicios externos
    services: {
      expo: true,
      firebase: false,
      onesignal: false,
    },
    
    // Configuración de topics
    topics: {
      general: true,
      habits: true,
      achievements: true,
      motivation: true,
    },
  },
};

// Función para obtener mensaje personalizado
export const getNotificationMessage = (type, data = {}) => {
  const messageTemplate = NOTIFICATION_CONFIG.messages[type];
  if (!messageTemplate) return null;

  let title = messageTemplate.title;
  let body = messageTemplate.body;

  // Reemplazar placeholders con datos reales
  Object.keys(data).forEach(key => {
    const placeholder = `{${key}}`;
    title = title.replace(placeholder, data[key]);
    body = body.replace(placeholder, data[key]);
  });

  return { title, body };
};

// Función para obtener configuración de categoría
export const getCategoryConfig = (category) => {
  return NOTIFICATION_CONFIG.categories[category] || NOTIFICATION_CONFIG.categories.personal;
};

// Función para verificar si está en horas de silencio
export const isQuietHours = () => {
  if (!NOTIFICATION_CONFIG.quietHours.enabled) return false;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMinute] = NOTIFICATION_CONFIG.quietHours.start.split(':').map(Number);
  const [endHour, endMinute] = NOTIFICATION_CONFIG.quietHours.end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  if (startTime > endTime) {
    // Horas de silencio cruzan la medianoche
    return currentTime >= startTime || currentTime <= endTime;
  } else {
    return currentTime >= startTime && currentTime <= endTime;
  }
};

// Función para obtener prioridad de notificación
export const getNotificationPriority = (habit) => {
  const categoryConfig = getCategoryConfig(habit.category);
  const basePriority = categoryConfig.priority;
  
  // Aumentar prioridad para hábitos con rachas altas
  if (habit.streak >= NOTIFICATION_CONFIG.streaks.reminderThreshold) {
    return 'high';
  }
  
  // Aumentar prioridad para hábitos perdidos
  if (habit.status === 'missed') {
    return 'high';
  }
  
  return basePriority;
};

export default NOTIFICATION_CONFIG;
