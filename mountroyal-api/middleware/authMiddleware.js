const { createClient } = require('@supabase/supabase-js');

// Paste your exact URL and Anon Key here, just like you did on the frontend
const supabaseUrl = 'YOUR_PROJECT_URL_HERE';
const supabaseAnonKey = 'YOUR_ANON_PUBLIC_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const verifyToken = async (req, res, next) => {
  try {
    // 1. Check if the frontend sent an Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access Denied: No token provided' });
    }

    // 2. Extract the token from "Bearer [TOKEN]"
    const token = authHeader.split(' ')[1];

    // 3. Ask Supabase if this token is actually valid and active
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(403).json({ error: 'Access Denied: Invalid or expired token' });
    }

    // 4. Token is good! Let the request pass through to the database
    req.user = data.user; 
    next(); 
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(500).json({ error: 'Server authentication error' });
  }
};

module.exports = verifyToken;