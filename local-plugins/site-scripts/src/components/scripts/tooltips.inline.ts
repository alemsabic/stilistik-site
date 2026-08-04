// Decode HTML entities in data-tooltip attributes
document.addEventListener("nav", () => {
  const elementsWithTooltips = document.querySelectorAll("[data-tooltip]")

  elementsWithTooltips.forEach((element) => {
    const tooltip = element.getAttribute("data-tooltip")
    if (tooltip) {
      // Create a temporary element to decode HTML entities
      const textarea = document.createElement("textarea")
      textarea.innerHTML = tooltip
      const decoded = textarea.value
      element.setAttribute("data-tooltip", decoded)
    }
  })
})
