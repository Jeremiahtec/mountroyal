import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nrpwaovxkshmukuowyrv.supabase.co/rest/v1/';
const supabaseAnonKey = 'sb_publishable_xOvxuMLpF3_5pfZuZArdkQ_p9j7Em8i';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);