// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CreateHabitScreen from './screens/CreateHabitScreen';
import Colors from './constants/Colors';
import GlobalStyles from './constants/Styles';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={[GlobalStyles.centerContainer, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack.Navigator 
        initialRouteName={user ? "Home" : "Login"}
        screenOptions={{
          headerStyle: GlobalStyles.headerStyle,
          headerTitleStyle: GlobalStyles.headerTitleStyle,
          headerTintColor: Colors.primary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        {user ? (
          // Authenticated stack
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ 
                title: 'Mis Hábitos',
                headerShown: true 
              }} 
            />
            <Stack.Screen 
              name="CreateHabit" 
              component={CreateHabitScreen} 
              options={{ 
                title: 'Crear Hábito',
                headerShown: true 
              }} 
            />
          </>
        ) : (
          // Non-authenticated stack
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ 
                title: 'Iniciar Sesión',
                headerShown: false 
              }} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ 
                title: 'Registrarse',
                headerShown: false 
              }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
