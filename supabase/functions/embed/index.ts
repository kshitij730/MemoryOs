// Supabase Edge Function to generate embeddings using gte-small
// Deploy with: supabase functions deploy embed
// This avoids any paid embedding API — uses Supabase AI runtime (free)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// gte-small produces 384-dimensional vectors
const model = new Supabase.ai.Session("gte-small");

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { input } = await req.json();

        if (!input) {
            return new Response(
                JSON.stringify({ error: "Missing 'input' field" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const texts: string[] = Array.isArray(input) ? input : [input];

        if (texts.length === 0) {
            return new Response(
                JSON.stringify({ embeddings: [] }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Generate embeddings — mean_pool + normalize for cosine similarity
        const embeddings = await Promise.all(
            texts.map((text) =>
                model.run(text, { mean_pool: true, normalize: true })
            )
        );

        return new Response(
            JSON.stringify({ embeddings }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (err) {
        console.error("Embed function error:", err);
        return new Response(
            JSON.stringify({ error: String(err) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
