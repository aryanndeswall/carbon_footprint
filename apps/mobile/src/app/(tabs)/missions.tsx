import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/progress/ProgressBar';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, AlertCircle, Info, Flame, Award } from 'lucide-react-native';

export default function MissionsScreen() {
  const { colors, spacing, typography, roundness } = useTheme();
  const params = useLocalSearchParams();

  // Highlight state for first-run onboarding
  const isHighlightedParam = params.firstRun === 'true' || params.highlight === 'first';
  const [showCoachTip, setShowCoachTip] = useState(isHighlightedParam);
  const [highlightPulsing] = useState(new Animated.Value(1));

  // Pulse animation for the highlighted card
  useEffect(() => {
    if (showCoachTip) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(highlightPulsing, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(highlightPulsing, {
            toValue: 1.0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto-dismiss coach tip after 4 seconds
      const timer = setTimeout(() => {
        setShowCoachTip(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showCoachTip]);

  // Daily missions mock state
  const [missions, setMissions] = useState([
    {
      id: 'mission-1',
      title: 'Choose a Vegetarian Lunch',
      category: 'Food',
      difficulty: 'Easy',
      co2Saved: '1.2 kg',
      scoreReward: '+10 Score',
      status: 'available', // available, in_progress, completed, skipped
    },
    {
      id: 'mission-2',
      title: 'Unplug Standby Devices',
      category: 'Energy',
      difficulty: 'Easy',
      co2Saved: '0.5 kg',
      scoreReward: '+5 Score',
      status: 'in_progress',
    },
    {
      id: 'mission-3',
      title: 'Carpool or Commute Together',
      category: 'Transport',
      difficulty: 'Medium',
      co2Saved: '2.5 kg',
      scoreReward: '+20 Score',
      status: 'completed',
    },
  ]);

  const handleCompleteMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'completed' } : m))
    );
  };

  const handleSkipMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'skipped' } : m))
    );
  };

  // Weekly progress variables
  const weeklyTarget = 5.0; // kg saved target
  const weeklySaved = 3.7; // actual co2 saved
  const progressRatio = weeklySaved / weeklyTarget;

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.scrollContent}>
      <View style={[styles.inner, { padding: spacing.lg }]}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '600' }]}>
            DAILY GOALS
          </Text>
          <Text style={[typography.h2, { color: colors.text_primary }]}>
            Missions & Achievements
          </Text>
        </View>

        {/* Coach Tip Banner (F-3) */}
        {showCoachTip && (
          <Pressable onPress={() => setShowCoachTip(false)}>
            <Card style={[styles.coachTipCard, { backgroundColor: colors.success_container, borderColor: colors.primary }] as any}>
              <View style={styles.coachTipHeader}>
                <Info size={16} color={colors.primary_dim} />
                <Text style={[typography.bodyMedium, { color: colors.primary_dim, marginLeft: 8, fontWeight: '700' }]}>
                  Your First Mission is Ready!
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4 }]}>
                Complete this daily action to earn score points and build your streak. Tap to dismiss.
              </Text>
            </Card>
          </Pressable>
        )}

        {/* Weekly Progress Tracker */}
        <Card variant="elevated" style={[styles.progressCard, { marginBottom: spacing.lg }] as any}>
          <View style={styles.weeklyHeader}>
            <View>
              <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '600' }]}>
                WEEKLY IMPACT
              </Text>
              <Text style={[typography.h3, { color: colors.text_primary }]}>
                Saved {weeklySaved} kg CO₂
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Flame size={18} color={colors.streak} />
              <Text style={[typography.bodyMedium, { color: colors.streak, fontWeight: '700', marginLeft: 4 }]}>
                Week Warrior
              </Text>
            </View>
          </View>
          <ProgressBar progress={progressRatio} style={{ marginVertical: spacing.md }} />
          <Text style={[typography.caption, { color: colors.text_secondary }]}>
            Save {weeklyTarget} kg this week to lock in your Weekend Booster. Keep going!
          </Text>
        </Card>

        {/* Missions Lists */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
            {"TODAY'S MISSIONS"}
          </Text>
          
          {missions.map((mission, index) => {
            const isFirst = index === 0;
            const isHighlighted = showCoachTip && isFirst;
            const isCompleted = mission.status === 'completed';
            const isSkipped = mission.status === 'skipped';

            return (
              <Animated.View
                key={mission.id}
                style={[
                  styles.cardWrapper,
                  isHighlighted && {
                    transform: [{ scale: highlightPulsing }],
                    borderWidth: 2,
                    borderColor: colors.primary,
                    borderRadius: roundness.lg,
                  },
                ] as any}
              >
                {isSkipped ? (
                  <Card variant="default" style={styles.skippedCard}>
                    <Text style={[typography.bodyMedium, { color: colors.text_secondary }]}>
                      {`"${mission.title}" Skipped`}
                    </Text>
                    <Pressable
                      onPress={() =>
                        setMissions((prev) =>
                          prev.map((m) => (m.id === mission.id ? { ...m, status: 'available' } : m))
                        )
                      }
                      style={styles.undoBtn}
                    >
                      <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '600' }]}>
                        Undo
                      </Text>
                    </Pressable>
                  </Card>
                ) : (
                  <Card
                    variant={isCompleted ? 'default' : 'interactive'}
                    style={[
                      styles.missionCard,
                      isCompleted && {
                        backgroundColor: colors.success_container, // Green success container token
                        borderColor: colors.primary,
                      },
                    ] as any}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.headerBadges}>
                        <Badge label={mission.category} variant="info" />
                        <Badge label={mission.difficulty} variant={mission.difficulty === 'Easy' ? 'success' : 'warning'} />
                      </View>
                      <Text style={[typography.caption, { color: isCompleted ? colors.success_text : colors.streak, fontWeight: '700' }]}>
                        {mission.scoreReward}
                      </Text>
                    </View>
                    
                    <Text
                      style={[
                        typography.h3,
                        { color: colors.text_primary, marginVertical: spacing.xs },
                        isCompleted && { textDecorationLine: 'line-through', color: colors.success_text },
                      ]}
                    >
                      {mission.title}
                    </Text>
                    
                    <Text style={[typography.body, { color: colors.text_secondary, marginBottom: spacing.md }]}>
                      Estimated savings: {mission.co2Saved} CO₂.
                    </Text>

                    {!isCompleted && (
                      <View style={styles.actionsRow}>
                        <Button
                          title="Complete"
                          onPress={() => handleCompleteMission(mission.id)}
                          style={styles.completeBtn}
                        />
                        <Button
                          title="Skip"
                          variant="secondary"
                          onPress={() => handleSkipMission(mission.id)}
                          style={styles.skipBtn}
                        />
                      </View>
                    )}

                    {isCompleted && (
                      <View style={styles.completedRow}>
                        <CheckCircle2 size={20} color={colors.primary} />
                        <Text style={[typography.bodyMedium, { color: colors.success_text, marginLeft: 8, fontWeight: '600' }]}>
                          Completed & Saved
                        </Text>
                      </View>
                    )}
                  </Card>
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
            UPCOMING ACHIEVEMENT
          </Text>
          <Card variant="outlined" style={styles.achievementCard}>
            <Award size={28} color={colors.streak} />
            <View style={styles.achievementContent}>
              <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700' }]}>
                Green Champion
              </Text>
              <Text style={[typography.caption, { color: colors.text_secondary }]}>
                Log 10 transport activities. (8/10 completed)
              </Text>
              <ProgressBar progress={0.8} style={{ marginTop: 8 }} />
            </View>
          </Card>
        </View>

      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 80,
  },
  inner: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  coachTipCard: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  coachTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCard: {
    padding: 16,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
  },
  section: {
    marginBottom: 28,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  missionCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  completeBtn: {
    flex: 2,
    height: 40,
  },
  skipBtn: {
    flex: 1,
    height: 40,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  skippedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  undoBtn: {
    padding: 4,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  achievementContent: {
    flex: 1,
    marginLeft: 16,
  },
});
