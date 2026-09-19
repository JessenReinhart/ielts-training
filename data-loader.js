(() => {
  const encoded = (window.__IELTS_PARTS || []).join("");
  const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  const source = new TextDecoder("utf-8").decode(bytes);
  (0, eval)(source);
  delete window.__IELTS_PARTS;
})();