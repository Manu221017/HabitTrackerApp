import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useThemedStyles, useTheme } from '../../contexts/ThemeContext';
import { useHabits } from '../../contexts/HabitsContext';
import { getLogsByMonth } from '../../../backend/config/firebase';

export default function StatisticsScreen() {
  const GlobalStyles = useThemedStyles();
  const { colors } = useTheme();
  const { habits, getBestStreak, getTotalStreak } = useHabits();
  const today = new Date();
  const [monthly, setMonthly] = useState({ completed: 0, missed: 0, pending: 0 });

  useEffect(() => {
    const load = async () => {
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const res = await getLogsByMonth(today.getFullYear(), month);
      if (res.success) {
        const completed = res.logs.filter(l => l.status === 'completed').length;
        const missed = res.logs.filter(l => l.status === 'missed').length;
        const pending = res.logs.filter(l => l.status === 'pending').length;
        setMonthly({ completed, missed, pending });
      }
    };
    load();
  }, []);

  const completionRate = useMemo(() => {
    const total = monthly.completed + monthly.missed + monthly.pending;
    if (!total) return 0;
    return Math.round((monthly.completed / total) * 100);
  }, [monthly]);

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <ScrollView style={GlobalStyles.container} showsVerticalScrollIndicator={false}>
        <View style={[GlobalStyles.card, { marginBottom: 12 }]}> 
          <Text style={GlobalStyles.title}>Resumen</Text>
          <View style={[GlobalStyles.rowSpaceBetween, { marginTop: 10 }]}>
            <View style={[GlobalStyles.statsCard, { flex: 1, marginRight: 6 }]}> 
              <Text style={[GlobalStyles.heading, { color: colors.success }]}>{getTotalStreak()}</Text>
              <Text style={GlobalStyles.caption}>Racha total</Text>
            </View>
            <View style={[GlobalStyles.statsCard, { flex: 1, marginLeft: 6 }]}> 
              <Text style={[GlobalStyles.heading, { color: colors.primary }]}>{getBestStreak()}</Text>
              <Text style={GlobalStyles.caption}>Mejor racha</Text>
            </View>
          </View>
        </View>

        <View style={[GlobalStyles.card, { marginBottom: 12 }]}> 
          <Text style={GlobalStyles.subtitle}>Este mes</Text>
          <View style={{ marginTop: 10 }}>
            <View style={{ height: 8, backgroundColor: colors.backgroundSecondary, borderRadius: 8, overflow: 'hidden' }}>
              <View style={{ width: `${completionRate}%`, height: '100%', backgroundColor: colors.success }} />
            </View>
            <Text style={[GlobalStyles.caption, { marginTop: 6 }]}>{completionRate}% de cumplimiento</Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={[GlobalStyles.cardSmall, { flex: 1, marginRight: 6 }]}> 
              <Text style={[GlobalStyles.heading, { color: colors.success }]}>{monthly.completed}</Text>
              <Text style={GlobalStyles.smallText}>Completados</Text>
            </View>
            <View style={[GlobalStyles.cardSmall, { flex: 1, marginHorizontal: 6 }]}> 
              <Text style={[GlobalStyles.heading, { color: colors.accent }]}>{monthly.pending}</Text>
              <Text style={GlobalStyles.smallText}>Pendientes</Text>
            </View>
            <View style={[GlobalStyles.cardSmall, { flex: 1, marginLeft: 6 }]}> 
              <Text style={[GlobalStyles.heading, { color: colors.error }]}>{monthly.missed}</Text>
              <Text style={GlobalStyles.smallText}>Perdidos</Text>
            </View>
          </View>
        </View>

        <View style={[GlobalStyles.card, { marginBottom: 24 }]}> 
          <Text style={GlobalStyles.subtitle}>Hábitos activos</Text>
          <Text style={GlobalStyles.caption}>{habits.length} hábitos</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


