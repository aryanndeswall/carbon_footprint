import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfileData } from '../services/profile.service';
import { ProfileData } from '../types/profile.types';

export const useProfileData = () => {
  const queryClient = useQueryClient();

  const query = useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: getProfileData,
    staleTime: 60 * 1000, // 60 seconds staleness rule
  });

  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  return {
    ...query,
    invalidateProfile,
  };
};
