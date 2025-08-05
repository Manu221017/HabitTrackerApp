// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import CreateHabitScreen from './screens/CreateHabitScreen';

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HabitsProvider } from './contexts/HabitsContext';

// Import styles
import Colors from './constants/Colors';
import GlobalStyles from './constants/Styles';

const Stack = createStackNavigator();

function NavigationContent() {
  const { user, loading } = useAuth();

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
        </HabitsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
