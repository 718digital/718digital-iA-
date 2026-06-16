/**
 * promptBuilder.js
 * Construit les prompts système et utilisateur pour l'IA Mistral.
 */
function buildPrompts(payload) {
  const systemPrompt = `Tu es un développeur frontend expert et un designer UI/UX de luxe. 
Ta tâche est de générer une landing page complète, moderne, responsive et élégante en HTML et CSS (dans un seul fichier, avec le CSS dans une balise <style>).
Règles strictes :
1. Retourne UNIQUEMENT le code HTML brut, commençant par <!DOCTYPE html>. Ne mets pas de blocs markdown (\`\`\`html).
2. Utilise une palette de couleurs basée sur les couleurs fournies.
3. Le design doit être élégant, avec des typographies modernes (utilise des fonts Google comme 'Montserrat' et 'Playfair Display' ou 'Cormorant Garamond').
4. Inclus toutes les sections demandées avec du contenu réaliste et professionnel (pas de "Lorem Ipsum").
5. Le code doit être propre, sémantique et entièrement responsive (mobile-first).
6. Utilise des images placeholder de haute qualité (ex: https://images.unsplash.com/...).`;

  const sectionsList = payload.sections && payload.sections.length > 0 
    ? payload.sections.join(', ') 
    : 'Accueil, À propos, Services, Contact';
  
  const userPrompt = `Génère une landing page pour le site suivant :
- Nom de la marque : ${payload.siteName || 'Non spécifié'}
- Secteur d'activité : ${payload.sector || 'Non spécifié'}
- Couleur principale : ${payload.primaryColor || '#C9A84C'}
- Couleur secondaire : ${payload.secondaryColor || '#080808'}
- Ton / ambiance : ${payload.tone || 'Moderne et professionnel'}
- Sections à inclure : ${sectionsList}
- Description libre / instructions supplémentaires : ${payload.freeText || 'Aucune instruction supplémentaire, suis les meilleures pratiques de design.'}

Génère le code HTML complet maintenant.`;

  return { systemPrompt, userPrompt };
}

module.exports = { buildPrompts };