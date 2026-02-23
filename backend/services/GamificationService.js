import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationMessage } from '../config/notificationConfig';
import NotificationService from './NotificationService';

class GamificationService {
  constructor() {
    this.pointsPerHabit = 10;
    this.streakBonus = 5;
    this.perfectDayBonus = 20;
    this.weeklyGoalBonus = 50;
    this.monthlyGoalBonus = 100;
  }

  // ===== SISTEMA DE PUNTOS =====

  // Calcular puntos por completar un hábito
  calculateHabitPoints(habit, streak) {
    let points = this.pointsPerHabit;
    
    // Bonus por racha
    if (streak > 1) {
      points += this.streakBonus * Math.min(streak, 10); // Máximo 10x bonus
    }
    
    // Bonus por categoría (hábitos importantes valen más)
    const categoryMultipliers = {
      'health': 1.5,
      'fitness': 1.3,
      'work': 1.2,
      'learning': 1.1,
      'personal': 1.0
    };
    
    const multiplier = categoryMultipliers[habit.category] || 1.0;
    points = Math.round(points * multiplier);
    
    return points;
  }

  // Calcular puntos por día perfecto
  calculatePerfectDayPoints(completedHabits, totalHabits) {
    if (completedHabits === totalHabits && totalHabits > 0) {
      return this.perfectDayBonus;
    }
    return 0;
  }

  // Calcular puntos por semana
  calculateWeeklyPoints(weeklyStats) {
    let points = 0;
    
    // Puntos por hábitos completados
    points += weeklyStats.completedHabits * this.pointsPerHabit;
    
    // Bonus por completar todos los hábitos de la semana
    if (weeklyStats.completedHabits === weeklyStats.totalHabits && weeklyStats.totalHabits > 0) {
      points += this.weeklyGoalBonus;
    }
    
    // Bonus por rachas mantenidas
    points += weeklyStats.maintainedStreaks * this.streakBonus;
    
    return points;
  }

  // ===== SISTEMA DE NIVELES =====

  // Calcular nivel basado en puntos totales
  calculateLevel(totalPoints) {
    // Fórmula: nivel = raíz cuadrada de (puntos / 100) + 1
    const level = Math.floor(Math.sqrt(totalPoints / 100)) + 1;
    return Math.max(1, level);
  }

  // Calcular progreso hacia el siguiente nivel
  calculateLevelProgress(totalPoints) {
    const currentLevel = this.calculateLevel(totalPoints);
    const pointsForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
    const pointsForNextLevel = Math.pow(currentLevel, 2) * 100;
    const progress = totalPoints - pointsForCurrentLevel;
    const total = pointsForNextLevel - pointsForCurrentLevel;
    
    return {
      currentLevel,
      progress,
      total,
      percentage: Math.round((progress / total) * 100)
    };
  }

  // Obtener título del nivel
  getLevelTitle(level) {
    const titles = {
      1: '🌱 Novato',
      2: '🌿 Aprendiz',
      3: '🌳 Intermedio',
      4: '🌲 Avanzado',
      5: '🏔️ Experto',
      6: '⭐ Maestro',
      7: '👑 Gran Maestro',
      8: '🚀 Leyenda',
      9: '💎 Diamante',
      10: '🌟 Estrella'
    };
    
    return titles[level] || `Nivel ${level}`;
  }

  // ===== SISTEMA DE LOGROS =====

  // Verificar logros desbloqueados
  async checkAchievements(userStats, userId) {
    const achievements = [];
    
    // Logros por rachas
    if (userStats.bestStreak >= 7) {
      achievements.push({
        id: 'streak_7',
        title: '🔥 Una Semana de Fuego',
        description: 'Mantuviste una racha de 7 días',
        icon: '🔥',
        points: 50,
        type: 'streak'
      });
    }
    
    if (userStats.bestStreak >= 30) {
      achievements.push({
        id: 'streak_30',
        title: '🚀 Un Mes de Éxito',
        description: 'Mantuviste una racha de 30 días',
        icon: '🚀',
        points: 200,
        type: 'streak'
      });
    }
    
    if (userStats.bestStreak >= 100) {
      achievements.push({
        id: 'streak_100',
        title: '👑 Leyenda de la Constancia',
        description: 'Mantuviste una racha de 100 días',
        icon: '👑',
        points: 500,
        type: 'streak'
      });
    }
    
    // Logros por hábitos completados
    if (userStats.totalCompletions >= 100) {
      achievements.push({
        id: 'completions_100',
        title: '💯 Centenario',
        description: 'Completaste 100 hábitos',
        icon: '💯',
        points: 100,
        type: 'completions'
      });
    }
    
    if (userStats.totalCompletions >= 500) {
      achievements.push({
        id: 'completions_500',
        title: '🎯 Maestro de la Persistencia',
        description: 'Completaste 500 hábitos',
        icon: '🎯',
        points: 300,
        type: 'completions'
      });
    }
    
    // Logros por días perfectos
    if (userStats.perfectDays >= 7) {
      achievements.push({
        id: 'perfect_week',
        title: '⭐ Semana Perfecta',
        description: 'Tuviste 7 días perfectos',
        icon: '⭐',
        points: 150,
        type: 'perfect_days'
      });
    }
    
    // Logros por categorías
    if (userStats.categoriesCompleted >= 5) {
      achievements.push({
        id: 'categories_5',
        title: '🌈 Diversificador',
        description: 'Completaste hábitos en 5 categorías diferentes',
        icon: '🌈',
        points: 100,
        type: 'categories'
      });
    }
    
    return achievements;
  }

