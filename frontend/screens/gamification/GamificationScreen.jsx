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
import Colors from '../../constants/Colors';
import { useThemedStyles, useTheme } from '../../contexts/ThemeContext';
import GamificationService from '../../../backend/services/GamificationService';
import { useAuth } from '../../contexts/AuthContext';
import { useHabits } from '../../contexts/HabitsContext';

const { width: screenWidth } = Dimensions.get('window');

export default function GamificationScreen({ navigation }) {
  const GlobalStyles = useThemedStyles();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { habits } = useHabits();
  const [gamificationData, setGamificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const screenStyles = createStyles(colors);

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
      <View style={screenStyles.levelCard}>
        <View style={screenStyles.levelHeader}>
          <Text style={screenStyles.levelTitle}>{levelTitle}</Text>
          <Text style={screenStyles.levelSubtitle}>Nivel {levelProgress.currentLevel}</Text>
        </View>
        
        <View style={screenStyles.progressContainer}>
          <View style={screenStyles.progressBar}>
            <View 
              style={[
                screenStyles.progressFill, 
                { width: `${levelProgress.percentage}%` }
              ]} 
            />
          </View>
          <Text style={screenStyles.progressText}>
            {levelProgress.progress} / {levelProgress.total} puntos
          </Text>
        </View>
        
        <View style={screenStyles.pointsContainer}>
          <Text style={screenStyles.pointsLabel}>Puntos Totales</Text>
          <Text style={screenStyles.pointsValue}>{totalPoints}</Text>
        </View>
      </View>
    );
  };

  const renderAchievements = () => {
    if (!gamificationData?.achievements) return null;
    
    return (
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>🏆 Logros Desbloqueados</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {gamificationData.achievements.map((achievement, index) => (
            <View key={achievement.id} style={screenStyles.achievementCard}>
              <Text style={screenStyles.achievementIcon}>{achievement.icon}</Text>
              <Text style={screenStyles.achievementTitle} numberOfLines={2}>
                {achievement.title}
              </Text>
              <Text style={screenStyles.achievementPoints}>+{achievement.points} pts</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderChallenges = () => {
    if (!gamificationData?.challenges) return null;
    
    return (
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>🎯 Desafíos Semanales</Text>
        {gamificationData.challenges.map((challenge) => (
          <View key={challenge.id} style={screenStyles.challengeCard}>
            <View style={screenStyles.challengeHeader}>
              <Text style={screenStyles.challengeTitle}>{challenge.title}</Text>
              <Text style={screenStyles.challengePoints}>+{challenge.points} pts</Text>
            </View>
            <Text style={screenStyles.challengeDescription}>{challenge.description}</Text>
            <View style={screenStyles.challengeProgress}>
              <View style={screenStyles.progressBar}>
                <View 
                  style={[
                    screenStyles.progressFill, 
                    { width: `${(challenge.progress / challenge.target) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={screenStyles.progressText}>
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
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>🏅 Badges Disponibles</Text>
        <View style={screenStyles.badgesGrid}>
          {Object.entries(availableBadges).map(([id, badge]) => {
            const isUnlocked = userBadges.includes(id);
            
            return (
              <View 
                key={id} 
                style={[
                  screenStyles.badgeItem,
                  isUnlocked && screenStyles.badgeUnlocked
                ]}
              >
                <Text style={[
                  screenStyles.badgeIcon,
                  !isUnlocked && screenStyles.badgeLocked
                ]}>
                  {badge.icon}
                </Text>
                <Text style={[
                  screenStyles.badgeName,
                  !isUnlocked && screenStyles.badgeLocked
                ]} numberOfLines={2}>
                  {badge.name}
                </Text>
                <Text style={screenStyles.badgeRequirement} numberOfLines={2}>
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
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>🏆 Ranking y Hitos</Text>
        
        <View style={screenStyles.rankingCard}>
          <Text style={screenStyles.rankingTitle}>Tu Rango Actual</Text>
          <Text style={screenStyles.rankingValue}>{rank}</Text>
        </View>
        
        {nextMilestone && (
          <View style={screenStyles.milestoneCard}>
            <Text style={screenStyles.milestoneTitle}>Próximo Hito</Text>
            <Text style={screenStyles.milestoneValue}>{nextMilestone.points} puntos</Text>
            <Text style={screenStyles.milestoneRemaining}>
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
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>📊 Estadísticas</Text>
        
        <View style={screenStyles.statsGrid}>
          <View style={screenStyles.statCard}>
            <Text style={screenStyles.statValue}>{userStats.totalHabits}</Text>
            <Text style={screenStyles.statLabel}>Total Hábitos</Text>
          </View>
          
          <View style={screenStyles.statCard}>
            <Text style={screenStyles.statValue}>{userStats.completedHabits}</Text>
            <Text style={screenStyles.statLabel}>Completados Hoy</Text>
          </View>
          
          <View style={screenStyles.statCard}>
            <Text style={screenStyles.statValue}>{userStats.bestStreak}</Text>
            <Text style={screenStyles.statLabel}>Mejor Racha</Text>
          </View>
          
          <View style={screenStyles.statCard}>
            <Text style={screenStyles.statValue}>{userStats.categoriesCompleted}</Text>
            <Text style={screenStyles.statLabel}>Categorías</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={[GlobalStyles.container, screenStyles.loadingContainer]}>
          <Text style={screenStyles.loadingText}>Cargando gamificación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <Animated.View style={[screenStyles.container, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={screenStyles.header}>
            <Text style={screenStyles.headerTitle}>🎮 Gamificación</Text>
            <Text style={screenStyles.headerSubtitle}>
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
          <View style={screenStyles.infoSection}>
            <Text style={screenStyles.infoTitle}>💡 Cómo Ganar Puntos</Text>
            <Text style={screenStyles.infoText}>
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

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.primary + '08',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  levelCard: {
    backgroundColor: colors.backgroundSecondary,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary + '20',
  },
  levelHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pointsContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  pointsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  achievementCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementPoints: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  challengeCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    color: colors.textPrimary,
    flex: 1,
  },
  challengePoints: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rankingCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  rankingTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  rankingValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  milestoneCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  milestoneTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  milestoneValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 4,
  },
  milestoneRemaining: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    backgroundColor: colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  badgeUnlocked: {
    borderColor: colors.success + '40',
    backgroundColor: colors.success + '08',
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
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeRequirement: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: colors.backgroundSecondary,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
