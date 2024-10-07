import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://hmkowbnwmfhozpzquscm.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta293Ym53bWZob3pwenF1c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0MjQzMTcsImV4cCI6MjA0MzAwMDMxN30.12rs-dd9aXyPjQxTlB7WNeOemLUYvZMDH4iTsBcbgmo"
);
