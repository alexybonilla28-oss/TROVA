
const SUPABASE_URL = "https://lsvykjlmwshbauqgtfvq.supabase.co";

const SUPABASE_KEY = "sb_publishable_vbF52X3ksVFZzb37ZlUgNg_3lUJdWOR";

const trovaSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

window.trovaSupabase = trovaSupabase;

console.log("TROVA: conexión con Supabase preparada.");
