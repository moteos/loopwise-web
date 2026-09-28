import './ProofStrip.css'

export default function ProofStrip() {
  return (
    <section className="proof" aria-label="Customers">
      <div className="proof__glow" aria-hidden="true" />

      <div className="container proof__inner">
        <p className="proof__stat">
          <span className="proof__stat-value">212</span>
          <span className="proof__stat-label">teams use Loopwise</span>
        </p>

        <figure className="proof__quote">
          <blockquote>
            <p>“Triage went from nine hours a week to two.”</p>
          </blockquote>
          <figcaption>
            <span className="proof__quote-name">Alicia Moreno</span>
            <span className="proof__quote-role">
              VP Product at Kestrel Payroll
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
