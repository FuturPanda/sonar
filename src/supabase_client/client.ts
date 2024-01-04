import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://zagzcdysbcnezpgqczeb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZ3pjZHlzYmNuZXpwZ3FjemViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE4ODczNDQsImV4cCI6MjAxNzQ2MzM0NH0.h9uftbNHv3mqtW8yjcEMkVjV4qujU6ahbno--ZCiSrk";

const service_role_key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZ3pjZHlzYmNuZXpwZ3FjemViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMTg4NzM0NCwiZXhwIjoyMDE3NDYzMzQ0fQ.HvuXqon5uxK50SGq-OZQMLsdHAkS8hjM9V-Lydwd3ro";
//supabase gen types typescript --project-id zagzcdysbcnezpgqczeb > database.types.ts

export const supabase = createClient(supabaseUrl, service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Access auth admin api
const adminAuthClient = supabase.auth.admin;
