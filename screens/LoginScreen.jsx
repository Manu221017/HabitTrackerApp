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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    
    setIsLoading(true);
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('Home');
    }, 1500);
  };

  const handleRegister = () => {
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
          <View style={[GlobalStyles.card, { marginBottom: 32, alignItems: 'center' }]}>
            <Text style={[GlobalStyles.title, { color: Colors.primary, textAlign: 'center' }]}>
              HabitTracker
            </Text>
            <Text style={[GlobalStyles.caption, { textAlign: 'center', marginTop: 8 }]}>
              Construye hábitos positivos, un día a la vez
            </Text>
          </View>

          {/* Login Form */}
          <View style={[GlobalStyles.card, { width: '90%', maxWidth: 400 }]}>
            <Text style={[GlobalStyles.heading, { marginBottom: 24, textAlign: 'center' }]}>
              Iniciar Sesión
            </Text>

            {/* Email Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 8, color: Colors.textPrimary }]}>
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
              />
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 8, color: Colors.textPrimary }]}>
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
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                GlobalStyles.buttonPrimary,
                { marginBottom: 16 },
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
              <TouchableOpacity onPress={handleRegister}>
                <Text style={[GlobalStyles.caption, { color: Colors.primary, fontWeight: '600' }]}>
                  Regístrate aquí
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Preview */}
          <View style={[GlobalStyles.card, { width: '90%', maxWidth: 400, marginTop: 24 }]}>
            <Text style={[GlobalStyles.subtitle, { textAlign: 'center', marginBottom: 16 }]}>
              ¿Por qué HabitTracker?
            </Text>
            <View style={{ gap: 12 }}>
              <View style={GlobalStyles.row}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: Colors.success,
                  marginRight: 12,
                  marginTop: 6
                }} />
                <Text style={GlobalStyles.caption}>
                  Seguimiento visual de tu progreso
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: Colors.primary,
                  marginRight: 12,
                  marginTop: 6
                }} />
                <Text style={GlobalStyles.caption}>
                  Recordatorios personalizados
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: Colors.accent,
                  marginRight: 12,
                  marginTop: 6
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
