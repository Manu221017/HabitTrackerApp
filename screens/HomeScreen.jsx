import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import GlobalStyles from '../constants/Styles';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../config/firebase';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState([
    {
      id: '1',
      title: 'Ejercicio Matutino',
      description: '30 minutos de cardio',
      streak: 5,
      status: 'completed',
      category: 'Salud',
      time: '08:00',
    },
    {
      id: '2',
      title: 'Leer',
      description: '20 páginas del libro actual',
      streak: 12,
      status: 'pending',
      category: 'Desarrollo Personal',
      time: '21:00',
    },
    {
      id: '3',
      title: 'Meditar',
      description: '10 minutos de mindfulness',
      streak: 3,
      status: 'missed',
      category: 'Bienestar',
      time: '07:00',
    },
  ]);

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

  const toggleHabitStatus = (habitId) => {
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.id === habitId
          ? {
              ...habit,
              status: habit.status === 'completed' ? 'pending' : 'completed',
              streak: habit.status === 'completed' ? Math.max(0, habit.streak - 1) : habit.streak + 1,
            }
          : habit
      )
    );
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
        return 'Desconocido';
    }
  };

  const getProgressPercentage = () => {
    const completed = habits.filter(h => h.status === 'completed').length;
    return Math.round((completed / habits.length) * 100) || 0;
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
                🔥 {item.streak} días
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: item.status === 'completed' ? Colors.habitCompleted : Colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: item.status === 'completed' ? Colors.habitCompleted : Colors.cardBorder,
          }}
          onPress={() => toggleHabitStatus(item.id)}
        >
          <Text style={{
            fontSize: 16,
            color: item.status === 'completed' ? Colors.textInverse : Colors.textSecondary,
          }}>
            {item.status === 'completed' ? '✓' : '○'}
          </Text>
        </TouchableOpacity>
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

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <ScrollView style={GlobalStyles.container} showsVerticalScrollIndicator={false}>
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
            {habits.filter(h => h.status === 'completed').length} de {habits.length} hábitos completados
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={[GlobalStyles.row, { marginBottom: 12 }]}>
          <View style={[GlobalStyles.statsCard, { flex: 1, marginRight: 6 }]}>
            <Text style={[GlobalStyles.heading, { color: Colors.success }]}>
              {habits.reduce((sum, habit) => sum + habit.streak, 0)}
            </Text>
            <Text style={GlobalStyles.caption}>Total de rachas</Text>
          </View>
          
          <View style={[GlobalStyles.statsCard, { flex: 1, marginLeft: 6 }]}>
            <Text style={[GlobalStyles.heading, { color: Colors.primary }]}>
              {Math.max(...habits.map(h => h.streak))}
            </Text>
            <Text style={GlobalStyles.caption}>Mejor racha</Text>
          </View>
        </View>

        {/* Habits List */}
        <View style={{ marginBottom: 12 }}>
          <View style={[GlobalStyles.rowSpaceBetween, { marginBottom: 12, paddingHorizontal: 12 }]}>
            <Text style={GlobalStyles.subtitle}>
              Mis Hábitos
            </Text>
            <TouchableOpacity
              style={GlobalStyles.buttonSmall}
              onPress={() => navigation.navigate('CreateHabit')}
            >
              <Text style={GlobalStyles.buttonText}>+ Nuevo</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={habits}
            renderItem={renderHabitCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Quick Actions */}
        <View style={[GlobalStyles.card, { marginBottom: 24 }]}>
          <Text style={[GlobalStyles.heading, { marginBottom: 12 }]}>
            Acciones Rápidas
          </Text>
          
          <View style={GlobalStyles.row}>
            <TouchableOpacity
              style={[GlobalStyles.buttonSecondary, { flex: 1, marginRight: 6 }]}
              onPress={() => Alert.alert('Próximamente', 'Función de estadísticas detalladas')}
            >
              <Text style={GlobalStyles.buttonTextSecondary}>📊 Estadísticas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[GlobalStyles.buttonSecondary, { flex: 1, marginLeft: 6 }]}
              onPress={() => Alert.alert('Próximamente', 'Función de recordatorios')}
            >
              <Text style={GlobalStyles.buttonTextSecondary}>⏰ Recordatorios</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
