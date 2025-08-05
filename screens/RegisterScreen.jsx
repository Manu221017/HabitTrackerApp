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
import { signUp } from '../config/firebase';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signUp(email, password, name);
      
      if (result.success) {
        Alert.alert(
          '¡Éxito!', 
          'Cuenta creada exitosamente. Ya puedes iniciar sesión.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error de Registro', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta de nuevo.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
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
              Crear Cuenta
            </Text>
            <Text style={[GlobalStyles.caption, { textAlign: 'center', marginTop: 6 }]}>
              Únete a HabitTracker y comienza tu viaje
            </Text>
          </View>

          {/* Registration Form */}
          <View style={[GlobalStyles.card, { width: '90%', maxWidth: 400 }]}>
            <Text style={[GlobalStyles.heading, { marginBottom: 20, textAlign: 'center' }]}>
              Información Personal
            </Text>

            {/* Name Input */}
            <View style={{ marginBottom: 12 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: Colors.textPrimary }]}>
                Nombre Completo
              </Text>
              <TextInput
                style={GlobalStyles.input}
                placeholder="Tu nombre completo"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

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
            <View style={{ marginBottom: 12 }}>
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

            {/* Confirm Password Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: Colors.textPrimary }]}>
                Confirmar Contraseña
              </Text>
              <TextInput
                style={GlobalStyles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                GlobalStyles.buttonPrimary,
                { marginBottom: 12 },
                isLoading && { opacity: 0.7 }
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={GlobalStyles.buttonText}>
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={[GlobalStyles.row, { justifyContent: 'center' }]}>
              <Text style={GlobalStyles.caption}>
                ¿Ya tienes cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={handleBackToLogin} disabled={isLoading}>
                <Text style={[GlobalStyles.caption, { color: Colors.primary, fontWeight: '600' }]}>
                  Inicia sesión aquí
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Benefits Section */}
          <View style={[GlobalStyles.card, { width: '90%', maxWidth: 400, marginTop: 20 }]}>
            <Text style={[GlobalStyles.subtitle, { textAlign: 'center', marginBottom: 12 }]}>
              Beneficios de HabitTracker
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
                  Gratis para siempre
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
                  Sincronización en la nube
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
                  Sin anuncios molestos
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