  // ===== SISTEMA DE BADGES =====

  // Obtener badges disponibles
  getAvailableBadges() {
    return {
      // Badges por rachas
      'streak_3': { name: '🔥 Iniciando', icon: '🔥', requirement: '3 días de racha' },
      'streak_7': { name: '🔥 Semanal', icon: '🔥', requirement: '7 días de racha' },
      'streak_14': { name: '🔥 Quincenal', icon: '🔥', requirement: '14 días de racha' },
      'streak_30': { name: '🔥 Mensual', icon: '🔥', requirement: '30 días de racha' },
      
      // Badges por hábitos completados
      'completions_10': { name: '🎯 Principiante', icon: '🎯', requirement: '10 hábitos completados' },
      'completions_50': { name: '🎯 Intermedio', icon: '🎯', requirement: '50 hábitos completados' },
      'completions_100': { name: '🎯 Avanzado', icon: '🎯', requirement: '100 hábitos completados' },
      
      // Badges por días perfectos
      'perfect_1': { name: '⭐ Día Perfecto', icon: '⭐', requirement: '1 día perfecto' },
      'perfect_7': { name: '⭐ Semana Perfecta', icon: '⭐', requirement: '7 días perfectos' },
      'perfect_30': { name: '⭐ Mes Perfecto', icon: '⭐', requirement: '30 días perfectos' },
      
      // Badges especiales
      'early_bird': { name: '🌅 Madrugador', icon: '🌅', requirement: 'Completar hábito antes de las 7 AM' },
      'night_owl': { name: '🦉 Nocturno', icon: '🦉', requirement: 'Completar hábito después de las 10 PM' },
      'weekend_warrior': { name: '🏆 Guerrero del Fin de Semana', icon: '🏆', requirement: 'Completar todos los hábitos del fin de semana' }
    };
  }

  // ===== SISTEMA DE RECOMPENSAS =====

  // Obtener recompensas por nivel
  getLevelRewards(level) {
    const rewards = {
      title: this.getLevelTitle(level),
      points: level * 50,
      special: level % 5 === 0 ? '🎁 Recompensa Especial' : null,
      message: this.getLevelUpMessage(level)
    };
    
    return rewards;
  }

  // Mensaje de subida de nivel
  getLevelUpMessage(level) {
    const messages = {
      1: '¡Bienvenido al viaje de la mejora personal!',
      2: '¡Ya estás en camino! Cada paso cuenta.',
      3: '¡Mantén el ritmo! Estás progresando.',
      4: '¡Excelente trabajo! La consistencia es la clave.',
      5: '¡Eres un experto en formación!',
      6: '¡Maestro de los hábitos! Inspiras a otros.',
      7: '¡Gran Maestro! Tu dedicación es admirable.',
      8: '¡Leyenda viviente! Has superado todas las expectativas.',
      9: '¡Diamante puro! Eres un ejemplo de excelencia.',
      10: '¡Estrella brillante! Has alcanzado la cima.'
    };
    
    return messages[level] || '¡Felicidades por tu nuevo nivel!';
  }

  // ===== SISTEMA DE DESAFÍOS =====

