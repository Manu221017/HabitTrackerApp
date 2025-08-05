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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
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
    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        '¡Éxito!', 
        'Cuenta creada exitosamente. Ya puedes iniciar sesión.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }, 2000);
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
          <View style={[GlobalStyles.card, { marginBottom: 32, alignItems: 'center' }]}>
            <Text style={[GlobalStyles.title, { color: Colors.primary, textAlign: 'center' }]}>
              Crear Cuenta
            </Text>
            <Text style={[GlobalStyles.caption, { textAlign: 'center', marginTop: 8 }]}>
              Únete a HabitTracker y comienza tu viaje
            </Text>
          </View>

          {/* Registration Form */}
          <View style={[GlobalStyles.card, { width: '90%', maxWidth: 400 }]}>
            <Text style={[GlobalStyles.heading, { marginBottom: 24, textAlign: 'center' }]}>
              Información Personal
            </Text>

            {/* Name Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 8, color: Colors.textPrimary }]}>
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
              />
            </View>

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
            <View style={{ marginBottom: 16 }}>
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

            {/* Confirm Password Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 8, color: Colors.textPrimary }]}>
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
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                GlobalStyles.buttonPrimary,
                { marginBottom: 16 },
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
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={[GlobalStyles.caption, { color: Colors.primary, fontWeight: '600' }]}>
                  Inicia sesión aquí
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Benefits Section */}
          <View style={[GlobalStyles.card, { width: '90%', maxWidth: 400, marginTop: 24 }]}>
            <Text style={[GlobalStyles.subtitle, { textAlign: 'center', marginBottom: 16 }]}>
              Beneficios de HabitTracker
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
                  Gratis para siempre
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
                  Sincronización en la nube
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
