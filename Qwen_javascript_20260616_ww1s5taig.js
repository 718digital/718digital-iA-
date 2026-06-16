/**
 * script.js — 718 Forge
 * Gère le formulaire, l'appel à /api/generate, l'aperçu live,
 * la copie du code et le téléchargement du .zip.
 */
(() => {
  const form = document.getElementById("generator-form");
  const generateBtn = document.getElementById("generate-btn");
  const errorBox = document.getElementById("error-box");
  const loadingBox = document.getElementById("loading-box");
  const loadingText = document.getElementById("loading-text");
  const resultSection = document.getElementById("result-section");
  const previewFrame = document.getElementById("preview-frame");
  const copyBtn = document.getElementById("copy-btn");
  const downloadBtn = document.getElementById("download-btn");
  const toast = document.getElementById("toast");

  const primaryColorPicker = document.getElementById("primaryColorPicker");
  const primaryColorText = document.getElementById("primaryColor");
  const secondaryColorPicker = document.getElementById("secondaryColorPicker");
  const secondaryColorText = document.getElementById("secondaryColor");

  let lastGeneratedHtml = "";
  let lastSiteName = "site-718digital";

  primaryColorPicker.addEventListener("input", () => {
    primaryColorText.value = primaryColorPicker.value;
  });
  
  secondaryColorPicker.addEventListener("input", () => {
    secondaryColorText.value = secondaryColorPicker.value;
  });

  const loadingMessages = [
    "Mistral façonne votre site...",
    "Composition de la structure HTML...",
    "Application de la palette de couleurs...",
    "Ajustement du responsive...",
    "Dernières retouches stylistiques...",
  ];

  let loadingInterval = null;

  function startLoadingAnimation() {
    let i = 0;
    loadingText.textContent = loadingMessages[0];
    loadingInterval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      loadingText.textContent = loadingMessages[i];
    }, 2200);
  }

  function stopLoadingAnimation() {
    clearInterval(loadingInterval);
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => { toast.hidden = true; }, 300);
    }, 2500);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const formData = new FormData(form);
    const sections = formData.getAll("sections");

    const payload = {
      siteName: formData.get("siteName")?.trim(),
      sector: formData.get("sector")?.trim(),
      primaryColor: formData.get("primaryColor")?.trim(),
      secondaryColor: formData.get("secondaryColor")?.trim(),
      tone: formData.get("tone"),
      sections,
      freeText: formData.get("freeText")?.trim(),
    };

    if (!payload.siteName && !payload.freeText) {
      showError("Merci de renseigner au moins le nom du site ou une description libre.");
      return;
    }

    lastSiteName = (payload.siteName || "site-718digital")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "site-718digital";

    generateBtn.disabled = true;
    loadingBox.hidden = false;
    resultSection.hidden = true;
    startLoadingAnimation();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de la génération.");
      }

      lastGeneratedHtml = data.html;
      renderPreview(lastGeneratedHtml);
      resultSection.hidden = false;
      resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      showError(err.message || "Impossible de contacter le serveur. Réessaie dans un instant.");
    } finally {
      stopLoadingAnimation();
      loadingBox.hidden = true;
      generateBtn.disabled = false;
    }
  });

  function renderPreview(html) {
    previewFrame.srcdoc = html;
  }

  copyBtn.addEventListener("click", async () => {
    if (!lastGeneratedHtml) return;
    try {
      await navigator.clipboard.writeText(lastGeneratedHtml);
      showToast("Code copié dans le presse-papiers.");
    } catch {
      showToast("Impossible de copier automatiquement. Sélectionne le code manuellement.");
    }
  });

  downloadBtn.addEventListener("click", async () => {
    if (!lastGeneratedHtml) return;
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: lastGeneratedHtml, fileName: lastSiteName }),
      });

      if (!response.ok) {
        throw new Error("Le téléchargement a échoué.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${lastSiteName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Téléchargement lancé.");
    } catch (err) {
      showToast("Erreur lors du téléchargement.");
    }
  });
})();