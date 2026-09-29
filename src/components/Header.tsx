import logo from '../assets/loopwise-logo.svg'
import { Link, useLocation } from '../router'
import './Header.css'

export default function Header() {
  const { pathname } = useLocation()

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="site-header__brand" to="/" aria-label="Loopwise — home">
          <img src={logo} alt="Loopwise" width={560} height={160} />
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          <Link to="/#how-it-works">Features</Link>
          <Link to="/#pricing">Pricing</Link>
          <Link
            className="site-header__link--insights"
            to="/insights"
            aria-current={pathname === '/insights' ? 'page' : undefined}
          >
            Insights
          </Link>
        </nav>

        {/* TODO: point at the real waitlist form once signup is live. */}
        <div className="site-header__actions">
          <Link className="btn btn--primary" to="/#waitlist">
            Join the waitlist
          </Link>
        </div>
      </div>
    </header>
  )
}
