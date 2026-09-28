import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import { useLocation } from './router'

export default function App() {
  const { pathname, hash } = useLocation()

  // Land on the top of a new page, or on the section a hash link points at.
  useEffect(() => {
    const target = hash ? document.querySelector(hash) : null

    if (target) {
      target.scrollIntoView({ block: 'start' })
      return
    }

    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Home />
      </main>
      <Footer />
    </>
  )
}
