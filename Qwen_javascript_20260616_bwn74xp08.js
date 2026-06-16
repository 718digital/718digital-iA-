const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

async function generateWebsiteHtml(systemPrompt, userPrompt) {
  const apiKey = process.env.MISTRAL_API_KEY;
  const model = process.env.MISTRAL_MODEL || "mistral-large-latest";
  
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY n'est pas configurée sur le serveur.");
  }

  const response = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API Mistral (${response.status}): ${errorText.slice(0, 500)}`);
  }

  const data = await response.json();
  const rawContent = data?.choices?.[0]?.message?.content;
  
  if (!rawContent) {
    throw new Error("Réponse Mistral vide ou mal formée.");
  }

  return cleanHtmlOutput(rawContent);
}

function cleanHtmlOutput(rawContent) {
  let html = rawContent.trim();
  html = html.replace(/^`(?:html)?\s*/i, "").replace(/`\s*$/i, "");
  const doctypeIndex = html.toLowerCase().indexOf("<!doctype html");
  if (doctypeIndex > 0) {
    html = html.slice(doctypeIndex);
  }
  return html.trim();
}

module.exports = { generateWebsiteHtml };