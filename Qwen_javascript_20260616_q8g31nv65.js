require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const archiver = require('archiver');
const { buildPrompts } = require('./promptBuilder');
const { generateWebsiteHtml } = require('./mistralClient');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint pour générer le site via Mistral
app.post('/api/generate', async (req, res) => {
  try {
    const payload = req.body;
    const { systemPrompt, userPrompt } = buildPrompts(payload);
    const html = await generateWebsiteHtml(systemPrompt, userPrompt);
    res.json({ html });
  } catch (error) {
    console.error('Erreur de génération:', error);
    res.status(500).json({ error: error.message || "Une erreur est survenue lors de la génération." });
  }
});

// Endpoint pour télécharger le site en .zip
app.post('/api/download', (req, res) => {
  const { html, fileName } = req.body;
  if (!html || !fileName) {
    return res.status(400).json({ error: "HTML et nom de fichier requis." });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}.zip`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => {
    console.error('Erreur d\'archivage:', err);
    res.status(500).end();
  });

  archive.pipe(res);
  archive.append(html, { name: 'index.html' });
  archive.finalize();
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur 718 Forge démarré sur http://localhost:${PORT}`);
});