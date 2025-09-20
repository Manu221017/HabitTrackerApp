import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import GlobalStyles from '../constants/Styles';
import { signIn } from '../config/firebase';
import Toast from 'react-native-toast-message';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: '¡Bienvenido!',
          text2: 'Inicio de sesión exitoso',
          position: 'bottom',
          visibilityTime: 1500,
        });
        // Login successful - navigation will be handled by AuthContext
        console.log('Login successful:', result.user.email);
      } else {
        Alert.alert('Error de Inicio de Sesión', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta de nuevo.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    // Clear form and navigate to register
    setEmail('');
    setPassword('');
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <KeyboardAvoidingView 
        style={GlobalStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={GlobalStyles.centerContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={[GlobalStyles.card, { marginBottom: 24, alignItems: 'center' }]}>
            <Text style={[GlobalStyles.title, { color: Colors.primary, textAlign: 'center' }]}>
              HabitTracker
            </Text>
            <Text style={[GlobalStyles.caption, { textAlign: 'center', marginTop: 6 }]}>
              Construye hábitos positivos, un día a la vez
            </Text>
          </View>

          {/* Login Form */}
          <View style={[GlobalStyles.card, { width: '90%', maxWidth: 400 }]}>
            <Text style={[GlobalStyles.heading, { marginBottom: 20, textAlign: 'center' }]}>
              Iniciar Sesión
            </Text>

            {/* Email Input */}
            <View style={{ marginBottom: 12 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: Colors.textPrimary }]}>
                Correo Electrónico
              </Text>
              <TextInput
                style={GlobalStyles.input}
                placeholder="tu@email.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: Colors.textPrimary }]}>
                Contraseña
              </Text>
              <TextInput
                style={GlobalStyles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                GlobalStyles.buttonPrimary,
                { marginBottom: 12 },
                isLoading && { opacity: 0.7 }
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={GlobalStyles.buttonText}>
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={[GlobalStyles.row, { justifyContent: 'center' }]}>
              <Text style={GlobalStyles.caption}>
                ¿No tienes cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
                <Text style={[GlobalStyles.caption, { color: Colors.primary, fontWeight: '600' }]}>
                  Regístrate aquí
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Preview */}
          <View style={[GlobalStyles.card, { width: '90%', maxWidth: 400, marginTop: 20 }]}>
            <Text style={[GlobalStyles.subtitle, { textAlign: 'center', marginBottom: 12 }]}>
              ¿Por qué HabitTracker?
            </Text>
            <View style={{ gap: 8 }}>
              <View style={GlobalStyles.row}>
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: Colors.success,
                  marginRight: 10,
                  marginTop: 4
                }} />
                <Text style={GlobalStyles.caption}>
                  Seguimiento visual de tu progreso
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: Colors.primary,
                  marginRight: 10,
                  marginTop: 4
                }} />
                <Text style={GlobalStyles.caption}>
                  Recordatorios personalizados
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: Colors.accent,
                  marginRight: 10,
                  marginTop: 4
                }} />
                <Text style={GlobalStyles.caption}>
                  Estadísticas motivacionales
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
