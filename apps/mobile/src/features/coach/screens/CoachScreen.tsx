import React, { useState, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Input } from '../../../components/ui/Input';
import { IconButton } from '../../../components/ui/IconButton';
import { Send } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { useCoachData, useQueryCoachMutation } from '../hooks/useCoachData';
import { CoachHero } from '../components/CoachHero';
import { InsightCard } from '../components/InsightCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { ForecastInsightCard } from '../components/ForecastInsightCard';
import { TrendCard } from '../components/TrendCard';
import { PromptChip } from '../components/PromptChip';
import { ConversationHistory } from '../components/ConversationHistory';
import { CoachResponseCard } from '../components/CoachResponseCard';

export const CoachScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();

  // Queries & Mutations
  const { data, isLoading, isError, refetch, invalidateCoach } = useCoachData();
  const queryMutation = useQueryCoachMutation();

  // Input states
  const [queryText, setQueryText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(() => Date.now());

  // Screen focus staleness rule (60 seconds)
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const ageInSeconds = (now - lastRefreshedAt) / 1000;
      if (ageInSeconds > 60) {
        invalidateCoach();
        setLastRefreshedAt(now);
      }
    }, [lastRefreshedAt, invalidateCoach])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      setLastRefreshedAt(Date.now());
    } catch (e) {
      console.error('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleSendPrompt = async (text: string) => {
    if (!text.trim() || queryMutation.isPending) return;
    setQueryText('');
    try {
      await queryMutation.mutateAsync(text);
    } catch (err) {
      console.error('Coach query failed', err);
    }
  };

  const promptSuggestions = [
    'How can I improve my score?',
    'What should I do this week?',
    'How do I reduce transport emissions?',
    "What's my biggest opportunity?",
  ];

  if (isLoading) {
    return (
      <ScreenContainer style={{ backgroundColor: colors.background }}>
        <View style={[styles.skeletonContainer, { padding: spacing.lg }]}>
          <Skeleton variant="text" width="50%" height={32} />
          <Skeleton variant="card" height={150} />
          <Skeleton variant="text" width="40%" style={{ marginTop: 12 }} />
          <Skeleton variant="card" height={120} />
          <Skeleton variant="card" height={120} />
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer style={{ backgroundColor: colors.background }}>
        <View style={styles.errorContainer}>
          <ErrorState
            message="Unable to load AI Coach insights. Please check your network and retry."
            onRetry={() => { refetch(); }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={{ padding: spacing.lg, gap: spacing.lg }}>
        
        {/* 1. Header & Hero Context */}
        <CoachHero />

        {/* 2. Today's Insight Section */}
        <InsightCard insight={data.insight} />

        {/* 3. Recommended Actions Section (Max 3) */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.md }]}>
            RECOMMENDED ACTIONS
          </Text>
          <View style={styles.listContainer}>
            {data.recommendations.slice(0, 3).map((rec, index) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                index={index}
              />
            ))}
          </View>
        </View>

        {/* 4. Forecast Insight Section */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.md }]}>
            FORECAST INSIGHTS
          </Text>
          <ForecastInsightCard forecast={data.forecast} />
        </View>

        {/* 5. Behavior Trends Grid */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.md }]}>
            BEHAVIOR TRENDS
          </Text>
          <View style={styles.trendsGrid}>
            {data.trends.map((trend) => (
              <TrendCard key={trend.category} trend={trend} />
            ))}
          </View>
        </View>

        {/* 6. Ask Coach Interaction Section */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
            ASK COACH
          </Text>
          
          {/* Prompt chips suggestions */}
          <View style={styles.chipsRow}>
            {promptSuggestions.map((prompt) => (
              <PromptChip
                key={prompt}
                label={prompt}
                disabled={queryMutation.isPending}
                onPress={handleSendPrompt}
              />
            ))}
          </View>

          {/* Chat Input Container */}
          <View style={styles.inputRow}>
            <Input
              placeholder="Ask your coach anything..."
              value={queryText}
              onChangeText={setQueryText}
              editable={!queryMutation.isPending}
              containerStyle={styles.inputContainer}
              accessibilityLabel="Type question for sustainability coach"
            />
            <IconButton
              icon={Send}
              onPress={() => handleSendPrompt(queryText)}
              disabled={!queryText.trim() || queryMutation.isPending}
              variant="filled"
              size={22}
              accessibilityLabel="Send question"
            />
          </View>
        </View>

        {/* 7. Latest Coach Query Response (Structured View) */}
        {queryMutation.isPending && (
          <View style={styles.responseContainer}>
            <Skeleton variant="card" height={160} />
          </View>
        )}

        {queryMutation.isSuccess && queryMutation.data && (
          <View style={styles.responseContainer}>
            <CoachResponseCard response={queryMutation.data} />
          </View>
        )}

        {/* 8. Conversation History (Collapsed by default) */}
        {data.history.length > 0 && (
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.md }]}>
              CONVERSATION LOGS
            </Text>
            <ConversationHistory messages={data.history} />
          </View>
        )}

      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  skeletonContainer: {
    gap: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  section: {
    width: '100%',
  },
  listContainer: {
    gap: 12,
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    width: '100%',
  },
  inputContainer: {
    flex: 1,
  },
  responseContainer: {
    width: '100%',
    marginTop: 8,
  },
});
