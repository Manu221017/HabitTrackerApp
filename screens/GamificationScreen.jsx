import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import GlobalStyles from '../constants/Styles';
import GamificationService from '../services/GamificationService';
import { useAuth } from '../contexts/AuthContext';
import { useHabits } from '../contexts/HabitsContext';

const { width: screenWidth } = Dimensions.get('window');

export default function GamificationScreen({ navigation }) {
  const { user } = useAuth();
  const { habits } = useHabits();
  const [gamificationData, setGamificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadGamificationData();
    animateScreen();
  }, []);

  const animateScreen = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Obtener progreso del usuario obtenido 
      const progress = await GamificationService.getUserProgress(user.uid);
      
      // Calcular estadísticas actuales de cada usuario 
      const userStats = {
        totalHabits: habits.length,
        completedHabits: habits.filter(h => h.status === 'completed').length,
        bestStreak: Math.max(...habits.map(h => h.streak || 0)),
        totalCompletions: habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0),
        categoriesCompleted: new Set(habits.map(h => h.category)).size,
        perfectDays: 0, // Se calcularía con datos históricos
      };

      // Verificar logros
      const achievements = await GamificationService.checkAchievements(userStats, user.uid);
      
      // Generar desafíos semanales de cada usuario
      const challenges = GamificationService.generateWeeklyChallenges(userStats);
      
      // Calcular estadísticas de gamificación de cada usuario
      const gamificationStats = GamificationService.calculateGamificationStats(userStats, progress);
      
      setGamificationData({
        progress,
        userStats,
        achievements,
        challenges,
        gamificationStats
      });
      
    } catch (error) {
      console.error('Error alr cargar datos de gamificación:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLevelCard = () => {
    if (!gamificationData) return null;
    
    const { levelProgress, levelTitle, totalPoints } = gamificationData.gamificationStats;
    
    return (
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>{levelTitle}</Text>
          <Text style={styles.levelSubtitle}>Nivel {levelProgress.currentLevel}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${levelProgress.percentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {levelProgress.progress} / {levelProgress.total} puntos
          </Text>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Puntos Totales</Text>
          <Text style={styles.pointsValue}>{totalPoints}</Text>
        </View>
      </View>
    );
  };

  const renderAchievements = () => {
    if (!gamificationData?.achievements) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Logros Desbloqueados</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {gamificationData.achievements.map((achievement, index) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={styles.achievementTitle} numberOfLines={2}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementPoints}>+{achievement.points} pts</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderChallenges = () => {
    if (!gamificationData?.challenges) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Desafíos Semanales</Text>
        {gamificationData.challenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengePoints}>+{challenge.points} pts</Text>
            </View>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
            <View style={styles.challengeProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(challenge.progress / challenge.target) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {challenge.progress} / {challenge.target}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderBadges = () => {
    const availableBadges = GamificationService.getAvailableBadges();
    const userBadges = gamificationData?.progress?.badges || [];
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏅 Badges Disponibles</Text>
        <View style={styles.badgesGrid}>
          {Object.entries(availableBadges).map(([id, badge]) => {
            const isUnlocked = userBadges.includes(id);
            
            return (
              <View 
                key={id} 
                style={[
                  styles.badgeItem,
                  isUnlocked && styles.badgeUnlocked
                ]}
              >
                <Text style={[
                  styles.badgeIcon,
                  !isUnlocked && styles.badgeLocked
                ]}>
                  {badge.icon}
                </Text>
                <Text style={[
                  styles.badgeName,
                  !isUnlocked && styles.badgeLocked
                ]} numberOfLines={2}>
                  {badge.name}
                </Text>
                <Text style={styles.badgeRequirement} numberOfLines={2}>
                  {badge.requirement}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderRanking = () => {
    if (!gamificationData) return null;
    
    const { rank, nextMilestone } = gamificationData.gamificationStats;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Ranking y Hitos</Text>
        
        <View style={styles.rankingCard}>
          <Text style={styles.rankingTitle}>Tu Rango Actual</Text>
          <Text style={styles.rankingValue}>{rank}</Text>
        </View>
        
        {nextMilestone && (
          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneTitle}>Próximo Hito</Text>
            <Text style={styles.milestoneValue}>{nextMilestone.points} puntos</Text>
            <Text style={styles.milestoneRemaining}>
              Te faltan {nextMilestone.remaining} puntos
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderStats = () => {
    if (!gamificationData) return null;
    
    const { userStats } = gamificationData;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Estadísticas</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.totalHabits}</Text>
            <Text style={styles.statLabel}>Total Hábitos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.completedHabits}</Text>
            <Text style={styles.statLabel}>Completados Hoy</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.bestStreak}</Text>
            <Text style={styles.statLabel}>Mejor Racha</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.categoriesCompleted}</Text>
            <Text style={styles.statLabel}>Categorías</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={[GlobalStyles.container, styles.loadingContainer]}>
          <Text style={styles.loadingText}>Cargando gamificación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🎮 Gamificación</Text>
            <Text style={styles.headerSubtitle}>
              ¡Convierte tus hábitos en una aventura épica!
            </Text>
          </View>

          {/* Nivel y Progreso */}
          {renderLevelCard()}

          {/* Logros */}
          {renderAchievements()}

          {/* Desafíos */}
          {renderChallenges()}

          {/* Estadísticas */}
          {renderStats()}

          {/* Ranking */}
          {renderRanking()}

          {/* Badges */}
          {renderBadges()}

          {/* Información adicional */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>💡 Cómo Ganar Puntos</Text>
            <Text style={styles.infoText}>
              • Completar hábitos: +10 puntos{'\n'}
              • Mantener rachas: +5 puntos por día{'\n'}
              • Día perfecto: +20 puntos bonus{'\n'}
              • Logros especiales: +50 a +500 puntos{'\n'}
              • Desafíos semanales: +60 a +100 puntos
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.primary + '08',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  levelCard: {
    backgroundColor: Colors.backgroundSecondary,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary + '20',
  },
  levelHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  pointsContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  pointsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  achievementCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementPoints: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  challengeCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  challengePoints: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  rankingCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  rankingTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  rankingValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  milestoneCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  milestoneTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  milestoneValue: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: 4,
  },
  milestoneRemaining: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  badgeUnlocked: {
    borderColor: Colors.success + '40',
    backgroundColor: Colors.success + '08',
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeRequirement: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: Colors.backgroundSecondary,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
