import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useProfile = (user: User | null) => {
  useEffect(() => {
    const createProfile = async () => {
      if (!user) return;

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create new profile if it doesn't exist
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
            display_name: user.email?.split('@')[0] || 'User',
          });

        if (error) {
          console.error('Error creating profile:', error);
        }
      }
    };

    createProfile();
  }, [user]);
};