import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useSyncStore } from '../../store/useSyncStore';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { X, Car, Utensils, Zap, ShoppingBag } from 'lucide-react-native';

export default function ActivityLogModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, spacing, typography, roundness } = useTheme();
  
  // Zustand store
  const enqueueActivity = useSyncStore((state) => state.enqueueActivity);

  // States
  const [selectedCategory, setSelectedCategory] = useState(
    (params.category as string) || 'Transport'
  );
  const [quantity, setQuantity] = useState(
    (params.quantity as string) || '10'
  );
  const [loading, setLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false); // Toggle to simulate offline

  const categories = [
    { name: 'Transport', icon: Car, unit: 'km' },
    { name: 'Food', icon: Utensils, unit: 'meals' },
    { name: 'Electricity', icon: Zap, unit: 'kWh' },
    { name: 'Shopping', icon: ShoppingBag, unit: 'items' },
  ];

  const activeUnit = categories.find((c) => c.name === selectedCategory)?.unit || 'units';

  const handleLog = async () => {
    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a positive numeric value.');
      return;
    }

    setLoading(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);

    if (isOfflineMode) {
      // Logged offline payload goes to Zustand Offline Queue
      enqueueActivity({
        category: selectedCategory,
        activity_type: `${selectedCategory} log`,
        quantity: qtyNum,
        unit: activeUnit,
      });
      Alert.alert(
        'Logged Offline',
        "Logged offline. We will sync this once you're back online!",
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert(
        'Success',
        `Logged ${qtyNum} ${activeUnit} of ${selectedCategory} successfully. Today's score updated!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  return (
    <ScreenContainer style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, padding: spacing.md }]}>
        <Text style={[typography.h3, { color: colors.text_primary }]}>
          Log Activity
        </Text>
        <Pressable 
          onPress={() => router.back()} 
          style={styles.closeBtn}
          accessibilityLabel="Close activity log"
          accessibilityRole="button"
        >
          <X size={20} color={colors.text_primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ padding: spacing.lg }}>
          
          {/* Category Cards Selector */}
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
            SELECT CATEGORY
          </Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const selected = selectedCategory === cat.name;
              const IconComp = cat.icon;
              return (
                <Card
                  key={cat.name}
                  variant={selected ? 'interactive' : 'outlined'}
                  radiusSize="md"
                  onPress={() => setSelectedCategory(cat.name)}
                  accessibilityLabel={`Category ${cat.name}`}
                  style={[
                    styles.categoryCard,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.success_container : colors.surface,
                    },
                  ] as any}
                >
                  <IconComp size={24} color={selected ? colors.primary : colors.text_secondary} />
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: selected ? colors.primary_dim : colors.text_primary, marginTop: 8 },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Card>
              );
            })}
          </View>

          {/* Form Ingestion */}
          <View style={styles.form}>
            <Input
              label={`Quantity (${activeUnit})`}
              placeholder={`e.g. 15 ${activeUnit}`}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              containerStyle={{ marginBottom: spacing.lg }}
            />

            {/* Simulated Offline Toggle */}
            <Pressable
              onPress={() => setIsOfflineMode(!isOfflineMode)}
              style={[
                styles.offlineToggle,
                {
                  borderColor: isOfflineMode ? colors.error : colors.border,
                  backgroundColor: isOfflineMode ? colors.error_container : colors.surface,
                  borderRadius: roundness.md,
                  padding: spacing.md,
                },
              ]}
            >
              <Text
                style={[
                  typography.bodyMedium,
                  { color: isOfflineMode ? colors.error_text : colors.text_primary, fontWeight: '600' },
                ]}
              >
                {isOfflineMode ? '⚠️ Offline Simulation: ON' : '📶 Connection: Online'}
              </Text>
              <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4 }]}>
                Tap to toggle and test offline queue syncing.
              </Text>
            </Pressable>

            <Button title="Log Activity" onPress={handleLog} loading={loading} style={styles.submitBtn} />
          </View>

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
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
  },
  form: {
    width: '100%',
  },
  offlineToggle: {
    borderWidth: 1,
    marginBottom: 24,
  },
  submitBtn: {
    marginTop: 12,
  },
});
