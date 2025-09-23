import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  RefreshControl,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import GlobalStyles from '../constants/Styles';
import { useAuth } from '../contexts/AuthContext';
import { useHabits } from '../contexts/HabitsContext';
import GamificationCard from '../components/GamificationCard';
import QuickStatsCard from '../components/QuickStatsCard';
import { logOut, updateHabitStatus } from '../config/firebase';
import Toast from 'react-native-toast-message';

// Componente para el botón animado de check
function HabitCheckButton({ status, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress();
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: status === 'completed' ? Colors.habitCompleted : Colors.backgroundSecondary,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: status === 'completed' ? Colors.habitCompleted : Colors.cardBorder,
        }}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={{
          fontSize: 16,
          color: status === 'completed' ? Colors.textInverse : Colors.textSecondary,
        }}>
          {status === 'completed' ? '✓' : '○'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { 
    habits, 
    todaysHabits,
    loading, 
    error, 
    setError,
    getProgressPercentage,
    getTotalStreak,
    getBestStreak
  } = useHabits();
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    const progress = getProgressPercentage();
    if (progress === 100 && todaysHabits.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [getProgressPercentage, todaysHabits.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    // The HabitsContext will automatically refresh the data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logOut();
              if (result.success) {
                console.log('Logout successful');
              } else {
                Alert.alert('Error', 'Error al cerrar sesión');
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Error al cerrar sesión');
            }
          }
        }
      ]
    );
  };

  const toggleHabitStatus = async (habitId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const result = await updateHabitStatus(habitId, newStatus);
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'Error al actualizar el hábito');
      } else if (newStatus === 'completed') {
        Toast.show({
          type: 'success',
          text1: '¡Hábito completado!',
          position: 'bottom',
          visibilityTime: 1500,
        });
      }
      // No need to update local state - HabitsContext will handle it automatically
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Error al actualizar el hábito');
    }
  };

  const markHabitCompleted = async (habitId) => {
    try {
      const result = await updateHabitStatus(habitId, 'completed');
      if (!result.success) {
        Alert.alert('Error', result.error || 'Error al actualizar el hábito');
      }
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Error al actualizar el hábito');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return Colors.habitCompleted;
      case 'pending':
        return Colors.habitPending;
      case 'missed':
        return Colors.habitMissed;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'missed':
        return 'Perdido';
      default:
        return 'Pendiente';
    }
  };

  const renderHabitCard = ({ item }) => (
    <View style={[
      GlobalStyles.habitCard,
      item.status === 'completed' && GlobalStyles.habitCardCompleted,
      item.status === 'pending' && GlobalStyles.habitCardPending,
      item.status === 'missed' && GlobalStyles.habitCardMissed,
    ]}>
      <View style={GlobalStyles.rowSpaceBetween}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={[GlobalStyles.heading, { marginBottom: 3 }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[GlobalStyles.caption, { marginBottom: 6 }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={GlobalStyles.row}>
            <View style={{
              backgroundColor: getStatusColor(item.status),
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 8,
              marginRight: 6,
            }}>
              <Text style={[GlobalStyles.smallText, { color: Colors.textInverse }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
            <View style={{
              backgroundColor: Colors.backgroundSecondary,
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 8,
            }}>
              <Text style={[GlobalStyles.smallText, { color: Colors.textSecondary }]}>
                🔥 {item.streak || 0} días
              </Text>
            </View>
          </View>
        </View>
        <HabitCheckButton
          status={item.status}
          onPress={() => toggleHabitStatus(item.id, item.status)}
        />
      </View>
      <View style={[GlobalStyles.rowSpaceBetween, { marginTop: 8 }]}> 
        <Text style={[GlobalStyles.smallText, { color: Colors.textTertiary }]} numberOfLines={1}>
          📅 {item.category}
        </Text>
        <Text style={[GlobalStyles.smallText, { color: Colors.textTertiary }]}> 
          ⏰ {item.time}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={[GlobalStyles.card, { alignItems: 'center', padding: 24 }]}>
      <Text style={[GlobalStyles.heading, { textAlign: 'center', marginBottom: 8 }]}>
        ¡No tienes hábitos aún!
      </Text>
      <Text style={[GlobalStyles.caption, { textAlign: 'center', marginBottom: 16 }]}>
        Crea tu primer hábito y comienza a construir una mejor versión de ti mismo
      </Text>
      <TouchableOpacity
        style={GlobalStyles.buttonPrimary}
        onPress={() => navigation.navigate('CreateHabit')}
      >
        <Text style={GlobalStyles.buttonText}>Crear mi primer hábito</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={[GlobalStyles.card, { alignItems: 'center', padding: 24 }]}>
      <Text style={[GlobalStyles.heading, { textAlign: 'center', marginBottom: 8, color: Colors.error }]}>
        Error al cargar hábitos
      </Text>
      <Text style={[GlobalStyles.caption, { textAlign: 'center', marginBottom: 16 }]}>
        {error}
      </Text>
      <TouchableOpacity
        style={GlobalStyles.buttonPrimary}
        onPress={() => setError(null)}
      >
        <Text style={GlobalStyles.buttonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 24 * 60;
    const [h, m] = timeStr.split(':').map(Number);
    return (h % 24) * 60 + (m % 60);
  };

  const todaysReminders = habits
    .filter(h => (h.reminderEnabled || h.time) && h.status !== 'completed')
    .slice()
    .sort((a, b) => parseTimeToMinutes(a.reminderTime || a.time) - parseTimeToMinutes(b.reminderTime || b.time))
    .slice(0, 3);

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: width / 2, y: 0 }}
          fadeOut
          fallSpeed={3000}
        />
      )}
      <ScrollView 
        style={GlobalStyles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header with Progress */}
        <View style={[GlobalStyles.card, { marginBottom: 12 }]}>
          <View style={[GlobalStyles.rowSpaceBetween, { marginBottom: 12 }]}>
            <Text style={[GlobalStyles.title, { marginBottom: 0 }]}>
              ¡Hola! 👋
            </Text>
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: Colors.backgroundSecondary,
                borderWidth: 1,
                borderColor: Colors.cardBorder,
              }}
              onPress={handleLogout}
            >
              <Text style={[GlobalStyles.smallText, { color: Colors.textSecondary }]}>
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>
          
          {user && (
            <Text style={[GlobalStyles.caption, { marginBottom: 12 }]}>
              Bienvenido, {user.displayName || user.email}
            </Text>
          )}
          
          <View style={[GlobalStyles.rowSpaceBetween, { marginBottom: 12 }]}>
            <Text style={GlobalStyles.subtitle}>
              Progreso de hoy
            </Text>
            <Text style={[GlobalStyles.subtitle, { color: Colors.primary }]}>
              {getProgressPercentage()}%
            </Text>
          </View>
          
          <View style={GlobalStyles.progressContainer}>
            <View 
              style={[
                GlobalStyles.progressBar,
                {
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: Colors.primary,
                }
              ]} 
            />
          </View>
          
          <Text style={[GlobalStyles.caption, { marginTop: 6 }]}>
            {todaysHabits.filter(h => h.status === 'completed').length} de {todaysHabits.length} hábitos completados
          </Text>
        </View>

        {/* Today's Reminders */}
        {todaysReminders.length > 0 && (
          <View style={[GlobalStyles.card, { marginBottom: 12 }]}> 
            <View style={[GlobalStyles.rowSpaceBetween, { marginBottom: 8 }]}>
              <Text style={GlobalStyles.subtitle}>Recordatorios de hoy</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Reminders')}>
                <Text style={[GlobalStyles.smallText, { color: Colors.primary }]}>Configurar</Text>
              </TouchableOpacity>
            </View>
            {todaysReminders.map(h => (
              <View key={h.id} style={[GlobalStyles.rowSpaceBetween, { paddingVertical: 6 }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={GlobalStyles.heading} numberOfLines={1}>{h.title}</Text>
                  <Text style={GlobalStyles.smallText}>⏰ {h.reminderTime || h.time}</Text>
                </View>
                <TouchableOpacity
                  style={[GlobalStyles.buttonSmall, { backgroundColor: Colors.success }]}
                  onPress={() => markHabitCompleted(h.id)}
                >
                  <Text style={GlobalStyles.buttonText}>Hecho</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Stats Cards */}
        {habits.length > 0 && (
          <View style={[GlobalStyles.row, { marginBottom: 12 }]}>
            <View style={[GlobalStyles.statsCard, { flex: 1, marginRight: 6 }]}>
              <Text style={[GlobalStyles.heading, { color: Colors.success }]}>
                {getTotalStreak()}
              </Text>
              <Text style={GlobalStyles.caption}>Total de rachas</Text>
            </View>
            
            <View style={[GlobalStyles.statsCard, { flex: 1, marginLeft: 6 }]}>
              <Text style={[GlobalStyles.heading, { color: Colors.primary }]}>
                {getBestStreak()}
              </Text>
              <Text style={GlobalStyles.caption}>Mejor racha</Text>
            </View>
          </View>
        )}

        {/* Tarjeta de Gamificación */}
        {habits.length > 0 && <GamificationCard navigation={navigation} />}

        {/* Tarjeta de Estadísticas Rápidas */}
        {habits.length > 0 && <QuickStatsCard navigation={navigation} />}

        {/* Habits List */}
        <View style={{ marginBottom: 12 }}>
          <View style={[GlobalStyles.rowSpaceBetween, { marginBottom: 12, paddingHorizontal: 12 }]}>
            <Text style={GlobalStyles.subtitle}>
              Mis Hábitos ({todaysHabits.length})
            </Text>
            <TouchableOpacity
              style={GlobalStyles.buttonSmall}
              onPress={() => navigation.navigate('CreateHabit')}
            >
              <Text style={GlobalStyles.buttonText}>+ Nuevo</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={[GlobalStyles.card, { alignItems: 'center', padding: 24 }]}>
              <Text style={GlobalStyles.caption}>Cargando hábitos...</Text>
            </View>
          ) : error ? (
            renderErrorState()
          ) : todaysHabits.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={todaysHabits}
              renderItem={renderHabitCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Quick Actions */}
        <View style={[GlobalStyles.card, { marginBottom: 24 }]}>
          <Text style={[GlobalStyles.heading, { marginBottom: 16 }]}>
            Acciones Rápidas
          </Text>
          
          {/* Primera fila */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AdvancedStatistics')}
            >
              <Text style={styles.actionButtonText}>📊 Estadísticas</Text>
              <Text style={styles.actionButtonSubtext}>Avanzadas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reminders')}
            >
              <Text style={styles.actionButtonText}>⏰ Recordatorios</Text>
              <Text style={styles.actionButtonSubtext}>Configurar</Text>
            </TouchableOpacity>
          </View>
          
          {/* Segunda fila */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Calendar')}
            >
              <Text style={styles.actionButtonText}>📆 Calendario</Text>
              <Text style={styles.actionButtonSubtext}>Ver progreso</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <Text style={styles.actionButtonText}>🔔 Notificaciones</Text>
              <Text style={styles.actionButtonSubtext}>Configurar</Text>
            </TouchableOpacity>
          </View>
          
          {/* Tercera fila */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Gamification')}
            >
              <Text style={styles.actionButtonText}>🎮 Gamificación</Text>
              <Text style={styles.actionButtonSubtext}>Ver logros</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateHabit')}
            >
              <Text style={styles.actionButtonText}>➕ Crear Hábito</Text>
              <Text style={styles.actionButtonSubtext}>Nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    minHeight: 80,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionButtonSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
