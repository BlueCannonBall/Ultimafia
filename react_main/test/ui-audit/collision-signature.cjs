// In-page collision measurement for interactive controls. Positive overlap
// between two unrelated controls is always a defect; a zero-gap pair is
// reported separately so it can be reviewed against the control's group.
function collisionSignature() {
  const main = document.querySelector("#main-content");
  if (!main) return { overlaps: [], touches: [], clipped: [] };

  const label = (el) => (el.getAttribute("aria-label") || el.textContent || el.getAttribute("value") || el.tagName).trim().replace(/\s+/g, " ").slice(0, 60);
  const path = (el) => {
    const parts = [];
    for (let node = el; node && node !== main; node = node.parentElement) {
      const name = node.tagName.toLowerCase();
      const cls = String(node.className || "").trim().split(/\s+/).filter(Boolean).slice(0, 2).join(".");
      const siblings = node.parentElement ? [...node.parentElement.children].filter((child) => child.tagName === node.tagName) : [];
      parts.unshift(`${name}${cls ? "." + cls : ""}${siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(node) + 1})` : ""}`);
    }
    return parts.join(" > ");
  };

  const controls = [...main.querySelectorAll(
    'button, a[href], input, select, textarea, [role="button"], [role="tab"], [role="menuitem"], [role="option"]',
  )].filter((el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width > 2 && rect.height > 2 && style.visibility !== "hidden" && style.display !== "none" && style.opacity !== "0";
  });

  const overlaps = [];
  const touches = [];
  for (let i = 0; i < controls.length; i++) {
    for (let j = i + 1; j < controls.length; j++) {
      const a = controls[i];
      const b = controls[j];
      if (a.contains(b) || b.contains(a)) continue;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const overlapX = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const overlapY = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (overlapX > 1 && overlapY > 1) {
        overlaps.push({
          a: { label: label(a), path: path(a), rect: [ra.left, ra.top, ra.right, ra.bottom].map((value) => Math.round(value)) },
          b: { label: label(b), path: path(b), rect: [rb.left, rb.top, rb.right, rb.bottom].map((value) => Math.round(value)) },
          overlap: [Math.round(overlapX), Math.round(overlapY)],
        });
        continue;
      }
      // Deliberate compound controls share an edge. Ignore them; report other
      // zero-gap neighbours for review.
      if (a.closest("[data-ui-control], [role=tablist], .page-nav, .ui-vote, .ui-inline-actions, .ui-segmented, .MuiTabs-root") &&
          b.closest("[data-ui-control], [role=tablist], .page-nav, .ui-vote, .ui-inline-actions, .ui-segmented, .MuiTabs-root")) continue;
      const horizontalTouch = Math.abs(ra.right - rb.left) <= 0.5 || Math.abs(rb.right - ra.left) <= 0.5;
      const verticalTouch = Math.abs(ra.bottom - rb.top) <= 0.5 || Math.abs(rb.bottom - ra.top) <= 0.5;
      if ((horizontalTouch && overlapY > 1) || (verticalTouch && overlapX > 1)) {
        touches.push({
          a: { label: label(a), path: path(a) },
          b: { label: label(b), path: path(b) },
          overlap: [Math.round(overlapX), Math.round(overlapY)],
        });
      }
    }
  }

  const clipped = [];
  for (const el of main.querySelectorAll("button, a[href], .ui-segmented, [role=tablist]")) {
    if (el.scrollWidth - el.clientWidth > 1) {
      clipped.push({ path: path(el), label: label(el), clientWidth: el.clientWidth, scrollWidth: el.scrollWidth });
    }
  }

  return { overlaps, touches, clipped };
}

module.exports = { collisionSignature };
