import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { useThemedStyles, useTheme } from '../../contexts/ThemeContext';
import AdvancedStatsService from '../../../backend/services/AdvancedStatsService';
import { useHabits } from '../../contexts/HabitsContext';
import { useAuth } from '../../contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  timeRangeContainer: {
    padding: 16,
    backgroundcolor: colors.backgroundSecondary,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.background,
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: colors.textInverse,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: colors.primary + '20',
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  productivitySection: {
    marginBottom: 24,
  },
  productivityCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  productivityHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  productivityTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  productivityScore: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  productivityFactors: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 16,
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  factorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  trendSummary: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  trendLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  trendValue: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  categoryStrength: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryStat: {
    alignItems: 'center',
    flex: 1,
  },
  categoryStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timeDistribution: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
  },
  timeDistributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    fontSize: 12,
    color: colors.textSecondary,
    width: '48%',
    marginBottom: 4,
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  insightPriority: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  insightPriorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  insightMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  recommendationType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendationTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default function AdvancedStatisticsScreen({ navigation }) {
  const GlobalStyles = useThemedStyles();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { habits } = useHabits();
  const [selectedTimeRange, setSelectedTimeRange] = useState(30);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const screenStyles = createStyles(colors);

  const timeRanges = [
    { label: '7 días', value: 7 },
    { label: '30 días', value: 30 },
    { label: '90 días', value: 90 }
  ];

  useEffect(() => {
    loadAdvancedStats();
  }, [habits, selectedTimeRange]);

  const loadAdvancedStats = async () => {
    try {
      setLoading(true);
      const report = AdvancedStatsService.generateCompleteReport(habits, selectedTimeRange);
      setStatsData(report);
    } catch (error) {
      console.error('Error loading advanced stats:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas avanzadas');
    } finally {
      setLoading(false);
    }
  };

  const renderTimeRangeSelector = () => (
    <View style={screenStyles.timeRangeContainer}>
      <Text style={screenStyles.sectionTitle}>Período de Análisis</Text>
      <View style={screenStyles.timeRangeButtons}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range.value}
            style={[
              screenStyles.timeRangeButton,
              selectedTimeRange === range.value && screenStyles.timeRangeButtonActive
            ]}
            onPress={() => setSelectedTimeRange(range.value)}
          >
            <Text style={[
              screenStyles.timeRangeButtonText,
              selectedTimeRange === range.value && screenStyles.timeRangeButtonTextActive
            ]}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOverviewTab = () => {
    if (!statsData) return null;

    const { summary, trends, productivity } = statsData;

    return (
      <View style={screenStyles.tabContent}>
        {/* Resumen General */}
        <View style={screenStyles.summarySection}>
          <Text style={screenStyles.sectionTitle}>📊 Resumen General</Text>
          <View style={screenStyles.summaryGrid}>
            <View style={screenStyles.summaryCard}>
              <Text style={screenStyles.summaryValue}>{summary.totalHabits}</Text>
              <Text style={screenStyles.summaryLabel}>Total Hábitos</Text>
            </View>
            <View style={screenStyles.summaryCard}>
              <Text style={screenStyles.summaryValue}>{summary.activeHabits}</Text>
              <Text style={screenStyles.summaryLabel}>Activos</Text>
            </View>
            <View style={screenStyles.summaryCard}>
              <Text style={screenStyles.summaryValue}>{summary && summary.completionRate !== undefined ? Math.round(summary.completionRate * 100) / 100 : 'Cargando...'}</Text>
              <Text style={screenStyles.summaryLabel}>Tasa Completación</Text>
            </View>
            <View style={screenStyles.summaryCard}>
              <Text style={screenStyles.summaryValue}>{summary.bestStreak}</Text>
              <Text style={screenStyles.summaryLabel}>Mejor Racha</Text>
            </View>
          </View>
        </View>

        {/* Índice de Productividad */}
        <View style={screenStyles.productivitySection}>
          <Text style={screenStyles.sectionTitle}>🚀 Índice de Productividad</Text>
          <View style={screenStyles.productivityCard}>
            <View style={screenStyles.productivityHeader}>
              <Text style={screenStyles.productivityTitle}>Tu Puntuación</Text>
              <Text style={screenStyles.productivityScore}>{productivity.index}</Text>
            </View>
            
            <View style={screenStyles.productivityFactors}>
              <Text style={screenStyles.factorTitle}>Factores:</Text>
              <View style={screenStyles.factorItem}>
                <Text style={screenStyles.factorLabel}>Tasa de Completación</Text>
                <Text style={screenStyles.factorValue}>{productivity && productivity.factors && productivity.factors.completionRate !== undefined ? productivity.factors.completionRate + '%' : 'Cargando...'}</Text>
              </View>
              <View style={screenStyles.factorItem}>
                <Text style={screenStyles.factorLabel}>Bonus por Rachas</Text>
                <Text style={screenStyles.factorValue}>{productivity && productivity.factors && productivity.factors.streakBonus !== undefined ? '+' + productivity.factors.streakBonus : 'Cargando...'}</Text>
              </View>
              <View style={screenStyles.factorItem}>
                <Text style={screenStyles.factorLabel}>Bonus por Consistencia</Text>
                <Text style={screenStyles.factorValue}>{productivity && productivity.factors && productivity.factors.consistencyBonus !== undefined ? '+' + productivity.factors.consistencyBonus : 'Cargando...'}</Text>
              </View>
              <View style={screenStyles.factorItem}>
                <Text style={screenStyles.factorLabel}>Bonus por Variedad</Text>
                <Text style={screenStyles.factorValue}>{productivity && productivity.factors && productivity.factors.varietyBonus !== undefined ? '+' + productivity.factors.varietyBonus : 'Cargando...'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gráfico de Tendencia */}
        <View style={screenStyles.chartSection}>
          <Text style={screenStyles.sectionTitle}>📈 Tendencia de Completación</Text>
          <View style={screenStyles.chartContainer}>
            <LineChart
              data={{
                labels: trends.trendData.slice(-7).map(d => d.date.slice(5)), // Solo últimos 7 días
                datasets: [{
                  data: trends.trendData.slice(-7).map(d => d.completed)
                }]
              }}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundColor: colors.backgroundSecondary,
                backgroundGradientFrom: colors.backgroundSecondary,
                backgroundGradientTo: colors.backgroundSecondary,
                decimalPlaces: 0,
                color: (opacity = 1) => colors.primary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
                labelColor: (opacity = 1) => colors.textSecondary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: colors.primary
                }
              }}
              bezier
              style={screenStyles.chart}
            />
          </View>
          
          <View style={screenStyles.trendSummary}>
            <Text style={screenStyles.trendLabel}>
              Tendencia: <Text style={[
                screenStyles.trendValue,
                { color: trends.summary.trendDirection === 'increasing' ? colors.success : 
                         trends.summary.trendDirection === 'decreasing' ? colors.error : colors.textSecondary }
              ]}>
                {trends.summary.trendDirection === 'increasing' ? '↗️ Aumentando' :
                 trends.summary.trendDirection === 'decreasing' ? '↘️ Disminuyendo' : '→ Estable'}
              </Text>
            </Text>
            <Text style={screenStyles.trendLabel}>
              Consistencia: <Text style={screenStyles.trendValue}>{trends.summary.consistency}</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoriesTab = () => {
    if (!statsData) return null;

    const { categories } = statsData;
    const categoryEntries = Object.entries(categories);

    return (
      <View style={screenStyles.tabContent}>
        {/* Gráfico de Categorías */}
        <View style={screenStyles.chartSection}>
          <Text style={screenStyles.sectionTitle}>🏷️ Rendimiento por Categoría</Text>
          <View style={screenStyles.chartContainer}>
            <BarChart
              data={{
                labels: categoryEntries.map(([cat]) => cat.slice(0, 6)),
                datasets: [{
                  data: categoryEntries.map(([, data]) => data.strength)
                }]
              }}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundColor: colors.backgroundSecondary,
                backgroundGradientFrom: colors.backgroundSecondary,
                backgroundGradientTo: colors.backgroundSecondary,
                decimalPlaces: 0,
                color: (opacity = 1) => colors.primary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
                labelColor: (opacity = 1) => colors.textSecondary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
                style: {
                  borderRadius: 16
                }
              }}
              style={screenStyles.chart}
              fromZero
            />
          </View>
        </View>

        {/* Lista de Categorías */}
        <View style={screenStyles.categoriesSection}>
          <Text style={screenStyles.sectionTitle}>📋 Detalle por Categoría</Text>
          {categoryEntries.map(([category, data]) => (
            <View key={category} style={screenStyles.categoryCard}>
              <View style={screenStyles.categoryHeader}>
                <Text style={screenStyles.categoryName}>{category}</Text>
                <Text style={screenStyles.categoryStrength}>{data.strength}%</Text>
              </View>
              
              <View style={screenStyles.categoryStats}>
                <View style={screenStyles.categoryStat}>
                  <Text style={screenStyles.categoryStatLabel}>Completación</Text>
                  <Text style={screenStyles.categoryStatValue}>{data && data.completionRate !== undefined ? Math.round(data.completionRate) + '%' : 'Cargando...'}</Text>
                </View>
                <View style={screenStyles.categoryStat}>
                  <Text style={screenStyles.categoryStatLabel}>Racha Promedio</Text>
                  <Text style={screenStyles.categoryStatValue}>{Math.round(data.averageStreak * 100) / 100}</Text>
                </View>
                <View style={screenStyles.categoryStat}>
                  <Text style={screenStyles.categoryStatLabel}>Total Completados</Text>
                  <Text style={screenStyles.categoryStatValue}>{data.totalCompletions}</Text>
                </View>
              </View>

              {data.timeDistribution && (
                <View style={screenStyles.timeDistribution}>
                  <Text style={screenStyles.timeDistributionTitle}>Horarios Preferidos:</Text>
                  <View style={screenStyles.timeSlots}>
                    <Text style={screenStyles.timeSlot}>🌅 Mañana: {Math.round(data.timeDistribution.morning)}%</Text>
                    <Text style={screenStyles.timeSlot}>☀️ Tarde: {Math.round(data.timeDistribution.afternoon)}%</Text>
                    <Text style={screenStyles.timeSlot}>🌆 Noche: {Math.round(data.timeDistribution.evening)}%</Text>
                    <Text style={screenStyles.timeSlot}>🌙 Madrugada: {Math.round(data.timeDistribution.night)}%</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderInsightsTab = () => {
    if (!statsData) return null;

    const { insights, recommendations } = statsData;

    return (
      <View style={screenStyles.tabContent}>
        {/* Insights */}
        <View style={screenStyles.insightsSection}>
          <Text style={screenStyles.sectionTitle}>💡 Insights y Análisis</Text>
          {insights.map((insight, index) => (
            <View key={index} style={[
              screenStyles.insightCard,
              { borderLeftColor: insight.type === 'success' ? colors.success : 
                               insight.type === 'warning' ? colors.error : colors.primary }
            ]}>
              <View style={screenStyles.insightHeader}>
                <Text style={screenStyles.insightTitle}>{insight.title}</Text>
                <View style={[
                  screenStyles.insightPriority,
                  { backgroundColor: insight.priority === 'high' ? colors.error + '20' : 
                                   insight.priority === 'medium' ? colors.primary + '20' : colors.success + '20' }
                ]}>
                  <Text style={[
                    screenStyles.insightPriorityText,
                    { color: insight.priority === 'high' ? colors.error : 
                             insight.priority === 'medium' ? colors.primary : colors.success }
                  ]}>
                    {insight.priority === 'high' ? 'Alta' : 
                     insight.priority === 'medium' ? 'Media' : 'Baja'}
                  </Text>
                </View>
              </View>
              <Text style={screenStyles.insightMessage}>{insight.message}</Text>
            </View>
          ))}
        </View>

        {/* Recomendaciones */}
        <View style={screenStyles.recommendationsSection}>
          <Text style={screenStyles.sectionTitle}>🎯 Recomendaciones</Text>
          {recommendations.map((rec, index) => (
            <View key={index} style={screenStyles.recommendationCard}>
              <View style={screenStyles.recommendationHeader}>
                <Text style={screenStyles.recommendationTitle}>{rec.title}</Text>
                <View style={[
                  screenStyles.recommendationType,
                  { backgroundColor: rec.type === 'action' ? colors.primary + '20' : colors.success + '20' }
                ]}>
                  <Text style={[
                    screenStyles.recommendationTypeText,
                    { color: rec.type === 'action' ? colors.primary : colors.success }
                  ]}>
                    {rec.type === 'action' ? 'Acción' : 'Estrategia'}
                  </Text>
                </View>
              </View>
              <Text style={screenStyles.recommendationDescription}>{rec.description}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={screenStyles.tabsContainer}>
      <TouchableOpacity
        style={[screenStyles.tab, activeTab === 'overview' && screenStyles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <Text style={[screenStyles.tabText, activeTab === 'overview' && screenStyles.activeTabText]}>
          📊 Resumen
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[screenStyles.tab, activeTab === 'categories' && screenStyles.activeTab]}
        onPress={() => setActiveTab('categories')}
      >
        <Text style={[screenStyles.tabText, activeTab === 'categories' && screenStyles.activeTabText]}>
          🏷️ Categorías
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[screenStyles.tab, activeTab === 'insights' && screenStyles.activeTab]}
        onPress={() => setActiveTab('insights')}
      >
        <Text style={[screenStyles.tabText, activeTab === 'insights' && screenStyles.activeTabText]}>
          💡 Insights
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={[GlobalStyles.container, screenStyles.loadingContainer]}>
          <Text style={screenStyles.loadingText}>Analizando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={screenStyles.container}>
        {/* Header */}
        <View style={screenStyles.header}>
          <Text style={screenStyles.headerTitle}>📊 Estadísticas Avanzadas</Text>
          <Text style={screenStyles.headerSubtitle}>
            Análisis profundo de tu progreso y patrones
          </Text>
        </View>

        {/* Selector de Período */}
        {renderTimeRangeSelector()}

        {/* Tabs */}
        {renderTabs()}

        {/* Contenido de Tabs */}
        <ScrollView style={screenStyles.tabContentContainer} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'categories' && renderCategoriesTab()}
          {activeTab === 'insights' && renderInsightsTab()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
