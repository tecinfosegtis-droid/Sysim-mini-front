// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// (não colocar ! pra não quebrar build se a var faltar; nas telas tratamos o erro)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

