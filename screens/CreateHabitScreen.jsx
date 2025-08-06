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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Colors from '../constants/Colors';
import GlobalStyles from '../constants/Styles';
import { createHabit } from '../config/firebase';

const categories = [
  'Salud',
  'Desarrollo Personal',
  'Bienestar',
  'Productividad',
  'Aprendizaje',
  'Social',
  'Finanzas',
  'Otros'
];

export default function CreateHabitScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleCreateHabit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para el hábito');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return;
    }

    if (!time) {
      Alert.alert('Error', 'Por favor selecciona una hora');
      return;
    }

    setIsLoading(true);

    try {
      const habitData = {
        title: title.trim(),
        description: description.trim(),
        category,
        time,
        status: 'pending'
      };

      const result = await createHabit(habitData);

      if (result.success) {
        Alert.alert(
          '¡Éxito!',
          'Hábito creado exitosamente',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear form and navigate back
                setTitle('');
                setDescription('');
                setCategory('');
                setTime('');
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Error al crear el hábito');
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSelection = () => {
    if (Platform.OS === 'android') {
      // For Android, use the native time picker
      try {
        DateTimePickerAndroid.open({
          value: selectedTime,
          onChange: (event, date) => {
            if (date) {
              setSelectedTime(date);
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              setTime(`${hours}:${minutes}`);
            }
          },
          mode: 'time',
          is24Hour: true,
        });
      } catch (error) {
        console.error('Error opening time picker:', error);
        // Fallback to simple time selection
        const times = ['06:00', '07:00', '08:00', '09:00', '12:00', '15:00', '18:00', '20:00', '21:00'];
        Alert.alert(
          'Seleccionar Hora',
          'Elige una hora para tu hábito',
          times.map(timeOption => ({
            text: timeOption,
            onPress: () => setTime(timeOption)
          }))
        );
      }
    } else {
      // For iOS, show modal with time picker
      setShowTimePicker(true);
    }
  };

  const handleTimeConfirm = (event, date) => {
    setShowTimePicker(false);
    if (date) {
      setSelectedTime(date);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    }
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingBottom: 40
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[GlobalStyles.card, { marginBottom: 20, alignItems: 'center' }]}>
            <Text style={[GlobalStyles.title, { color: Colors.primary, textAlign: 'center' }]}>
              Crear Nuevo Hábito
            </Text>
            <Text style={[GlobalStyles.caption, { textAlign: 'center', marginTop: 6 }]}>
              Define tu nuevo hábito y comienza tu viaje
            </Text>
          </View>

          {/* Form */}
          <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
            {/* Title Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: Colors.textPrimary }]}>
                Título del Hábito *
              </Text>
              <TextInput
                style={GlobalStyles.input}
                placeholder="Ej: Ejercicio matutino"
                placeholderTextColor={Colors.textTertiary}
                value={title}
                onChangeText={setTitle}
                maxLength={50}
                editable={!isLoading}
              />
            </View>

            {/* Description Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: Colors.textPrimary }]}>
                Descripción *
              </Text>
              <TextInput
                style={[GlobalStyles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Describe tu hábito en detalle..."
                placeholderTextColor={Colors.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
                editable={!isLoading}
              />
            </View>

            {/* Category Selection */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: Colors.textPrimary }]}>
                Categoría *
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 2,
                        borderColor: category === cat ? Colors.primary : Colors.cardBorder,
                        backgroundColor: category === cat ? Colors.primary : Colors.backgroundSecondary,
                        marginBottom: 8,
                      },
                      !isLoading && { opacity: 0.8 }
                    ]}
                    onPress={() => setCategory(cat)}
                    disabled={isLoading}
                  >
                    <Text style={[
                      GlobalStyles.smallText,
                      { 
                        color: category === cat ? Colors.textInverse : Colors.textSecondary,
                        fontWeight: category === cat ? '600' : '400'
                      }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Selection */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: Colors.textPrimary }]}>
                Hora del Día *
              </Text>
              <TouchableOpacity
                style={[
                  GlobalStyles.input,
                  { 
                    justifyContent: 'center',
                    backgroundColor: time ? Colors.backgroundSecondary : Colors.inputBackground
                  }
                ]}
                onPress={handleTimeSelection}
                disabled={isLoading}
              >
                <Text style={[
                  GlobalStyles.caption,
                  { 
                    color: time ? Colors.textPrimary : Colors.textTertiary,
                    textAlign: 'center'
                  }
                ]}>
                  {time || 'Seleccionar hora'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[
                GlobalStyles.buttonPrimary,
                { marginBottom: 12 },
                isLoading && { opacity: 0.7 }
              ]}
              onPress={handleCreateHabit}
              disabled={isLoading}
            >
              <Text style={GlobalStyles.buttonText}>
                {isLoading ? 'Creando...' : 'Crear Hábito'}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[
                GlobalStyles.buttonSecondary,
                { marginBottom: 12 }
              ]}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={GlobalStyles.buttonTextSecondary}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
            <Text style={[GlobalStyles.subtitle, { textAlign: 'center', marginBottom: 12 }]}>
              💡 Consejos para crear hábitos exitosos
            </Text>
            <View style={{ gap: 8 }}>
              <View style={GlobalStyles.row}>
                <Text style={[GlobalStyles.caption, { color: Colors.textSecondary }]}>
                  • Comienza con hábitos pequeños y específicos
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <Text style={[GlobalStyles.caption, { color: Colors.textSecondary }]}>
                  • Elige una hora consistente cada día
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <Text style={[GlobalStyles.caption, { color: Colors.textSecondary }]}>
                  • Conecta el hábito con una actividad existente
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <Text style={[GlobalStyles.caption, { color: Colors.textSecondary }]}>
                  • Celebra cada pequeño progreso
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Time Picker Modal for iOS */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={handleTimeCancel}
      >
        <View style={GlobalStyles.modalOverlay}>
          <View style={GlobalStyles.modalContent}>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeConfirm}
            />
            <TouchableOpacity
              style={GlobalStyles.modalButton}
              onPress={handleTimeCancel}
            >
              <Text style={GlobalStyles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
