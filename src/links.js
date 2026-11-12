const normalized = text => text.toLowerCase().replace(/^\s*\d+\s*/, '').replace(/[^a-z0-9]/g, '')

// These CTAs lost their section destinations in Unframer's page-link resolver.
export function destinationFor(label, href) {
  const text = normalized(label)
  if (text === 'featuredworks' && href === '/') return '/#featured-works'
  if (['contactme', 'sendmessage'].includes(text) && ['/', '/aboutme'].includes(href)) return '/aboutme#contact-me-section'
  return href
}
export function repairLinks(root, path) {
  const headings = [...root.querySelectorAll('.case-body h2, .case-body h3, .case-body p')]
    .filter(heading => heading.tagName !== 'P' || /^\s*\d{1,2}\s*[-—–·:]/.test(heading.textContent))
  const targets = new Map()
  headings.forEach((heading, index) => {
    const text = normalized(heading.textContent)
    if (!heading.id) heading.id = `case-heading-${index}`
    if (!targets.has(text)) targets.set(text, heading.id)
  })
  root.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href')
    const label = link.textContent.trim()
    let destination = destinationFor(label, href)
    if (path.startsWith('/project/') && /^\d{2}/.test(label) && link.closest('.case-body, .case-panel')) {
      const target = targets.get(normalized(label))
      if (target) destination = `#${target}`
    }
    if (destination !== href) link.setAttribute('href', destination)
  })
}
