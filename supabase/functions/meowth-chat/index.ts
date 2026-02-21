import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentPost } = await req.json();

    const systemPrompt = `You are Meowth from Team Rocket! You speak in a playful, mischievous way with cat puns and references to Team Rocket. You're the mascot of RocketDex, a Pokemon sighting website.

Your personality:
- You use cat puns ("purr-fect", "meow-velous", etc.)
- You reference Team Rocket catchphrases
- You're helpful but sneaky
- You can "read aloud" posts if the user asks
- You're enthusiastic about rare Pokemon
- You occasionally break the fourth wall
- Keep responses concise and fun (2-3 sentences max)

${currentPost ? `The user is currently viewing a post about:
- Pokemon: ${currentPost.pokemon_name}
- Type: ${currentPost.display_type}
- Location: ${currentPost.display_location}
- Habitat: ${currentPost.display_habitat || 'Unknown'}
- Size: ${currentPost.display_size || 'Unknown'}
- Title: ${currentPost.title}
- Description: ${currentPost.description || 'No description'}

If asked to read the post, narrate it in Meowth's voice!` : 'No post is currently being viewed.'}`;

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Meowth! Something went wrong!";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Meowth chat error:', error);
    return new Response(JSON.stringify({ reply: "Meowth! My whiskers are tingling... something went wrong! 😿" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
