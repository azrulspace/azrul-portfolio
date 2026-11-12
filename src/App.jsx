import React, { lazy, Suspense, useEffect, useSyncExternalStore } from 'react'
import layout from './framer-layout.json'
import { pages } from './pages.js'
import { repairLinks } from './links.js'

const modules = import.meta.glob(['../framer/*.jsx', '../framer-extra/*.{jsx,js}'])
const components = Object.fromEntries(Object.entries(modules).map(([path, load]) => [
  path.split('/').pop().replace(/\.(jsx|js)$/, ''), lazy(load),
]))

export function breakpointForWidth(width) {
  return width >= 1440 ? 'Desktop' : width >= 810 ? 'Tablet' : 'Phone'
}
function subscribe(callback) {
  const queries = [matchMedia('(min-width: 810px)'), matchMedia('(min-width: 1440px)')]
  queries.forEach(query => query.addEventListener('change', callback))
  return () => queries.forEach(query => query.removeEventListener('change', callback))
}
function useBreakpoint() {
  return useSyncExternalStore(subscribe, () => breakpointForWidth(window.innerWidth), () => 'Desktop')
}
function Exported({ spec, style }) {
  const Component = components[spec.component]
  return <Component {...spec.props} style={{ width: '100%', minWidth: 0, maxWidth: '100%', height: spec.height, ...style }} />
}
function Page({ page, breakpoint, path }) {
  const current = page.breakpoints[breakpoint]
  const isProject = path.startsWith('/project/')
  const SmoothScroll = components['smooth-scroll']
  useEffect(() => {
    const update = () => repairLinks(document, path)
    update()
    // Menus and variant changes can introduce new links after the first render.
    const observer = new MutationObserver(update)
    observer.observe(document.getElementById('root'), { childList: true, subtree: true })
    const hash = decodeURIComponent(location.hash.slice(1))
    if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView())
    return () => observer.disconnect()
  }, [path, breakpoint])
  return <>
    <SmoothScroll intensity={12} />
    {path === '/' && <div className="header-blur" />}
    <header className={`site-header ${isProject ? 'case-header' : ''}`} style={{ top: current.headerTop }}>
      <Exported spec={current.header} style={{ height: isProject ? '80px' : 'auto' }} />
    </header>
    <main id="main" className={isProject ? 'case-study' : ''}>
      {current.sections.map((section) => <React.Fragment key={section.sourceId}>
        {isProject && section.component === 'footer-desktop' && <div className="back-top"><a href="#main" aria-label="Go to top"><span aria-hidden="true">↑</span> Go to top</a></div>}
        <section id={section.id} data-source-id={section.sourceId}
          className={`portfolio-section ${section.component.startsWith('content-details') ? 'case-body' : ''}`}
          style={{ marginTop: section.gap || 0 }}>
          <Exported spec={section} />
        </section>
      </React.Fragment>)}
    </main>
    {current.panel && <aside className="case-panel" aria-label="On this page" style={{ top: current.panel.top, right: current.panel.right, width: current.panel.width }}><Exported spec={current.panel} style={{ height: 'auto' }} /></aside>}
  </>
}
export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const page = layout[path]
  const breakpoint = useBreakpoint()
  useEffect(() => { document.title = pages[path]?.title || 'Page not found — Azrul Space' }, [path])
  return <div className="site" style={{ background: page?.background || '#fafafa' }}>
    <a className="skip-link" href="#main">Skip to content</a>
    {page ? <Suspense fallback={<p className="loading" role="status">Loading portfolio…</p>}>
      <Page page={page} breakpoint={breakpoint} path={path} />
    </Suspense> : <main id="main" className="not-found"><h1>Page not found</h1><a href="/">Back to home</a></main>}
  </div>
}
