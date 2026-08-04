// Highlight footnotes when clicked (for SPA navigation)
// Handles :target pseudo-class simulation for footnote links

function highlightFootnote() {
  // Remove any existing highlights
  const previousHighlight = document.querySelector(".footnotes li.footnote-highlighted")
  if (previousHighlight) {
    previousHighlight.classList.remove("footnote-highlighted")
  }

  // Get the current hash (e.g., #user-content-fn-1)
  const hash = window.location.hash
  if (!hash || !hash.startsWith("#user-content-fn-")) {
    return
  }

  // Find and highlight the target footnote
  const target = document.querySelector(hash)
  if (target && target.tagName === "LI") {
    target.classList.add("footnote-highlighted")

    // Remove highlight after animation (optional - can keep highlighted)
    // setTimeout(() => target.classList.remove("footnote-highlighted"), 3000)
  }
}

// Initialize on page load and SPA navigation
document.addEventListener("nav", () => {
  // Change "Footnotes" to "Fußnoten"
  const footnoteHeading = document.querySelector(".footnotes h2#footnote-label")
  if (footnoteHeading) {
    footnoteHeading.textContent = "Fußnoten"
  }

  // Add "Quellen" heading to References section if not present
  const refsSection = document.querySelector("#refs.references.csl-bib-body")
  if (refsSection && !refsSection.querySelector("h2")) {
    const heading = document.createElement("h2")
    heading.textContent = "Quellen"
    heading.style.marginBottom = "1rem"
    heading.style.fontWeight = "500"
    refsSection.insertBefore(heading, refsSection.firstChild)
  }

  // Highlight footnote if hash is present
  highlightFootnote()

  // Listen for hash changes (when clicking footnote links)
  function onHashChange() {
    highlightFootnote()
  }

  window.addEventListener("hashchange", onHashChange)
  window.addCleanup(() => window.removeEventListener("hashchange", onHashChange))

  // Also handle direct clicks on footnote reference links
  const footnoteLinks = document.querySelectorAll('a[href^="#user-content-fn-"]')
  footnoteLinks.forEach((link) => {
    function onClick(e: Event) {
      // Let the browser handle the scroll, but trigger highlight
      setTimeout(highlightFootnote, 10)
    }
    link.addEventListener("click", onClick)
    window.addCleanup(() => link.removeEventListener("click", onClick))
  })
})
