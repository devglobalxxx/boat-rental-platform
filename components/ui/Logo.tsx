interface LogoProps {
  size?: number
  markOnly?: boolean
  className?: string
}

/**
 * BoatAway brand logo — redesigned premium anchor mark + refined wordmark.
 *
 * Mark geometry (40×40 viewBox):
 *  – Outer badge ring (very faint, defines mark boundary)
 *  – Anchor eye (ring) with centre plug at top
 *  – Clean shaft with proportional stock/crossbar (no circle caps)
 *  – Smooth blade flukes that curl up to meet the stock ends
 *  – Short crown bar at fluke base
 *  – Single sinusoidal wave at bottom
 *
 * Reads clearly from 20 px (favicon) to 120 px (hero/splash).
 */
export default function Logo({ size = 36, markOnly = false, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>

      {/* ── Mark ──────────────────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Badge ring — very faint, gives mark a contained icon quality */}
        <circle cx="20" cy="20" r="19" stroke="#c9a84e" strokeWidth="0.6" opacity="0.20" />

        {/* Anchor eye – clean open ring */}
        <circle cx="20" cy="10" r="5.2" stroke="#c9a84e" strokeWidth="1.9" />
        {/* Centre plug – the shackle attachment point */}
        <circle cx="20" cy="10" r="2.3" fill="#c9a84e" />

        {/* Shaft */}
        <line x1="20" y1="15" x2="20" y2="33.5" stroke="#c9a84e" strokeWidth="2.2" strokeLinecap="round" />

        {/* Stock / crossbar – no cap circles, just clean round ends */}
        <line x1="10.5" y1="21.5" x2="29.5" y2="21.5" stroke="#c9a84e" strokeWidth="2.2" strokeLinecap="round" />

        {/* Left blade — curves from crown up to meet stock end */}
        <path
          d="M20 33.5 C15 33.5 10.5 30.5 10.5 26"
          stroke="#c9a84e" strokeWidth="2.0" strokeLinecap="round" fill="none"
        />
        {/* Right blade — symmetric */}
        <path
          d="M20 33.5 C25 33.5 29.5 30.5 29.5 26"
          stroke="#c9a84e" strokeWidth="2.0" strokeLinecap="round" fill="none"
        />

        {/* Crown bar — small horizontal at the very bottom of the shaft */}
        <line x1="16.5" y1="33.5" x2="23.5" y2="33.5" stroke="#c9a84e" strokeWidth="2.0" strokeLinecap="round" />

        {/* Wave — single clean arc beneath the crown */}
        <path
          d="M8.5 37.5 Q14 35.5 20 37.5 Q26 39.5 31.5 37.5"
          stroke="#c9a84e" strokeWidth="1.5" strokeLinecap="round" fill="none"
          opacity="0.60"
        />
      </svg>

      {/* ── Wordmark ───────────────────────────────────────────── */}
      {!markOnly && (
        <span className="leading-none" style={{ fontFamily: 'inherit' }}>
          {/* "Boat" — thin, slightly tracked, muted */}
          <span
            style={{
              fontSize: size * 0.545,
              fontWeight: 300,
              letterSpacing: '0.04em',
              color: 'rgba(244,244,242,0.70)',
            }}
          >
            Boat
          </span>
          {/* "Hire24" — heavy, tight, bright — high contrast */}
          <span
            style={{
              fontSize: size * 0.545,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#f4f4f2',
            }}
          >
            Hire24
          </span>
        </span>
      )}
    </span>
  )
}
