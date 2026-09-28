/**
 * Minimal client-side router.
 *
 * Two pages don't justify a routing dependency: this is a `useLocation` hook
 * plus a `Link` that pushes history state and re-renders the tree. Vite's dev
 * server and `vite preview` both fall back to index.html, so deep links to
 * /insights work without extra config.
 */

import { useEffect, useState } from 'react'
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '')

export type Location = {
  pathname: string
  hash: string
}

function readLocation(): Location {
  const { pathname, hash } = window.location
  const stripped =
    BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname

  return { pathname: stripped.replace(/\/+$/, '') || '/', hash }
}

function normalize(to: string) {
  const { pathname, search, hash } = new URL(to, window.location.origin)
  return { path: pathname.replace(/\/+$/, '') || '/', search, hash }
}

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

/** Resolve an app path to a real href, honouring the deploy base. */
export function href(to: string): string {
  const { path, search, hash } = normalize(to)
  return `${BASE}${path}${search}${hash}`
}

/** Push a new entry onto the history stack and re-render. */
export function navigate(to: string) {
  const { path, search, hash } = normalize(to)
  window.history.pushState(null, '', `${BASE}${path}${search}${hash}`)
  emit()
}

export function useLocation(): Location {
  const [location, setLocation] = useState(readLocation)

  useEffect(() => {
    const update = () => setLocation(readLocation())
    listeners.add(update)
    window.addEventListener('popstate', update)

    return () => {
      listeners.delete(update)
      window.removeEventListener('popstate', update)
    }
  }, [])

  return location
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string
  children: ReactNode
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return

    // Leave modified and middle clicks to the browser.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={href(to)} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
