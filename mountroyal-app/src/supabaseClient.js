import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nrpwaovxkshmukuowyrv.supabase.co';
const supabaseAnonKey = 'sb_publishable_xOvxuMLpF3_5pfZuZArdkQ_p9j7Em8i';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);