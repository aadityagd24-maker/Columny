import { supabase } from './supabaseClient';

export async function checkUsageLimits(userId, profile) {
  // Owners bypass all limits
  if (profile?.is_owner) {
    return { allowed: true };
  }

  // Count entries created in the last 12 hours
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  
  const { count, error } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', twelveHoursAgo);

  if (error) {
    console.error('Error checking usage limits:', error);
    return { allowed: true }; // Allow on error to be safe
  }

  if (count >= 10) {
    return { 
      allowed: false, 
      message: 'You have reached your 10 message limit for this 12-hour period. Please try again later or contact the owner.' 
    };
  }

  return { allowed: true, currentUsage: count };
}
