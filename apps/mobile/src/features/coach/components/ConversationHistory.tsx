import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { ConversationMessage } from '../types/coach.types';
import { ChevronUp, ChevronDown } from 'lucide-react-native';

interface ConversationHistoryProps {
  messages: ConversationMessage[];
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({ messages }) => {
  const { colors, typography, roundness } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  if (messages.length === 0) {
    return null;
  }

  // Display rule: Collapsed by default.
  // When collapsed, we only show the single latest message (or latest exchange of user + coach).
  // An exchange is usually 2 messages (User then Coach). Let's show the last 2 messages if collapsed,
  // or the last 1 if there's only 1.
  const displayMessages = isExpanded 
    ? messages 
    : messages.slice(-2); // Show the latest exchange

  const hasEarlier = messages.length > 2;

  return (
    <Card variant="outlined" style={styles.card}>
      {/* Expand/Collapse Toggle */}
      {hasEarlier && (
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          style={[styles.expandToggle, { borderBottomColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? "Hide earlier conversations" : "Show earlier conversations"}
        >
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
            {isExpanded ? 'Hide Earlier Conversations ↓' : 'Show Earlier Conversations ↑'}
          </Text>
          {isExpanded ? (
            <ChevronDown size={14} color={colors.primary} />
          ) : (
            <ChevronUp size={14} color={colors.primary} />
          )}
        </Pressable>
      )}

      {/* Messages List */}
      <View style={styles.messagesContainer}>
        {displayMessages.map((msg) => {
          const isCoach = msg.sender === 'coach';
          return (
            <View
              key={msg.id}
              style={[
                styles.bubbleWrapper,
                isCoach ? styles.wrapperCoach : styles.wrapperUser,
              ]}
            >
              {/* Optional sender tag */}
              <Text style={[typography.caption, { color: colors.text_secondary, marginBottom: 2, alignSelf: isCoach ? 'flex-start' : 'flex-end' }]}>
                {isCoach ? 'AI Coach' : 'You'}
              </Text>
              
              <View
                style={[
                  styles.msgBubble,
                  isCoach
                    ? [styles.msgCoach, { backgroundColor: colors.border, borderRadius: roundness.md }]
                    : [styles.msgUser, { backgroundColor: colors.primary, borderRadius: roundness.md }],
                ]}
              >
                <Text
                  style={[
                    typography.body,
                    { color: isCoach ? colors.text_primary : '#FFFFFF', lineHeight: 20 },
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    width: '100%',
  },
  expandToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 6,
  },
  messagesContainer: {
    padding: 16,
    gap: 16,
  },
  bubbleWrapper: {
    width: '100%',
  },
  wrapperCoach: {
    alignItems: 'flex-start',
  },
  wrapperUser: {
    alignItems: 'flex-end',
  },
  msgBubble: {
    padding: 12,
    maxWidth: '85%',
  },
  msgCoach: {
    borderBottomLeftRadius: 4,
  },
  msgUser: {
    borderBottomRightRadius: 4,
  },
});
