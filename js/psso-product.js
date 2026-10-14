(() => {
  'use strict';
  const button = document.getElementById('copy-psso-script');
  const status = document.getElementById('copy-psso-status');
  if (!button || !status) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Script wird geladen …';
    try {
      const response = await fetch(button.dataset.scriptSrc);
      if (!response.ok) throw new Error('Script nicht erreichbar');
      const code = await response.text();
      if (!code.startsWith('// ==UserScript==')) throw new Error('Ungültige Scriptdatei');
      await navigator.clipboard.writeText(code);
      status.textContent = 'Kopiert. In Tampermonkey ein neues Script anlegen, Inhalt ersetzen und speichern.';
    } catch (_) {
      status.textContent = 'Kopieren ist hier nicht möglich. Bitte die Scriptdatei herunterladen und ihren Inhalt kopieren.';
    } finally {
      button.disabled = false;
    }
  });
})();
