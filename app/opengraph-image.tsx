import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BoatHire24 — Rent Boats & Yachts Worldwide'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07101e 0%, #0c1828 50%, #0e1f35 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '600px',
            background: 'radial-gradient(ellipse, rgba(201,168,78,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
            display: 'flex',
          }}
        />

        {/* Bottom wave decoration */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '120px',
            background: 'linear-gradient(180deg, transparent, rgba(201,168,78,0.05))',
            display: 'flex',
          }}
        />

        {/* Gold accent line */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #c9a84e, #d4b05e, #c9a84e, transparent)',
            display: 'flex',
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '36px',
          }}
        >
          {/* Anchor icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(201,168,78,0.15)',
              border: '2px solid rgba(201,168,78,0.40)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}
          >
            ⚓
          </div>
          <span
            style={{
              fontSize: '42px',
              fontWeight: 800,
              color: '#f4f4f2',
              letterSpacing: '-0.02em',
            }}
          >
            Boat<span style={{ color: '#c9a84e' }}>Hire24</span>
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 800,
            color: '#f4f4f2',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            maxWidth: '900px',
          }}
        >
          Rent Boats & Yachts{' '}
          <span style={{ color: '#c9a84e' }}>Worldwide</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: 'rgba(244,244,242,0.60)',
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.5,
            marginBottom: '48px',
          }}
        >
          200+ verified boats · 48 destinations · Instant booking
        </div>

        {/* Stats pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {[
            { icon: '🛥️', label: '200+ Boats' },
            { icon: '🌍', label: '48 Destinations' },
            { icon: '⭐', label: '4.9 Rating' },
            { icon: '✅', label: 'Instant Book' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '99px',
                background: 'rgba(201,168,78,0.10)',
                border: '1px solid rgba(201,168,78,0.28)',
                fontSize: '18px',
                color: '#c9a84e',
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* URL badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            right: '40px',
            fontSize: '16px',
            color: 'rgba(244,244,242,0.35)',
            fontWeight: 500,
            display: 'flex',
          }}
        >
          boathire24.com
        </div>
      </div>
    ),
    { ...size }
  )
}
