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
import Colors from '../constants/Colors';
import GlobalStyles from '../constants/Styles';
import AdvancedStatsService from '../services/AdvancedStatsService';
import { useHabits } from '../contexts/HabitsContext';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

export default function AdvancedStatisticsScreen({ navigation }) {
  const { user } = useAuth();
  const { habits } = useHabits();
  const [selectedTimeRange, setSelectedTimeRange] = useState(30);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
    <View style={styles.timeRangeContainer}>
      <Text style={styles.sectionTitle}>Período de Análisis</Text>
      <View style={styles.timeRangeButtons}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range.value}
            style={[
              styles.timeRangeButton,
              selectedTimeRange === range.value && styles.timeRangeButtonActive
            ]}
            onPress={() => setSelectedTimeRange(range.value)}
          >
            <Text style={[
              styles.timeRangeButtonText,
              selectedTimeRange === range.value && styles.timeRangeButtonTextActive
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
      <View style={styles.tabContent}>
        {/* Resumen General */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>📊 Resumen General</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{summary.totalHabits}</Text>
              <Text style={styles.summaryLabel}>Total Hábitos</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{summary.activeHabits}</Text>
              <Text style={styles.summaryLabel}>Activos</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{summary && summary.completionRate !== undefined ? Math.round(summary.completionRate * 100) / 100 : 'Cargando...'}</Text>
              <Text style={styles.summaryLabel}>Tasa Completación</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{summary.bestStreak}</Text>
              <Text style={styles.summaryLabel}>Mejor Racha</Text>
            </View>
          </View>
        </View>

        {/* Índice de Productividad */}
        <View style={styles.productivitySection}>
          <Text style={styles.sectionTitle}>🚀 Índice de Productividad</Text>
          <View style={styles.productivityCard}>
            <View style={styles.productivityHeader}>
              <Text style={styles.productivityTitle}>Tu Puntuación</Text>
              <Text style={styles.productivityScore}>{productivity.index}</Text>
            </View>
            
            <View style={styles.productivityFactors}>
              <Text style={styles.factorTitle}>Factores:</Text>
              <View style={styles.factorItem}>
                <Text style={styles.factorLabel}>Tasa de Completación</Text>
                <Text style={styles.factorValue}>{productivity && productivity.factors && productivity.factors.completionRate !== undefined ? productivity.factors.completionRate + '%' : 'Cargando...'}</Text>
              </View>
              <View style={styles.factorItem}>
                <Text style={styles.factorLabel}>Bonus por Rachas</Text>
                <Text style={styles.factorValue}>{productivity && productivity.factors && productivity.factors.streakBonus !== undefined ? '+' + productivity.factors.streakBonus : 'Cargando...'}</Text>
              </View>
              <View style={styles.factorItem}>
                <Text style={styles.factorLabel}>Bonus por Consistencia</Text>
                <Text style={styles.factorValue}>{productivity && productivity.factors && productivity.factors.consistencyBonus !== undefined ? '+' + productivity.factors.consistencyBonus : 'Cargando...'}</Text>
              </View>
              <View style={styles.factorItem}>
                <Text style={styles.factorLabel}>Bonus por Variedad</Text>
                <Text style={styles.factorValue}>{productivity && productivity.factors && productivity.factors.varietyBonus !== undefined ? '+' + productivity.factors.varietyBonus : 'Cargando...'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gráfico de Tendencia */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>📈 Tendencia de Completación</Text>
          <View style={styles.chartContainer}>
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
                backgroundColor: Colors.backgroundSecondary,
                backgroundGradientFrom: Colors.backgroundSecondary,
                backgroundGradientTo: Colors.backgroundSecondary,
                decimalPlaces: 0,
                color: (opacity = 1) => Colors.primary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
                labelColor: (opacity = 1) => Colors.textSecondary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: Colors.primary
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
          
          <View style={styles.trendSummary}>
            <Text style={styles.trendLabel}>
              Tendencia: <Text style={[
                styles.trendValue,
                { color: trends.summary.trendDirection === 'increasing' ? Colors.success : 
                         trends.summary.trendDirection === 'decreasing' ? Colors.error : Colors.textSecondary }
              ]}>
                {trends.summary.trendDirection === 'increasing' ? '↗️ Aumentando' :
                 trends.summary.trendDirection === 'decreasing' ? '↘️ Disminuyendo' : '→ Estable'}
              </Text>
            </Text>
            <Text style={styles.trendLabel}>
              Consistencia: <Text style={styles.trendValue}>{trends.summary.consistency}</Text>
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
      <View style={styles.tabContent}>
        {/* Gráfico de Categorías */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>🏷️ Rendimiento por Categoría</Text>
          <View style={styles.chartContainer}>
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
                backgroundColor: Colors.backgroundSecondary,
                backgroundGradientFrom: Colors.backgroundSecondary,
                backgroundGradientTo: Colors.backgroundSecondary,
                decimalPlaces: 0,
                color: (opacity = 1) => Colors.primary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
                labelColor: (opacity = 1) => Colors.textSecondary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
                style: {
                  borderRadius: 16
                }
              }}
              style={styles.chart}
              fromZero
            />
          </View>
        </View>

        {/* Lista de Categorías */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>📋 Detalle por Categoría</Text>
          {categoryEntries.map(([category, data]) => (
            <View key={category} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryStrength}>{data.strength}%</Text>
              </View>
              
              <View style={styles.categoryStats}>
                <View style={styles.categoryStat}>
                  <Text style={styles.categoryStatLabel}>Completación</Text>
                  <Text style={styles.categoryStatValue}>{data && data.completionRate !== undefined ? Math.round(data.completionRate) + '%' : 'Cargando...'}</Text>
                </View>
                <View style={styles.categoryStat}>
                  <Text style={styles.categoryStatLabel}>Racha Promedio</Text>
                  <Text style={styles.categoryStatValue}>{Math.round(data.averageStreak * 100) / 100}</Text>
                </View>
                <View style={styles.categoryStat}>
                  <Text style={styles.categoryStatLabel}>Total Completados</Text>
                  <Text style={styles.categoryStatValue}>{data.totalCompletions}</Text>
                </View>
              </View>

              {data.timeDistribution && (
                <View style={styles.timeDistribution}>
                  <Text style={styles.timeDistributionTitle}>Horarios Preferidos:</Text>
                  <View style={styles.timeSlots}>
                    <Text style={styles.timeSlot}>🌅 Mañana: {Math.round(data.timeDistribution.morning)}%</Text>
                    <Text style={styles.timeSlot}>☀️ Tarde: {Math.round(data.timeDistribution.afternoon)}%</Text>
                    <Text style={styles.timeSlot}>🌆 Noche: {Math.round(data.timeDistribution.evening)}%</Text>
                    <Text style={styles.timeSlot}>🌙 Madrugada: {Math.round(data.timeDistribution.night)}%</Text>
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
      <View style={styles.tabContent}>
        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>💡 Insights y Análisis</Text>
          {insights.map((insight, index) => (
            <View key={index} style={[
              styles.insightCard,
              { borderLeftColor: insight.type === 'success' ? Colors.success : 
                               insight.type === 'warning' ? Colors.error : Colors.primary }
            ]}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <View style={[
                  styles.insightPriority,
                  { backgroundColor: insight.priority === 'high' ? Colors.error + '20' : 
                                   insight.priority === 'medium' ? Colors.primary + '20' : Colors.success + '20' }
                ]}>
                  <Text style={[
                    styles.insightPriorityText,
                    { color: insight.priority === 'high' ? Colors.error : 
                             insight.priority === 'medium' ? Colors.primary : Colors.success }
                  ]}>
                    {insight.priority === 'high' ? 'Alta' : 
                     insight.priority === 'medium' ? 'Media' : 'Baja'}
                  </Text>
                </View>
              </View>
              <Text style={styles.insightMessage}>{insight.message}</Text>
            </View>
          ))}
        </View>

        {/* Recomendaciones */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>🎯 Recomendaciones</Text>
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <View style={[
                  styles.recommendationType,
                  { backgroundColor: rec.type === 'action' ? Colors.primary + '20' : Colors.success + '20' }
                ]}>
                  <Text style={[
                    styles.recommendationTypeText,
                    { color: rec.type === 'action' ? Colors.primary : Colors.success }
                  ]}>
                    {rec.type === 'action' ? 'Acción' : 'Estrategia'}
                  </Text>
                </View>
              </View>
              <Text style={styles.recommendationDescription}>{rec.description}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
          📊 Resumen
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
        onPress={() => setActiveTab('categories')}
      >
        <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
          🏷️ Categorías
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
        onPress={() => setActiveTab('insights')}
      >
        <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
          💡 Insights
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={[GlobalStyles.container, styles.loadingContainer]}>
          <Text style={styles.loadingText}>Analizando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 Estadísticas Avanzadas</Text>
          <Text style={styles.headerSubtitle}>
            Análisis profundo de tu progreso y patrones
          </Text>
        </View>

        {/* Selector de Período */}
        {renderTimeRangeSelector()}

        {/* Tabs */}
        {renderTabs()}

        {/* Contenido de Tabs */}
        <ScrollView style={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'categories' && renderCategoriesTab()}
          {activeTab === 'insights' && renderInsightsTab()}
        </ScrollView>
      </View>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  timeRangeContainer: {
    padding: 16,
    backgroundColor: Colors.backgroundSecondary,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.background,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: Colors.textInverse,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
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
    backgroundColor: Colors.primary + '20',
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
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
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  productivitySection: {
    marginBottom: 24,
  },
  productivityCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  productivityHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  productivityTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  productivityScore: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
  },
  productivityFactors: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 16,
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
  },
  factorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  trendSummary: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  trendLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  trendValue: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
    color: Colors.textPrimary,
  },
  categoryStrength: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
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
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  timeDistribution: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 12,
  },
  timeDistributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: '48%',
    marginBottom: 4,
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
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
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
