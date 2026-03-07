import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hngwpbfgaiuwnxhzxdxp.supabase.co";
const supabaseKey = "sb_publishable_v1PG7NXdQImhZ5CitDCfwA_cXGLp58v";

export const supabase = createClient(supabaseUrl, supabaseKey);