  // Generar desafíos semanales
  generateWeeklyChallenges(userStats) {
    const challenges = [];
    
    // Desafío de racha
    const currentStreak = userStats.bestStreak || 0;
    challenges.push({
      id: 'weekly_streak',
      title: '🔥 Mantén la Racha',
      description: `Mantén una racha de ${Math.max(3, currentStreak + 2)} días esta semana`,
      points: 100,
      progress: 0,
      target: Math.max(3, currentStreak + 2),
      type: 'streak'
    });
    
    // Desafío de hábitos completados
    const weeklyTarget = Math.ceil(userStats.totalHabits * 0.8);
    challenges.push({
      id: 'weekly_completions',
      title: '🎯 Semana Productiva',
      description: `Completa al menos ${weeklyTarget} hábitos esta semana`,
      points: 80,
      progress: 0,
      target: weeklyTarget,
      type: 'completions'
    });
    
    // Desafío de categorías
    challenges.push({
      id: 'weekly_categories',
      title: '🌈 Diversidad',
      description: 'Completa hábitos en al menos 3 categorías diferentes',
      points: 60,
      progress: 0,
      target: 3,
      type: 'categories'
    });
    
    return challenges;
  }

  // ===== GESTIÓN DE DATOS =====

  // Guardar progreso del usuario
  async saveUserProgress(userId, progress) {
    try {
      const key = `gamification_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error('Error al guardar progreso:', error);
      return false;
    }
  }

  // Obtener progreso del usuario
  async getUserProgress(userId) {
    try {
      const key = `gamification_${userId}`;
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : this.getDefaultProgress();
    } catch (error) {
      console.error('Error al obtener progreso:', error);
      return this.getDefaultProgress();
    }
  }

  // Progreso por defecto
  getDefaultProgress() {
    return {
      totalPoints: 0,
      level: 1,
      achievements: [],
      badges: [],
      challenges: [],
      stats: {
        totalHabitsCompleted: 0,
        bestStreak: 0,
        perfectDays: 0,
        categoriesCompleted: 0,
        weeklyGoals: 0,
        monthlyGoals: 0
      },
      lastUpdated: new Date().toISOString()
    };
  }

  // ===== NOTIFICACIONES DE GAMIFICACIÓN =====

  // Notificar logro desbloqueado
  async notifyAchievement(achievement) {
    try {
      const message = getNotificationMessage('achievement', {
        achievementName: achievement.title,
        points: achievement.points
      });
      
      await NotificationService.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: { type: 'achievement', achievementId: achievement.id },
          sound: 'default',
        },
        trigger: {
          seconds: 1, // Notificación inmediata
        },
      });
      
      return true;
    } catch (error) {
      console.error('Error al notificar logro:', error);
      return false;
    }
  }

  // Notificar subida de nivel
  async notifyLevelUp(level, rewards) {
    try {
      const message = `¡Subiste al ${rewards.title}! +${rewards.points} puntos`;
      
      await NotificationService.scheduleNotificationAsync({
        content: {
          title: '🎉 ¡Subiste de Nivel!',
          body: message,
          data: { type: 'level_up', level, points: rewards.points },
          sound: 'default',
        },
        trigger: {
          seconds: 1,
        },
      });
      
      return true;
    } catch (error) {
      console.error('Error al notificar subida de nivel:', error);
      return false;
    }
  }

  // ===== ESTADÍSTICAS DE GAMIFICACIÓN =====

  // Calcular estadísticas completas
  calculateGamificationStats(userStats, gamificationProgress) {
    return {
      currentLevel: gamificationProgress.level,
      levelTitle: this.getLevelTitle(gamificationProgress.level),
      totalPoints: gamificationProgress.totalPoints,
      levelProgress: this.calculateLevelProgress(gamificationProgress.totalPoints),
      achievements: gamificationProgress.achievements.length,
      badges: gamificationProgress.badges.length,
      challenges: gamificationProgress.challenges.filter(c => c.completed).length,
      rank: this.calculateRank(gamificationProgress.totalPoints),
      nextMilestone: this.getNextMilestone(gamificationProgress.totalPoints)
    };
  }

  // Calcular ranking
  calculateRank(points) {
    if (points >= 10000) return '👑 Emperador';
    if (points >= 5000) return '⭐ Estrella';
    if (points >= 2000) return '🏆 Campeón';
    if (points >= 1000) return '🎯 Experto';
    if (points >= 500) return '🌱 Intermedio';
    return '🌱 Novato';
  }

  // Obtener próximo hito
  getNextMilestone(points) {
    const milestones = [100, 500, 1000, 2000, 5000, 10000];
    const next = milestones.find(m => m > points);
    return next ? { points: next, remaining: next - points } : null;
  }
}

export default new GamificationService();
