'use client'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url) console.warn('NEXT_PUBLIC_SUPABASE_URL não definida')
if (!key) console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY não definida')

export const supabase = createClient(url, key)
