import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MessageSquare, Send, Sparkles, ChevronUp, ChevronDown, HelpCircle, Lightbulb } from 'lucide-react-native';

export default function AICoachScreen() {
  const router = useRouter();
  const { colors, spacing, typography, roundness } = useTheme();

  // Chat message state
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'coach',
      text: 'Hi there! I analyzed your transport habits from last week. You traveled 45km by metro, saving about 9.2kg of CO₂ compared to driving. Great job!',
    },
    {
      id: 'msg-2',
      sender: 'user',
      text: 'Thanks! How can I save even more?',
    },
    {
      id: 'msg-3',
      sender: 'coach',
      text: 'Based on your omnivore diet, choosing a veggie lunch just twice a week could reduce your food footprint by 15%. I have added some actionable tips below!',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [offline, setOffline] = useState(false);

  // Recommendations mock matching F-6 categories and CTAs
  const recommendations = [
    {
      id: 'rec-1',
      category: 'Food',
      difficulty: 'Easy',
      headline: 'Opt for Plant-Based Lunch',
      body: 'Having a vegetarian lunch today saves roughly 1.2kg CO₂.',
      ctaLabel: 'Log This Activity',
      route: '/modals/activity-log?category=Food',
    },
    {
      id: 'rec-2',
      category: 'Score Goal',
      difficulty: 'Medium',
      headline: 'Boost Score to 85',
      body: 'See how adding energy efficiency activities projects your score.',
      ctaLabel: 'Simulate This',
      route: '/simulator?preset=energy',
    },
  ];

  const handleSend = () => {
    if (!inputVal.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `msg-user-${Date.now()}`, sender: 'user', text: inputVal },
      {
        id: `msg-coach-${Date.now()}`,
        sender: 'coach',
        text: "That sounds interesting! Let's explore how we can log that and track your progress.",
      },
    ]);
    setInputVal('');
  };

  const handleCTARouting = (route: string) => {
    router.push(route);
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.scrollContent}>
      <View style={[styles.inner, { padding: spacing.lg }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '600' }]}>
            INTELLIGENCE
          </Text>
          <Text style={[typography.h2, { color: colors.text_primary }]}>
            AI Carbon Coach
          </Text>
        </View>

        {/* Offline Fallback Banner */}
        {offline && (
          <Card style={[styles.offlineBanner, { backgroundColor: colors.error_container, borderColor: colors.error }] as any}>
            <Text style={[typography.bodyMedium, { color: colors.error_text, fontWeight: '600' }]}>
              You are offline. Showing cached coach recommendations.
            </Text>
          </Card>
        )}

        {/* bulbed green hero card: "Today's Insight" */}
        <Card variant="elevated" style={[styles.insightCard, { backgroundColor: colors.success_container, borderColor: colors.primary, borderWidth: 1 }] as any}>
          <View style={styles.insightHeader}>
            <Lightbulb size={24} color={colors.primary} />
            <Text style={[typography.h3, { color: colors.primary_dim, marginLeft: 8 }]}>
              {"Today's Insight"}
            </Text>
          </View>
          <Text style={[typography.body, { color: colors.text_primary, marginTop: 8, lineHeight: 22 }]}>
            {"\"Your transit choices remain highly optimized, but home electricity usage spiked by 8% last night. Try switching off standby appliances before bed.\""}
          </Text>
          
          {/* F-7: Coach -> Simulator Handoff CTA */}
          <Pressable onPress={() => router.push('/simulator')} style={styles.handoffCTA}>
            <Text style={[typography.bodyMedium, { color: colors.simulation, fontWeight: '700' }]}>
              🔮 What if I changed my habits? →
            </Text>
          </Pressable>
        </Card>

        {/* DR-1: Collapsed-by-default Conversation History */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
            CONVERSATION HISTORY
          </Text>

          <Card variant="outlined" style={styles.chatCard}>
            {/* Show earlier exchanges toggle */}
            {messages.length > 2 && (
              <Pressable
                onPress={() => setIsHistoryExpanded(!isHistoryExpanded)}
                style={[styles.expandToggle, { borderBottomColor: colors.border }]}
              >
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
                  {isHistoryExpanded ? 'Hide Earlier Conversations ↓' : 'Show Earlier Conversations ↑'}
                </Text>
                {isHistoryExpanded ? (
                  <ChevronDown size={14} color={colors.primary} />
                ) : (
                  <ChevronUp size={14} color={colors.primary} />
                )}
              </Pressable>
            )}

            <ScrollView style={styles.messagesContainer} scrollEnabled={false}>
              {(isHistoryExpanded ? messages : messages.slice(-1)).map((msg) => {
                const isCoach = msg.sender === 'coach';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.msgBubble,
                      isCoach
                        ? [styles.msgCoach, { backgroundColor: colors.border }]
                        : [styles.msgUser, { backgroundColor: colors.primary }],
                    ]}
                  >
                    <Text
                      style={[
                        typography.body,
                        { color: isCoach ? colors.text_primary : '#FFFFFF' },
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            {/* Input Primitive */}
            <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
              <TextInput
                placeholder="Ask your coach anything..."
                placeholderTextColor={colors.text_secondary}
                style={[
                  typography.body,
                  styles.chatInput,
                  {
                    color: colors.text_primary,
                    borderRadius: roundness.md,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                value={inputVal}
                onChangeText={setInputVal}
                editable={!offline}
              />
              <Pressable
                disabled={offline}
                onPress={handleSend}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: roundness.md,
                    opacity: offline ? 0.5 : 1,
                  },
                ]}
              >
                <Send size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </Card>
        </View>

        {/* Recommended Actions Grid (F-6 Category CTA mapping) */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
            RECOMMENDED FOR YOU
          </Text>
          {recommendations.map((rec) => (
            <Card key={rec.id} variant="interactive" style={styles.recCard}>
              <View style={styles.recHeader}>
                <Badge label={rec.category} variant="info" />
                <Badge label={rec.difficulty} variant="success" />
              </View>
              <Text style={[typography.h3, { color: colors.text_primary, marginVertical: spacing.xs }]}>
                {rec.headline}
              </Text>
              <Text style={[typography.body, { color: colors.text_secondary, marginBottom: spacing.md }]}>
                {rec.body}
              </Text>
              <Button
                title={rec.ctaLabel}
                onPress={() => handleCTARouting(rec.route)}
                style={styles.recBtn}
              />
            </Card>
          ))}
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
  offlineBanner: {
    padding: 12,
    marginBottom: 20,
  },
  insightCard: {
    padding: 16,
    marginBottom: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handoffCTA: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: 28,
  },
  chatCard: {
    padding: 0,
    overflow: 'hidden',
  },
  expandToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 4,
  },
  messagesContainer: {
    padding: 16,
    maxHeight: 300,
  },
  msgBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '85%',
  },
  msgCoach: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  msgUser: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  sendBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recCard: {
    padding: 16,
    marginBottom: 16,
  },
  recHeader: {
    flexDirection: 'row',
    gap: 8,
  },
  recBtn: {
    height: 40,
  },
});
