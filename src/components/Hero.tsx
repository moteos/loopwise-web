import './Hero.css'

export default function Hero() {
  return (
    <section className="hero" id="waitlist" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />

      <div className="container hero__inner">
        <h1 className="hero__title" id="hero-title">
          Your customers already wrote your roadmap.{' '}
          <span className="hero__title-accent">Loopwise reads it.</span>
        </h1>

        <p className="hero__subhead">
          Turn every support ticket, sales call and review into a roadmap your
          customers would vote for.
        </p>

        <div className="hero__actions">
          <a className="btn btn--primary btn--lg" href="#waitlist">
            Join the waitlist
          </a>
          <a className="btn btn--secondary btn--lg" href="#how-it-works">
            See how it works
          </a>
        </div>

        <p className="hero__note">
          <span className="hero__note-dot" aria-hidden="true" />
          Launching on Product Hunt, Tuesday, October 20.
        </p>
      </div>
    </section>
  )
}
