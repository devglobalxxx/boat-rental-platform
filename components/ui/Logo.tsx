interface LogoProps {
  size?: number
  /** Show just the mark without the wordmark */
  markOnly?: boolean
  className?: string
}

/**
 * BoatAway brand logo — custom SVG anchor mark + styled wordmark.
 * The mark uses a geometric anchor with a wave-rope ring and weighted flukes
 * so it reads clearly at 24 px (favicon) through 120 px (splash / hero).
 */
export default function Logo({ size = 36, markOnly = false, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* ── Anchor mark ─────────────────────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer ring */}
        <circle cx="20" cy="9.5" r="6.2" stroke="#c9a84e" strokeWidth="2.4" />
        {/* Centre knot */}
        <circle cx="20" cy="9.5" r="2.4" fill="#c9a84e" />

        {/* Shaft */}
        <path d="M20 14V32" stroke="#c9a84e" strokeWidth="2.6" strokeLinecap="round" />

        {/* Crossbar */}
        <path d="M10.5 20H29.5" stroke="#c9a84e" strokeWidth="2.6" strokeLinecap="round" />

        {/* Crossbar end caps */}
        <circle cx="10.5" cy="20" r="2.4" fill="#c9a84e" />
        <circle cx="29.5" cy="20" r="2.4" fill="#c9a84e" />

        {/* Left fluke */}
        <path
          d="M20 32 C14.5 32 10.5 29 10.5 24.5"
          stroke="#c9a84e"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right fluke */}
        <path
          d="M20 32 C25.5 32 29.5 29 29.5 24.5"
          stroke="#c9a84e"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Wave accent below flukes */}
        <path
          d="M10 36.5 Q15 34 20 36.5 Q25 39 30 36.5"
          stroke="#c9a84e"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.65"
        />
      </svg>

      {/* ── Wordmark ─────────────────────────────────────────────────────── */}
      {!markOnly && (
        <span
          className="leading-none"
          style={{ fontFamily: 'inherit' }}
        >
          <span
            style={{
              fontSize: size * 0.525,
              fontWeight: 400,
              letterSpacing: '0.01em',
              color: 'rgba(244,244,242,0.78)',
            }}
          >
            Boat
          </span>
          <span
            style={{
              fontSize: size * 0.525,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              color: '#f4f4f2',
            }}
          >
            Away
          </span>
        </span>
      )}
    </span>
  )
}
