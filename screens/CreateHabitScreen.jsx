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

export default function CreateHabitScreen({ navigation }) {
  const [habitTitle, setHabitTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'salud', name: 'Salud', icon: '🏃‍♂️', color: Colors.success },
    { id: 'desarrollo', name: 'Desarrollo Personal', icon: '📚', color: Colors.primary },
    { id: 'bienestar', name: 'Bienestar', icon: '🧘‍♀️', color: Colors.accent },
    { id: 'productividad', name: 'Productividad', icon: '⚡', color: Colors.info },
    { id: 'social', name: 'Social', icon: '👥', color: Colors.habitStreak },
    { id: 'finanzas', name: 'Finanzas', icon: '💰', color: Colors.secondary },
  ];

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const handleCreateHabit = () => {
    if (!habitTitle.trim()) {
      Alert.alert('Error', 'Por favor ingresa el título del hábito');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return;
    }

    setIsLoading(true);
    
    // Simulate habit creation
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        '¡Éxito!', 
        'Hábito creado exitosamente. ¡Comienza tu nueva racha!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  const renderCategoryItem = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        GlobalStyles.cardSmall,
        {
          borderColor: selectedCategory === category.id ? category.color : Colors.cardBorder,
          borderWidth: selectedCategory === category.id ? 2 : 1,
          backgroundColor: selectedCategory === category.id ? `${category.color}10` : Colors.cardBackground,
        }
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <View style={GlobalStyles.row}>
        <Text style={{ fontSize: 24, marginRight: 12 }}>
          {category.icon}
        </Text>
        <View>
          <Text style={[GlobalStyles.heading, { 
            color: selectedCategory === category.id ? category.color : Colors.textPrimary 
          }]}>
            {category.name}
          </Text>
          <Text style={GlobalStyles.caption}>
            {category.id === 'salud' && 'Ejercicio, alimentación, sueño'}
            {category.id === 'desarrollo' && 'Lectura, aprendizaje, habilidades'}
            {category.id === 'bienestar' && 'Meditación, mindfulness, relajación'}
            {category.id === 'productividad' && 'Organización, planificación, metas'}
            {category.id === 'social' && 'Relaciones, comunicación, networking'}
            {category.id === 'finanzas' && 'Ahorro, inversión, presupuesto'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTimeOption = (time) => (
    <TouchableOpacity
      key={time}
      style={[
        {
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 8,
          marginHorizontal: 4,
          marginVertical: 4,
          borderWidth: 1,
          borderColor: selectedTime === time ? Colors.primary : Colors.cardBorder,
          backgroundColor: selectedTime === time ? Colors.primary : Colors.backgroundSecondary,
        }
      ]}
      onPress={() => setSelectedTime(time)}
    >
      <Text style={[
        GlobalStyles.caption,
        { 
          color: selectedTime === time ? Colors.textInverse : Colors.textPrimary,
          fontWeight: selectedTime === time ? '600' : '400'
        }
      ]}>
        {time}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <KeyboardAvoidingView 
        style={GlobalStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={GlobalStyles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[GlobalStyles.card, { marginBottom: 16 }]}>
            <Text style={[GlobalStyles.title, { marginBottom: 8 }]}>
              Crear Nuevo Hábito
            </Text>
            <Text style={GlobalStyles.caption}>
              Define tu nuevo hábito y comienza a construir una mejor versión de ti mismo
            </Text>
          </View>

          {/* Habit Title */}
          <View style={GlobalStyles.card}>
            <Text style={[GlobalStyles.heading, { marginBottom: 16 }]}>
              Información del Hábito
            </Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 8, color: Colors.textPrimary }]}>
                Título del Hábito *
              </Text>
              <TextInput
                style={GlobalStyles.input}
                placeholder="Ej: Ejercicio matutino"
                placeholderTextColor={Colors.textTertiary}
                value={habitTitle}
                onChangeText={setHabitTitle}
                autoCapitalize="words"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 8, color: Colors.textPrimary }]}>
                Descripción (opcional)
              </Text>
              <TextInput
                style={[GlobalStyles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Describe tu hábito en detalle..."
                placeholderTextColor={Colors.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Category Selection */}
          <View style={GlobalStyles.card}>
            <Text style={[GlobalStyles.heading, { marginBottom: 16 }]}>
              Categoría *
            </Text>
            <Text style={[GlobalStyles.caption, { marginBottom: 16 }]}>
              Selecciona la categoría que mejor describe tu hábito
            </Text>
            
            <View style={{ gap: 8 }}>
              {categories.map(renderCategoryItem)}
            </View>
          </View>

          {/* Time Selection */}
          <View style={GlobalStyles.card}>
            <Text style={[GlobalStyles.heading, { marginBottom: 16 }]}>
              Hora del Día
            </Text>
            <Text style={[GlobalStyles.caption, { marginBottom: 16 }]}>
              ¿A qué hora prefieres realizar este hábito?
            </Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              {timeOptions.map(renderTimeOption)}
            </View>
          </View>

          {/* Tips */}
          <View style={[GlobalStyles.card, { marginBottom: 24 }]}>
            <Text style={[GlobalStyles.heading, { marginBottom: 16 }]}>
              💡 Consejos para el Éxito
            </Text>
            <View style={{ gap: 12 }}>
              <View style={GlobalStyles.row}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>🎯</Text>
                <Text style={GlobalStyles.caption}>
                  Comienza con hábitos pequeños y específicos
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>📅</Text>
                <Text style={GlobalStyles.caption}>
                  Mantén consistencia, no perfección
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>🔥</Text>
                <Text style={GlobalStyles.caption}>
                  Construye rachas para mayor motivación
                </Text>
              </View>
            </View>
          </View>

          {/* Create Button */}
          <View style={GlobalStyles.paddingHorizontal}>
            <TouchableOpacity
              style={[
                GlobalStyles.buttonPrimary,
                { marginBottom: 16 },
                isLoading && { opacity: 0.7 }
              ]}
              onPress={handleCreateHabit}
              disabled={isLoading}
            >
              <Text style={GlobalStyles.buttonText}>
                {isLoading ? 'Creando...' : 'Crear Hábito'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
