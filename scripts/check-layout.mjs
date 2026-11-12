import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { destinationFor, repairLinks } from '../src/links.js'

const layout = JSON.parse(fs.readFileSync('src/framer-layout.json', 'utf8'))
const source = JSON.parse(fs.readFileSync('reference/framer-pages.json', 'utf8'))
assert.deepEqual(Object.keys(layout).sort(), source.map(page => page.path).sort())
assert.equal(destinationFor('Contact me', '/aboutme'), '/aboutme#contact-me-section')
assert.equal(destinationFor('Featured works', '/'), '/#featured-works')
assert.equal(destinationFor('Home', '/'), '/')
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const warnings = new Set()
const originalError = console.error
console.error = (...args) => warnings.add(args.map(String).join(' '))
let renders = 0
const results = []
try {
  const { breakpointForWidth } = await server.ssrLoadModule('/src/App.jsx')
  for (const [width, expected] of [[375,'Phone'],[390,'Phone'],[809,'Phone'],[810,'Tablet'],[1200,'Tablet'],[1439,'Tablet'],[1440,'Desktop'],[1920,'Desktop']]) {
    assert.equal(breakpointForWidth(width), expected)
  }
  const heading = { textContent: 'Design System', id: '' }
  const link = { textContent: '02Design System', href: '/project/agenticas', getAttribute() { return this.href }, setAttribute(_, value) { this.href = value }, closest() { return true } }
  repairLinks({ querySelectorAll(selector) { return selector === 'a[href]' ? [link] : [heading] } }, '/project/nurri')
  assert.equal(link.href, '#case-heading-0')
  for (const [path, page] of Object.entries(layout)) {
    for (const [breakpoint, composition] of Object.entries(page.breakpoints)) {
      const specs = [composition.header, ...composition.sections, ...(composition.panel ? [composition.panel] : [])]
      const texts = []
      for (const spec of specs) {
        const file = spec.component === 'content-details-eduqat-course' ? `/framer-extra/${spec.component}.js` : `/framer/${spec.component}.jsx`
        assert.ok(fs.existsSync(`.${file}`), `Missing ${file}`)
        const { default: Component } = await server.ssrLoadModule(file)
        if (spec.props.variant) {
          const values = Component.propertyControls?.variant?.options || []
          assert.ok(values.includes(spec.props.variant), `Unknown variant ${spec.props.variant} for ${file}`)
        }
        const html = renderToString(React.createElement(Component, { ...spec.props, style: { width: '100%', height: spec.height } }))
        assert.ok(html.length > 100, `Empty render ${file}`)
        const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
        if (spec.component.startsWith('content-details')) assert.ok(text.length > 3000, `Missing case study body ${path}`)
        texts.push(text)
        renders++
      }
      assert.ok(texts.join(' ').includes(path === '/vibe' ? 'Soon' : path.startsWith('/project/') ? 'BACK TO ALL WORKS' : 'Azrul') || path === '/works')
      results.push({ path, breakpoint, components: specs.length, status: 'passed' })
    }
  }
} finally {
  console.error = originalError
  await server.close()
}
fs.mkdirSync('verification', { recursive: true })
fs.writeFileSync('verification/render-checks.json', JSON.stringify({ results, renders, warnings: [...warnings], browserVerified: false }, null, 2))
console.log(`Passed: ${results.length} page/breakpoint combinations, ${renders} component renders.`)
console.log(`${warnings.size} distinct upstream React warnings recorded in verification/render-checks.json.`)
