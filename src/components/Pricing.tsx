import './Pricing.css'

type Plan = {
  name: string
  price: number
}

const PLANS: Plan[] = [
  { name: 'Starter', price: 49 },
  { name: 'Team', price: 99 },
  { name: 'Business', price: 249 },
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
              {/* TODO: point at the real waitlist form once signup is live. */}
              <a className="btn btn--secondary price-card__cta" href="#waitlist">
                Join the waitlist
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
