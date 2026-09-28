import './Pricing.css'

type Plan = {
  name: string
  price: number
  includes: string
}

const PLANS: Plan[] = [
  { name: 'Starter', price: 49, includes: 'One workspace, three sources' },
  {
    name: 'Team',
    price: 99,
    includes: 'Unlimited sources, Roadmap Autopilot, Close the Loop',
  },
  {
    name: 'Business',
    price: 249,
    includes: 'Everything in Team, priority support and onboarding',
  },
]

export default function Pricing() {
  return (
    <section className="pricing section" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <div className="section__head">
          <h2 className="section__title" id="pricing-title">
            Pricing
          </h2>
        </div>

        <ul className="pricing__grid">
          {PLANS.map((plan) => (
            <li className="price-card" key={plan.name}>
              <h3 className="price-card__name">{plan.name}</h3>
              <p className="price-card__price">
                <span className="price-card__amount">
                  <span className="price-card__currency">$</span>
                  {plan.price}
                </span>
                <span className="price-card__period">/mo</span>
              </p>
              <p className="price-card__includes">{plan.includes}</p>
              {/* TODO: point at the real waitlist form once signup is live. */}
              <a className="btn btn--secondary price-card__cta" href="#waitlist">
                Join the waitlist
              </a>
            </li>
          ))}
        </ul>

        <p className="pricing__note">
          Prices are per team, not per seat. Annual billing saves two months.
        </p>
      </div>
    </section>
  )
}
