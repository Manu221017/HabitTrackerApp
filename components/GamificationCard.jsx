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
import { useHabits } from '../contexts/HabitsContext';

export default function GamificationCard({ navigation }) {
  const { getGamificationStats } = useHabits();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const gamificationStats = await getGamificationStats();
      setStats(gamificationStats);
    } catch (error) {
      console.error('Error al cargar estadísticas de gamificación:', error);
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

    // Navegar a la pantalla de gamificación
    navigation.navigate('Gamification');
  };

  if (loading || !stats) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const { currentLevel, levelTitle, totalPoints, levelProgress, rank } = stats;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎮 Tu Progreso</Text>
          <Text style={styles.subtitle}>{levelTitle}</Text>
        </View>

        {/* Nivel y Puntos */}
        <View style={styles.mainInfo}>
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Nivel</Text>
            <Text style={styles.levelValue}>{currentLevel}</Text>
          </View>
          
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Puntos</Text>
            <Text style={styles.pointsValue}>{totalPoints}</Text>
          </View>
          
          <View style={styles.rankContainer}>
            <Text style={styles.rankLabel}>Rango</Text>
            <Text style={styles.rankValue}>{rank}</Text>
          </View>
        </View>

        {/* Barra de Progreso */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            Progreso al Nivel {currentLevel + 1}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${levelProgress.percentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {levelProgress.progress} / {levelProgress.total} pts
          </Text>
        </View>

        {/* Botón de Ver Más */}
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Ver Detalles →</Text>
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
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  levelContainer: {
    alignItems: 'center',
    flex: 1,
  },
  levelLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  pointsContainer: {
    alignItems: 'center',
    flex: 1,
  },
  pointsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.success,
  },
  rankContainer: {
    alignItems: 'center',
    flex: 1,
  },
  rankLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  rankValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
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
