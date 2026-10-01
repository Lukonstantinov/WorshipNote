import type { CSSProperties } from 'react'
import { BookOpen, ListMusic, Guitar, Settings, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  /** CSS variable prefix for the section colour (see themes.css) */
  color: string
  /** extra path prefixes that should also highlight this tab */
  match: string[]
}

export const NAV: NavItem[] = [
  { to: '/library',  label: 'library',      Icon: BookOpen,  color: 'library',  match: ['/library', '/songs'] },
  { to: '/setlists', label: 'setlists',     Icon: ListMusic, color: 'setlists', match: ['/setlists'] },
  { to: '/chords',   label: 'chordLibrary', Icon: Guitar,    color: 'chords',   match: ['/chords'] },
  { to: '/practice', label: 'practice',     Icon: Sparkles,  color: 'practice', match: ['/practice', '/pitch', '/piano-learn'] },
  { to: '/settings', label: 'settings',     Icon: Settings,  color: 'settings', match: ['/settings'] },
]

export function sectionVars(color: string) {
  return {
    c1: `var(--sec-${color})`,
    c2: `var(--sec-${color}-2)`,
    grad: `linear-gradient(135deg, var(--sec-${color}) 0%, var(--sec-${color}-2) 100%)`,
  }
}

export function isNavActive(item: NavItem, pathname: string, search = '') {
  // A song opened from a setlist belongs to the Services tab
  if (pathname.startsWith('/songs/') && search.includes('setlist=')) return item.to === '/setlists'
  return item.match.some((m) => pathname === m || pathname.startsWith(m + '/'))
}

/** Primary call-to-action button styled with a section gradient. */
export function sectionButtonStyle(color: string): CSSProperties {
  const { c1, grad } = sectionVars(color)
  return { '--btn-grad': grad, '--btn-color': c1 } as CSSProperties
}
