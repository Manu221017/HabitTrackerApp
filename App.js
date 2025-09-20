// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

// Import screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import CreateHabitScreen from './screens/CreateHabitScreen';
import CalendarScreen from './screens/CalendarScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import RemindersScreen from './screens/RemindersScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import GamificationScreen from './screens/GamificationScreen';
import AdvancedStatisticsScreen from './screens/AdvancedStatisticsScreen';

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HabitsProvider } from './contexts/HabitsContext';
import NotificationService from './services/NotificationService';

// Import styles
import Colors from './constants/Colors';
import GlobalStyles from './constants/Styles';

const Stack = createStackNavigator();

function NavigationContent() {
  const { user, loading } = useAuth();

  // Configurar notificaciones cuando el usuario esté autenticado
  useEffect(() => {
    if (user) {
      // Configurar listeners de notificación
      NotificationService.setupNotificationListeners();
      
      // Programar notificaciones para hábitos existentes
      NotificationService.scheduleAllHabitNotifications(user.uid);
      
      // Cleanup al desmontar
      return () => {
        NotificationService.cleanup();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textInverse,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      {user ? (
        // Authenticated stack
        <>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'HabitTracker',
              headerShown: true,
            }}
          />
          <Stack.Screen 
            name="CreateHabit" 
            component={CreateHabitScreen}
            options={{
              title: 'Crear Hábito',
              headerShown: true,
            }}
          />
          <Stack.Screen 
            name="Calendar" 
            component={CalendarScreen}
            options={{
              title: 'Calendario',
              headerShown: true,
            }}
          />
          <Stack.Screen 
            name="Statistics" 
            component={StatisticsScreen}
            options={{
              title: 'Estadísticas',
              headerShown: true,
            }}
          />
          <Stack.Screen 
            name="Reminders" 
            component={RemindersScreen}
            options={{
              title: 'Recordatorios',
              headerShown: true,
            }}
          />
          <Stack.Screen 
            name="NotificationSettings" 
            component={NotificationSettingsScreen}
            options={{
              title: 'Configuración de Notificaciones',
              headerShown: true,
            }}
          />
          <Stack.Screen 
            name="Gamification" 
            component={GamificationScreen}
            options={{
              title: '🎮 Gamificación',
              headerShown: true,
            }}
          />
          <Stack.Screen 
            name="AdvancedStatistics" 
            component={AdvancedStatisticsScreen}
            options={{
              title: '📊 Estadísticas Avanzadas',
              headerShown: true,
            }}
          />
        </>
      ) : (
        // Unauthenticated stack
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              title: 'Iniciar Sesión',
              headerShown: true,
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{
              title: 'Crear Cuenta',
              headerShown: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <HabitsProvider>
          <NavigationContainer>
            <NavigationContent />
          </NavigationContainer>
          <Toast />
        </HabitsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
