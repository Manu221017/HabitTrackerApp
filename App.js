// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CreateHabitScreen from './screens/CreateHabitScreen';
import Colors from './constants/Colors';
import GlobalStyles from './constants/Styles';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: GlobalStyles.headerStyle,
          headerTitleStyle: GlobalStyles.headerTitleStyle,
          headerTintColor: Colors.primary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
