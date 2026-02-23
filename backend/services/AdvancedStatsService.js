import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

class AdvancedStatsService {
  constructor() {
    this.timeRanges = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };
  }

  // ===== ANÁLISIS DE TENDENCIAS =====

  // Calcular tendencia de completación de hábitos
  calculateCompletionTrend(habits, days = 30) {
    const today = new Date();
    const trendData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const completedCount = habits.filter(habit => {
        if (habit.lastCompleted) {
          const habitDate = new Date(habit.lastCompleted.toDate ? habit.lastCompleted.toDate() : habit.lastCompleted);
          return habitDate.toISOString().split('T')[0] === dateStr;
        }
        return false;
      }).length;
      
      trendData.push({
        date: dateStr,
        completed: completedCount,
        dayOfWeek: date.getDay(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    return this.analyzeTrend(trendData);
  }

  // Analizar tendencia y calcular métricas
  analyzeTrend(trendData) {
    const completedCounts = trendData.map(d => d.completed);
    const totalCompleted = completedCounts.reduce((sum, count) => sum + count, 0);
    const average = totalCompleted / completedCounts.length;
    
    // Calcular tendencia (pendiente de la línea de regresión)
    const trend = this.calculateLinearRegression(trendData);
    
    // Calcular variabilidad
    const variance = completedCounts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / completedCounts.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Identificar patrones semanales
    const weeklyPattern = this.analyzeWeeklyPattern(trendData);
    
    // Calcular días más productivos
    const mostProductiveDays = this.findMostProductiveDays(trendData);
    
    return {
      trendData,
      summary: {
        totalCompleted,
        average,
        trend: trend.slope,
        trendDirection: trend.slope > 0.1 ? 'increasing' : trend.slope < -0.1 ? 'decreasing' : 'stable',
        standardDeviation,
        consistency: this.calculateConsistency(standardDeviation, average),
        weeklyPattern,
        mostProductiveDays
      }
    };
  }

  // Calcular regresión lineal para tendencia
  calculateLinearRegression(data) {
    const n = data.length;
    const xValues = Array.from({length: n}, (_, i) => i);
    const yValues = data.map(d => d.completed);
    
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  // Analizar patrón semanal
  analyzeWeeklyPattern(trendData) {
    const weeklyStats = Array(7).fill(0).map(() => ({ count: 0, total: 0 }));
    
    trendData.forEach(day => {
      weeklyStats[day.dayOfWeek].count++;
      weeklyStats[day.dayOfWeek].total += day.completed;
    });
    
    return weeklyStats.map((day, index) => ({
      dayOfWeek: index,
      dayName: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][index],
      average: day.count > 0 ? day.total / day.count : 0
    }));
  }

  // Encontrar días más productivos
  findMostProductiveDays(trendData) {
    const dayAverages = this.analyzeWeeklyPattern(trendData);
    return dayAverages
      .sort((a, b) => b.average - a.average)
      .slice(0, 3)
      .map(day => ({
        day: day.dayName,
        average: Math.round(day.average * 100) / 100
      }));
  }

  // Calcular consistencia
  calculateConsistency(standardDeviation, average) {
    if (average === 0) return 0;
    const coefficientOfVariation = standardDeviation / average;
    
    if (coefficientOfVariation < 0.3) return 'muy alta';
    if (coefficientOfVariation < 0.5) return 'alta';
    if (coefficientOfVariation < 0.7) return 'moderada';
    return 'baja';
  }

  // ===== ANÁLISIS DE CATEGORÍAS =====

  // Analizar rendimiento por categoría
  analyzeCategoryPerformance(habits) {
    const categories = {};
    
    habits.forEach(habit => {
      if (!categories[habit.category]) {
        categories[habit.category] = {
          total: 0,
          completed: 0,
          streak: 0,
          totalCompletions: 0,
          averageTime: 0,
          timeEntries: []
        };
      }
      
      categories[habit.category].total++;
      if (habit.status === 'completed') {
        categories[habit.category].completed++;
      }
      categories[habit.category].streak += habit.streak || 0;
      categories[habit.category].totalCompletions += habit.totalCompletions || 0;
      
      if (habit.time) {
        categories[habit.category].timeEntries.push(habit.time);
      }
    });
    
    // Calcular métricas por categoría
    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      cat.completionRate = cat.total > 0 ? (cat.completed / cat.total) * 100 : 0;
      cat.averageStreak = cat.total > 0 ? cat.streak / cat.total : 0;
      cat.averageCompletions = cat.total > 0 ? cat.totalCompletions / cat.total : 0;
      cat.timeDistribution = this.analyzeTimeDistribution(cat.timeEntries);
      cat.strength = this.calculateCategoryStrength(cat);
    });
    
    return categories;
  }

  // Analizar distribución de horarios
  analyzeTimeDistribution(timeEntries) {
    if (timeEntries.length === 0) return null;
    
    const timeSlots = {
      morning: 0,    // 6-12
      afternoon: 0,  // 12-18
      evening: 0,    // 18-24
      night: 0       // 0-6
    };
    
    timeEntries.forEach(time => {
      const hour = parseInt(time.split(':')[0]);
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else if (hour >= 18 && hour < 24) timeSlots.evening++;
      else timeSlots.night++;
    });
    
    const total = timeEntries.length;
    return {
      morning: (timeSlots.morning / total) * 100,
      afternoon: (timeSlots.afternoon / total) * 100,
      evening: (timeSlots.evening / total) * 100,
      night: (timeSlots.night / total) * 100,
      preferredTime: Object.entries(timeSlots)
        .sort(([,a], [,b]) => b - a)[0][0]
    };
  }

  // Calcular fortaleza de categoría
  calculateCategoryStrength(categoryData) {
    const completionWeight = 0.4;
    const streakWeight = 0.3;
    const consistencyWeight = 0.3;
    
    const completionScore = categoryData.completionRate / 100;
    const streakScore = Math.min(categoryData.averageStreak / 10, 1);
    const consistencyScore = categoryData.completionRate > 80 ? 1 : categoryData.completionRate / 80;
    
    return Math.round((completionScore * completionWeight + 
                      streakScore * streakWeight + 
                      consistencyScore * consistencyWeight) * 100);
  }

  // ===== ANÁLISIS DE RACHAS =====

  // Analizar patrones de rachas
  analyzeStreakPatterns(habits) {
    const streakData = habits
      .filter(h => h.streak > 0)
      .map(h => ({ streak: h.streak, category: h.category, title: h.title }));
    
    const streakDistribution = {};
    const categoryStreaks = {};
    
    streakData.forEach(({ streak, category, title }) => {
      // Distribución de rachas
      if (!streakDistribution[streak]) streakDistribution[streak] = [];
      streakDistribution[streak].push(title);
      
      // Racha por categoría
      if (!categoryStreaks[category]) categoryStreaks[category] = [];
      categoryStreaks[category].push(streak);
    });
    
    // Calcular estadísticas de rachas
    const allStreaks = streakData.map(h => h.streak);
    const maxStreak = Math.max(...allStreaks, 0);
    const averageStreak = allStreaks.length > 0 ? allStreaks.reduce((sum, s) => sum + s, 0) / allStreaks.length : 0;
    
    // Encontrar hábitos con mejores rachas
    const topStreaks = streakData
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5);
    
    return {
      distribution: streakDistribution,
      categoryStreaks,
      summary: {
        totalHabitsWithStreaks: streakData.length,
        maxStreak,
        averageStreak: Math.round(averageStreak * 100) / 100,
        topStreaks
      }
    };
  }

  // ===== ANÁLISIS DE PRODUCTIVIDAD =====

  // Calcular índice de productividad
  calculateProductivityIndex(habits, timeRange = 30) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - timeRange);
    
    const recentHabits = habits.filter(habit => {
      if (habit.createdAt) {
        const createdDate = habit.createdAt.toDate ? habit.createdAt.toDate() : new Date(habit.createdAt);
        return createdDate >= startDate;
      }
      return false;
    });
    
    const completedHabits = recentHabits.filter(h => h.status === 'completed');
    const totalHabits = recentHabits.length;
    
    if (totalHabits === 0) return 0;
    
    // Factores del índice de productividad
    const completionRate = (completedHabits.length / totalHabits) * 100;
    const streakBonus = this.calculateStreakBonus(habits);
    const consistencyBonus = this.calculateConsistencyBonus(habits, timeRange);
    const varietyBonus = this.calculateVarietyBonus(habits);
    
    const productivityIndex = Math.min(
      completionRate + streakBonus + consistencyBonus + varietyBonus,
      100
    );
    
    return {
      index: Math.round(productivityIndex * 100) / 100,
      factors: {
        completionRate: Math.round(completionRate * 100) / 100,
        streakBonus: Math.round(streakBonus * 100) / 100,
        consistencyBonus: Math.round(consistencyBonus * 100) / 100,
        varietyBonus: Math.round(varietyBonus * 100) / 100
      },
      breakdown: {
        totalHabits,
        completedHabits: completedHabits.length,
        recentHabits: recentHabits.length
      }
    };
  }

  // Calcular bonus por rachas
  calculateStreakBonus(habits) {
    const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
    return Math.min(totalStreak * 2, 20); // Máximo 20 puntos
  }

  // Calcular bonus por consistencia
  calculateConsistencyBonus(habits, timeRange) {
    const trend = this.calculateCompletionTrend(habits, timeRange);
    const consistency = trend.summary.consistency;
    
    switch (consistency) {
      case 'muy alta': return 15;
      case 'alta': return 10;
      case 'moderada': return 5;
      default: return 0;
    }
  }

  // Calcular bonus por variedad
  calculateVarietyBonus(habits) {
    const categories = new Set(habits.map(h => h.category));
    const categoryCount = categories.size;
    
    if (categoryCount >= 5) return 10;
    if (categoryCount >= 3) return 5;
    return 0;
  }

  // ===== INSIGHTS Y RECOMENDACIONES =====

  // Generar insights personalizados
  generateInsights(habits, timeRange = 30) {
    const insights = [];
    
    // Analizar tendencias
    const trend = this.calculateCompletionTrend(habits, timeRange);
    if (trend.summary.trendDirection === 'decreasing') {
      insights.push({
        type: 'warning',
        title: 'Tendencia Descendente',
        message: 'Tu tasa de completación está disminuyendo. Considera revisar tus hábitos más difíciles.',
        priority: 'high'
      });
    } else if (trend.summary.trendDirection === 'increasing') {
      insights.push({
        type: 'success',
        title: '¡Excelente Progreso!',
        message: 'Tu tasa de completación está mejorando. ¡Sigue así!',
        priority: 'low'
      });
    }
    
    // Analizar categorías
    const categoryPerformance = this.analyzeCategoryPerformance(habits);
    const weakCategories = Object.entries(categoryPerformance)
      .filter(([, data]) => data.strength < 50)
      .sort(([, a], [, b]) => a.strength - b.strength);
    
    if (weakCategories.length > 0) {
      insights.push({
        type: 'info',
        title: 'Categorías para Mejorar',
        message: `Considera enfocarte en: ${weakCategories.slice(0, 2).map(([cat]) => cat).join(', ')}`,
        priority: 'medium'
      });
    }
    
    // Analizar rachas
    const streakPatterns = this.analyzeStreakPatterns(habits);
    if (streakPatterns.summary.maxStreak >= 7) {
      insights.push({
        type: 'success',
        title: 'Racha Impresionante',
        message: `¡Tienes una racha de ${streakPatterns.summary.maxStreak} días! ¡Mantén el momentum!`,
        priority: 'low'
      });
    }
    
    // Analizar productividad
    const productivity = this.calculateProductivityIndex(habits, timeRange);
    if (productivity.index < 50) {
      insights.push({
        type: 'warning',
        title: 'Productividad Baja',
        message: 'Tu índice de productividad está bajo. Considera simplificar tus hábitos.',
        priority: 'high'
      });
    } else if (productivity.index > 80) {
      insights.push({
        type: 'success',
        title: '¡Productividad Alta!',
        message: 'Tu índice de productividad es excelente. ¡Eres muy consistente!',
        priority: 'low'
      });
    }
    
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // ===== MÉTRICAS COMPARATIVAS =====

  // Comparar con períodos anteriores
  async compareWithPreviousPeriods(userId, currentPeriod = 30) {
    try {
      const periods = [7, 14, 30, 90];
      const comparisons = {};
      
      for (const period of periods) {
        if (period <= currentPeriod) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - period);
          
          const habitsQuery = query(
            collection(db, 'habits'),
            where('userId', '==', userId),
            where('createdAt', '>=', startDate),
            orderBy('createdAt', 'desc')
          );
          
          const snapshot = await getDocs(habitsQuery);
          const habits = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          const productivity = this.calculateProductivityIndex(habits, period);
          comparisons[period] = productivity;
        }
      }
      
      return comparisons;
    } catch (error) {
      console.error('Error comparing periods:', error);
      return null;
    }
  }

  // ===== EXPORTACIÓN DE DATOS =====

  // Generar reporte completo
  generateCompleteReport(habits, timeRange = 30) {
    const trend = this.calculateCompletionTrend(habits, timeRange);
    const categoryPerformance = this.analyzeCategoryPerformance(habits);
    const streakPatterns = this.analyzeStreakPatterns(habits);
    const productivity = this.calculateProductivityIndex(habits, timeRange);
    const insights = this.generateInsights(habits, timeRange);
    
    return {
      period: timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalHabits: habits.length,
        activeHabits: habits.filter(h => h.isActive).length,
        completionRate: trend.summary.average,
        productivityIndex: productivity.index,
        bestStreak: streakPatterns.summary.maxStreak
      },
      trends: trend,
      categories: categoryPerformance,
      streaks: streakPatterns,
      productivity,
      insights,
      recommendations: this.generateRecommendations(insights, categoryPerformance)
    };
  }

  // Generar recomendaciones basadas en insights
  generateRecommendations(insights, categoryPerformance) {
    const recommendations = [];
    
    insights.forEach(insight => {
      if (insight.type === 'warning') {
        switch (insight.title) {
          case 'Tendencia Descendente':
            recommendations.push({
              type: 'action',
              title: 'Revisar Hábitos Difíciles',
              description: 'Identifica qué hábitos te están costando más y considera simplificarlos o cambiarlos.',
              priority: 'high'
            });
            break;
          case 'Productividad Baja':
            recommendations.push({
              type: 'action',
              title: 'Simplificar Rutina',
              description: 'Reduce el número de hábitos y enfócate en los más importantes.',
              priority: 'high'
            });
            break;
        }
      }
    });
    
    // Recomendaciones basadas en categorías débiles
    const weakCategories = Object.entries(categoryPerformance)
      .filter(([, data]) => data.strength < 50);
    
    if (weakCategories.length > 0) {
      recommendations.push({
        type: 'strategy',
        title: 'Enfoque en Categorías Débiles',
        description: `Considera dedicar más tiempo a: ${weakCategories.slice(0, 2).map(([cat]) => cat).join(', ')}`,
        priority: 'medium'
      });
    }
    
    return recommendations;
  }
}

export default new AdvancedStatsService();
