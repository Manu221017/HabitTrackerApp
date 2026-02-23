import React, { useEffect } from 'react';
import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import HomeScreen from './screens/habits/HomeScreen';
import CreateHabitScreen from './screens/habits/CreateHabitScreen';
import CalendarScreen from './screens/habits/CalendarScreen';
import StatisticsScreen from './screens/stats/StatisticsScreen';
import RemindersScreen from './screens/habits/RemindersScreen';
import NotificationSettingsScreen from './screens/settings/NotificationSettingsScreen';
import GamificationScreen from './screens/gamification/GamificationScreen';
import AdvancedStatisticsScreen from './screens/stats/AdvancedStatisticsScreen';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HabitsProvider } from './contexts/HabitsContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import NotificationService from '../backend/services/NotificationService';

import Colors from './constants/Colors';
import GlobalStyles from './constants/Styles';

const Stack = createStackNavigator();

function NavigationContent() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (user) {
      NotificationService.setupNotificationListeners();
      NotificationService.scheduleAllHabitNotifications(user.uid);
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
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: '600' },
        headerShown: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'HabitTracker', headerShown: true }} />
          <Stack.Screen name="CreateHabit" component={CreateHabitScreen} options={{ title: 'Crear Hábito', headerShown: true }} />
          <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendario', headerShown: true }} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'Estadísticas', headerShown: true }} />
          <Stack.Screen name="Reminders" component={RemindersScreen} options={{ title: 'Recordatorios', headerShown: true }} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Configuración de Notificaciones', headerShown: true }} />
          <Stack.Screen name="Gamification" component={GamificationScreen} options={{ title: '🎮 Gamificación', headerShown: true }} />
          <Stack.Screen name="AdvancedStatistics" component={AdvancedStatisticsScreen} options={{ title: '📊 Estadísticas Avanzadas', headerShown: true }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión', headerShown: true }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear Cuenta', headerShown: true }} />
        </>
      )}
    </Stack.Navigator>
  );
}

function ThemedNavigationContainer({ children }) {
  const { isDarkMode, colors } = useTheme();
  const navTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.headerBackground,
      text: colors.headerText,
      border: colors.cardBorder,
      primary: colors.primary,
    },
  };
  return <NavigationContainer theme={navTheme}>{children}</NavigationContainer>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <HabitsProvider>
            <ThemedNavigationContainer>
              <NavigationContent />
            </ThemedNavigationContainer>
            <Toast />
          </HabitsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
