import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoachData, queryCoachAPI } from '../services/coach.service';
import { CoachData, ConversationMessage } from '../types/coach.types';

export const useCoachData = () => {
  const queryClient = useQueryClient();

  const query = useQuery<CoachData>({
    queryKey: ['coach'],
    queryFn: getCoachData,
    staleTime: 60 * 1000, // 60 seconds staleness rule
  });

  const invalidateCoach = () => {
    queryClient.invalidateQueries({ queryKey: ['coach'] });
  };

  return {
    ...query,
    invalidateCoach,
  };
};

export const useQueryCoachMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: queryCoachAPI,
    onMutate: async (queryText) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['coach'] });

      // Snapshot previous value
      const previousCoachData = queryClient.getQueryData<CoachData>(['coach']);

      // Optimistically update cache to include user's query
      if (previousCoachData) {
        const userMessage: ConversationMessage = {
          id: `user-${Date.now()}`,
          sender: 'user',
          text: queryText,
          timestamp: new Date().toISOString(),
        };

        const updatedHistory = [...previousCoachData.history, userMessage];

        queryClient.setQueryData<CoachData>(['coach'], {
          ...previousCoachData,
          history: updatedHistory,
        });
      }

      return { previousCoachData };
    },
    onSuccess: (data, queryText, context) => {
      // Append coach's answer to cache history
      const previousCoachData = context?.previousCoachData;
      if (previousCoachData) {
        // Optimistic user message was already added. Let's find it or append coach message.
        const coachMessage: ConversationMessage = {
          id: `coach-${Date.now()}`,
          sender: 'coach',
          text: data.response,
          timestamp: new Date().toISOString(),
        };

        // Make sure user's query is present
        const hasUserMsg = previousCoachData.history.some(
          (m) => m.sender === 'user' && m.text === queryText
        );

        let finalHistory = [...previousCoachData.history];
        if (!hasUserMsg) {
          finalHistory.push({
            id: `user-${Date.now() - 100}`,
            sender: 'user',
            text: queryText,
            timestamp: new Date(Date.now() - 100).toISOString(),
          });
        }
        finalHistory.push(coachMessage);

        queryClient.setQueryData<CoachData>(['coach'], {
          ...previousCoachData,
          history: finalHistory,
        });
      }
    },
    onError: (err, queryText, context) => {
      // Rollback to previous state on error
      if (context?.previousCoachData) {
        queryClient.setQueryData<CoachData>(['coach'], context.previousCoachData);
      }
    },
  });
};
