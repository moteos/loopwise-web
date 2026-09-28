import logo from '../assets/loopwise-logo.svg'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <img
          className="site-footer__logo"
          src={logo}
          alt="Loopwise"
          width={560}
          height={160}
        />
        <p className="site-footer__legal">Loopwise, Inc. Austin, Texas.</p>
      </div>
    </footer>
  )
}
