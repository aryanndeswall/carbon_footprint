import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, TrendingDown, Calendar, AlertTriangle } from 'lucide-react-native';

export default function ForecastScreen() {
  const router = useRouter();
  const { colors, spacing, typography, roundness } = useTheme();

  const forecastDays = [
    { day: 'Mon', emissions: 3.4, delta: '-5%' },
    { day: 'Tue', emissions: 3.2, delta: '-10%' },
    { day: 'Wed', emissions: 3.5, delta: '0%' },
    { day: 'Thu', emissions: 3.0, delta: '-15%' },
    { day: 'Fri', emissions: 3.8, delta: '+8%' },
    { day: 'Sat', emissions: 2.8, delta: '-20%' },
    { day: 'Sun', emissions: 2.5, delta: '-25%' },
  ];

  return (
    <ScreenContainer style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, padding: spacing.md }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={colors.text_primary} />
          </Pressable>
          <Text style={[typography.h2, { color: colors.text_primary, marginLeft: 8 }]}>
            Footprint Forecast
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ padding: spacing.lg }}>
          
          <Card variant="elevated" style={[styles.heroCard, { borderColor: colors.simulation, borderWidth: 1 }] as any}>
            <TrendingDown size={32} color={colors.simulation} />
            <Text style={[typography.h3, { color: colors.text_primary, marginTop: 12, textAlign: 'center' }]}>
              Optimistic 7-Day Trend
            </Text>
            <Text style={[typography.body, { color: colors.text_secondary, textAlign: 'center', marginTop: 4 }]}>
              Your projected average footprint is set to drop by 12% next week based on your daily mission completion rate.
            </Text>
          </Card>

          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.md }]}>
              7-DAY EMISSIONS PROJECTION
            </Text>

            {forecastDays.map((f, index) => (
              <Card key={index} variant="outlined" style={[styles.forecastRow, { marginBottom: spacing.xs }] as any}>
                <View style={styles.row}>
                  <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700', width: 60 }]}>
                    {f.day}
                  </Text>
                  <Text style={[typography.body, { color: colors.text_secondary, flex: 1 }]}>
                    {f.emissions} kg CO₂
                  </Text>
                  <Badge
                    label={f.delta}
                    variant={f.delta.startsWith('-') ? 'success' : f.delta.startsWith('+') ? 'error' : 'muted'}
                  />
                </View>
              </Card>
            ))}
          </View>

          <Card style={[styles.warningCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1 }] as any}>
            <AlertTriangle size={20} color={colors.info} />
            <Text style={[typography.caption, { color: colors.info_text, marginLeft: 12, flex: 1 }]}>
              Disclaimer: Projections are estimates built upon historical log averages. Continue logging daily to keep forecast data accurate.
            </Text>
          </Card>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  forecastRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  warningCard: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
});
