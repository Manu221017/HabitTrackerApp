import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import GlobalStyles from '../constants/Styles';
import { useHabits } from '../contexts/HabitsContext';
import { getLogsByMonth } from '../config/firebase';

const { width: screenWidth } = Dimensions.get('window');

const getDaysInMonth = (year, monthIndex) => {
  // monthIndex: 0-11
  return new Date(year, monthIndex + 1, 0).getDate();
};

const getWeekdayOfFirst = (year, monthIndex) => {
  // 0: Sunday ... 6: Saturday
  return new Date(year, monthIndex, 1).getDay();
};

export default function CalendarScreen() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth());
  const [logsByDate, setLogsByDate] = useState({});
  const { habits } = useHabits();

  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonthIndex), [currentYear, currentMonthIndex]);
  const firstWeekday = useMemo(() => getWeekdayOfFirst(currentYear, currentMonthIndex), [currentYear, currentMonthIndex]);

  useEffect(() => {
    const loadLogs = async () => {
      const month = String(currentMonthIndex + 1).padStart(2, '0');
      const resp = await getLogsByMonth(currentYear, month);
      if (resp.success) {
        const map = {};
        resp.logs.forEach(l => {
          map[l.dateKey] = map[l.dateKey] || [];
          map[l.dateKey].push(l);
        });
        setLogsByDate(map);
      } else {
        setLogsByDate({});
      }
    };
    loadLogs();
  }, [currentYear, currentMonthIndex]);

  const monthName = useMemo(() => new Date(currentYear, currentMonthIndex, 1).toLocaleString('es-ES', { month: 'long' }), [currentYear, currentMonthIndex]);

  const changeMonth = (delta) => {
    let m = currentMonthIndex + delta;
    let y = currentYear;
    
    // Handle month overflow/underflow
    if (m < 0) { 
      m = 11; 
      y -= 1; 
    }
    if (m > 11) { 
      m = 0; 
      y += 1; 
    }
    
    console.log(`Changing month: ${currentMonthIndex} -> ${m}, year: ${currentYear} -> ${y}`);
    
    setCurrentMonthIndex(m);
    setCurrentYear(y);
  };

  const renderDayCell = (day) => {
    if (day <= 0 || day > daysInMonth) {
      return <View key={`empty-${day}`} style={{ flex: 1, padding: 4 }} />;
    }
    
    const dateKey = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entries = logsByDate[dateKey] || [];
    const completed = entries.filter(e => e.status === 'completed').length;
    const missed = entries.filter(e => e.status === 'missed').length;
    const pending = entries.filter(e => e.status === 'pending').length;
    const total = habits.length;
    
    const isToday = dateKey === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    // Determine background color based on completion
    let backgroundColor = Colors.backgroundSecondary;
    let borderColor = Colors.cardBorder;
    
    if (completed > 0 && completed === total) {
      backgroundColor = Colors.calendarCompleted + '15'; // Very light green
      borderColor = Colors.calendarCompleted;
    } else if (completed > 0) {
      backgroundColor = Colors.calendarCompleted + '10'; // Very light green
      borderColor = Colors.calendarCompleted + '40';
    } else if (missed > 0) {
      backgroundColor = Colors.calendarMissed + '10'; // Very light red
      borderColor = Colors.calendarMissed + '40';
    }
    
    if (isToday) {
      backgroundColor = Colors.calendarToday + '20';
      borderColor = Colors.calendarToday;
    }

    return (
      <View key={dateKey} style={{ flex: 1, padding: 4 }}>
        <View style={{
          backgroundColor: backgroundColor,
          borderWidth: 2,
          borderColor: borderColor,
          borderRadius: 12,
          padding: 8,
          minHeight: 80,
          justifyContent: 'space-between',
          shadowColor: Colors.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}>
          {/* Day number - Much larger and more visible */}
          <Text style={{
            fontSize: 20,
            fontWeight: isToday ? '800' : '600',
            color: isToday ? Colors.calendarToday : Colors.textPrimary,
            textAlign: 'center',
            marginBottom: 4,
          }}>
            {day}
          </Text>
          
          {/* Progress indicator - Much more visible */}
          {total > 0 && (
            <View style={{ marginTop: 'auto' }}>
              {/* Progress bar */}
              <View style={{
                height: 8,
                backgroundColor: Colors.backgroundTertiary,
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: 4,
              }}>
                <View style={{
                  width: `${Math.min(100, completionRate)}%`,
                  height: '100%',
                  backgroundColor: completed > 0 ? Colors.calendarCompleted : Colors.backgroundTertiary,
                  borderRadius: 4,
                }} />
              </View>
              
              {/* Status indicators */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {completed > 0 && (
                  <View style={{
                    backgroundColor: Colors.calendarCompleted,
                    borderRadius: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}>
                    <Text style={{
                      color: Colors.textInverse,
                      fontSize: 10,
                      fontWeight: '600',
                    }}>
                      {completed}/{total}
                    </Text>
                  </View>
                )}
                
                {missed > 0 && (
                  <View style={{
                    backgroundColor: Colors.calendarMissed,
                    borderRadius: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}>
                    <Text style={{
                      color: Colors.textInverse,
                      fontSize: 10,
                      fontWeight: '600',
                    }}>
                      {missed}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Build 6 rows x 7 cols grid including leading blanks
  const grid = [];
  const startOffset = (firstWeekday + 6) % 6; // make Monday=0
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  for (let i = 0; i < totalCells; i += 1) {
    const dayNum = i - startOffset + 1;
    grid.push(dayNum);
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <ScrollView style={GlobalStyles.container} showsVerticalScrollIndicator={false}>
        {/* Enhanced header card */}
        <View style={[GlobalStyles.card, { 
          marginBottom: 16,
          backgroundColor: Colors.primary + '08',
          borderColor: Colors.primary + '20',
          padding: 16,
        }]}>
          <View style={GlobalStyles.rowSpaceBetween}>
            <TouchableOpacity 
              style={{
                backgroundColor: Colors.primary + '15',
                borderColor: Colors.primary + '30',
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
              }} 
              onPress={() => changeMonth(-1)}
              activeOpacity={0.7}
            >
              <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: '600' }}>‹</Text>
            </TouchableOpacity>
            
            <View style={{ alignItems: 'center', flex: 1, marginHorizontal: 16 }}>
              <Text style={{
                fontSize: 22,
                fontWeight: '700',
                color: Colors.textPrimary,
                textTransform: 'capitalize',
                marginBottom: 2,
              }}>
                {monthName} {currentYear}
              </Text>
              <Text style={{
                fontSize: 12,
                color: Colors.textSecondary,
                textAlign: 'center',
              }}>
                Progreso de hábitos por día
              </Text>
            </View>
            
            <TouchableOpacity 
              style={{
                backgroundColor: Colors.primary + '15',
                borderColor: Colors.primary + '30',
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
              }} 
              onPress={() => changeMonth(1)}
              activeOpacity={0.7}
            >
              <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: '600' }}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation hint */}
        <View style={{
          marginBottom: 16,
          paddingHorizontal: 16,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 12,
            color: Colors.textTertiary,
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            💡 Usa los botones ← → para navegar entre meses
          </Text>
        </View>

        <View style={{ paddingHorizontal: 8 }}>
          {/* Enhanced weekday headers */}
          <View style={{ 
            flexDirection: 'row', 
            paddingHorizontal: 8,
            marginBottom: 16,
            backgroundColor: Colors.backgroundSecondary,
            borderRadius: 12,
            paddingVertical: 12,
          }}>
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
              <Text key={d} style={{
                flex: 1,
                textAlign: 'center',
                color: Colors.textSecondary,
                fontSize: 16,
                fontWeight: '600',
                textTransform: 'uppercase',
              }}>
                {d}
              </Text>
            ))}
          </View>

          {/* Enhanced calendar grid */}
          {Array.from({ length: totalCells / 7 }).map((_, row) => (
            <View key={`row-${row}`} style={{ flexDirection: 'row', marginBottom: 8 }}>
              {grid.slice(row * 7, row * 7 + 7).map(renderDayCell)}
            </View>
          ))}
        </View>
        
        {/* Legend */}
        <View style={{
          marginTop: 20,
          marginHorizontal: 16,
          padding: 16,
          backgroundColor: Colors.backgroundSecondary,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.cardBorder,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: Colors.textPrimary,
            marginBottom: 12,
            textAlign: 'center',
          }}>
            Leyenda del Calendario
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 20,
                height: 20,
                backgroundColor: Colors.calendarCompleted + '20',
                borderWidth: 2,
                borderColor: Colors.calendarCompleted,
                borderRadius: 6,
                marginBottom: 4,
              }} />
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Completado</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 20,
                height: 20,
                backgroundColor: Colors.calendarMissed + '20',
                borderWidth: 2,
                borderColor: Colors.calendarMissed,
                borderRadius: 6,
                marginBottom: 4,
              }} />
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Perdido</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 20,
                height: 20,
                backgroundColor: Colors.calendarToday + '20',
                borderWidth: 2,
                borderColor: Colors.calendarToday,
                borderRadius: 6,
                marginBottom: 4,
              }} />
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Hoy</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


