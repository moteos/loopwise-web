import type { ReactNode } from 'react'
import './Features.css'

type Feature = {
  name: string
  body: string
  icon: ReactNode
}

const FEATURES: Feature[] = [
  {
    name: 'Signals',
    body: 'AI clusters tickets, calls and reviews into themes with revenue attached.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        <path d="M12 5.6a6.4 6.4 0 0 1 6.4 6.4" />
        <path d="M12 18.4A6.4 6.4 0 0 1 5.6 12" />
        <path d="M12 2.2A9.8 9.8 0 0 1 21.8 12" />
        <path d="M12 21.8A9.8 9.8 0 0 1 2.2 12" />
      </svg>
    ),
  },
  {
    name: 'Roadmap Autopilot',
    body: 'Ranks themes by affected ARR, churn risk and effort.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 20v-6" />
        <path d="M12 20V9" />
        <path d="M19 20V4" />
      </svg>
    ),
  },
  {
    name: 'Close the Loop',
    body: 'A personal update to everyone who asked, the day a theme ships.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 12a5 5 0 0 1 5-5h4" />
        <path d="M13 4l3 3-3 3" />
        <path d="M17 12a5 5 0 0 1-5 5H8" />
        <path d="M11 20l-3-3 3-3" />
      </svg>
    ),
  },
]

export default function Features() {
  return (
    <section
      className="features section"
      id="how-it-works"
      aria-labelledby="features-title"
    >
      <div className="container">
        <div className="section__head features__head">
          <h2 className="section__title" id="features-title">
            How it works
          </h2>
        </div>

        <ul className="features__grid">
          {FEATURES.map((feature, index) => (
            <li className="feature-card" key={feature.name}>
              <div className="feature-card__top">
                <span className="feature-card__icon">{feature.icon}</span>
                <span className="feature-card__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="feature-card__name">{feature.name}</h3>
              <p className="feature-card__body">{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
