import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Colors from '../constants/Colors';
import GlobalStyles from '../constants/Styles';
import AdvancedStatsService from '../services/AdvancedStatsService';
import { useHabits } from '../contexts/HabitsContext';

export default function QuickStatsCard({ navigation }) {
  const { habits } = useHabits();
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadQuickStats();
  }, [habits]);

  const loadQuickStats = async () => {
    try {
      setLoading(true);
      
      // Calcular estadísticas rápidas
      const productivity = AdvancedStatsService.calculateProductivityIndex(habits, 30);
      const trend = AdvancedStatsService.calculateCompletionTrend(habits, 7); // Últimos 7 días
      const categoryPerformance = AdvancedStatsService.analyzeCategoryPerformance(habits);
      
      setQuickStats({
        productivity,
        trend,
        categoryPerformance
      });
      
    } catch (error) {
      console.error('Error loading quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    // Animación de presión
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navegar a estadísticas avanzadas
    navigation.navigate('AdvancedStatistics');
  };

  if (loading || !quickStats) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const { productivity, trend, categoryPerformance } = quickStats;
  const topCategory = Object.entries(categoryPerformance)
    .sort(([, a], [, b]) => b.strength - a.strength)[0];

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Estadísticas Rápidas</Text>
          <Text style={styles.subtitle}>Resumen de tu progreso</Text>
        </View>

        {/* Estadísticas Principales */}
        <View style={styles.mainStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Productividad</Text>
            <Text style={styles.statValue}>{productivity.index}</Text>
            <Text style={styles.statUnit}>/100</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tendencia</Text>
            <Text style={[
              styles.statValue,
              { color: trend.summary.trendDirection === 'increasing' ? Colors.success : 
                       trend.summary.trendDirection === 'decreasing' ? Colors.error : Colors.textSecondary }
            ]}>
              {trend.summary.trendDirection === 'increasing' ? '↗️' :
               trend.summary.trendDirection === 'decreasing' ? '↘️' : '→'}
            </Text>
            <Text style={styles.statUnit}>
              {trend.summary.trendDirection === 'increasing' ? 'Subiendo' :
               trend.summary.trendDirection === 'decreasing' ? 'Bajando' : 'Estable'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mejor Categoría</Text>
            <Text style={styles.statValue}>{topCategory ? topCategory[0].slice(0, 8) : 'N/A'}</Text>
            <Text style={styles.statUnit}>{topCategory ? `${topCategory[1].strength}%` : ''}</Text>
          </View>
        </View>

        {/* Barra de Progreso de Productividad */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso de Productividad</Text>
            <Text style={styles.progressValue}>{productivity.index}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${productivity.index}%` }
              ]} 
            />
          </View>
        </View>

        {/* Insights Rápidos */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>💡 Insights Rápidos</Text>
          <View style={styles.insightItem}>
            <Text style={styles.insightText}>
              {productivity.index >= 80 ? '¡Excelente! Tu productividad está muy alta' :
               productivity.index >= 60 ? 'Buen trabajo, pero hay espacio para mejorar' :
               'Considera revisar tus hábitos para aumentar la productividad'}
            </Text>
          </View>
        </View>

        {/* Botón de Ver Más */}
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Ver Análisis Completo →</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.primary + '20',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  insightsSection: {
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  insightItem: {
    backgroundColor: Colors.backgroundTertiary,
    padding: 12,
    borderRadius: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
