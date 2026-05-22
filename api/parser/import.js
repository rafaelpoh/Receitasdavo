
/**
 * Strips HTML tags and script/style tags to extract clean text from a web page.
 * This keeps the payload sent to Gemini minimal and prevents token limit issues.
 */
function extractTextFromHtml(html) {
  let text = html;
  
  // Remove non-cooking content tags completely
  text = text.replace(/<(script|style|svg|noscript|iframe|header|footer|nav)[^>]*>([\s\S]*?)<\/\1>/gi, '');
  
  // Remove HTML tags, leaving text content
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities commonly found in recipes
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&ordm;/g, 'º')
             .replace(/&ordf;/g, 'ª');

  // Collapse consecutive white spaces and trim
  return text.replace(/\s+/g, ' ').trim();
}

module.exports = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API Key is not configured on the server.' });
  }

  const { url, text } = req.body;

  if (!url && !text) {
    return res.status(400).json({ error: 'Provide either a URL or raw recipe text.' });
  }

  let contentToParse = '';

  try {
    if (url) {
      // Validate URL format before fetching to prevent Server-Side Request Forgery (SSRF)
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid URL format.' });
      }

      // Fetch external cooking website content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: AbortSignal.timeout(8000) // Timeout after 8s to prevent Vercel execution timeouts (10s limit on hobby tier)
      });

      if (!response.ok) {
        return res.status(400).json({ error: `Failed to fetch cooking website (HTTP ${response.status}).` });
      }

      const html = await response.text();
      contentToParse = extractTextFromHtml(html);
      
      // Safety truncation to avoid Gemini prompt size limit
      if (contentToParse.length > 50000) {
        contentToParse = contentToParse.substring(0, 50000);
      }
    } else {
      contentToParse = text;
    }

    // Call Gemini API with strict structured JSON schema
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Extraia a receita culinária do seguinte texto/HTML de maneira precisa. Se o texto não contiver uma receita inteligível, crie uma receita com base nos termos encontrados, estruturando os ingredientes e o modo de preparo de forma coerente.

Texto de entrada:
${contentToParse}`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              titulo: { type: "STRING" },
              categoria: { 
                type: "STRING", 
                enum: ["Sobremesas", "Massas", "Carnes", "Outros"] 
              },
              ingredientes: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              modo_preparo: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["titulo", "ingredientes", "modo_preparo", "categoria"]
          }
        }
      })
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.json().catch(() => ({}));
      console.error('Gemini API Error details:', errBody);
      return res.status(502).json({ error: 'Gemini API failed to parse. Please check keys or try again.' });
    }

    const geminiData = await geminiResponse.json();
    const parsedText = geminiData.candidates[0].content.parts[0].text;
    const structuredRecipe = JSON.parse(parsedText);

    return res.status(200).json(structuredRecipe);

  } catch (error) {
    console.error('Import Parser error:', error);
    if (error.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Request to cooking site timed out. Copy and paste the text instead.' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
