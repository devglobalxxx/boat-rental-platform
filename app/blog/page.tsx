import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { POSTS, ALL_POSTS } from '@/lib/blog/posts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Charter Guide & Boat Reviews — BoatHire24 Blog",
  description: "Practical guides, destination deep-dives, and in-depth reviews of every boat in the Marbella fleet from BoatHire24's fleet captains and charter specialists.",
  alternates: {
    canonical: 'https://boathire24.com/blog',
    types: { 'application/rss+xml': 'https://boathire24.com/blog/rss.xml' },
  },
  openGraph: {
    title: 'Charter Guide & Boat Reviews — BoatHire24',
    description: 'In-depth boat reviews, destination guides, and insider knowledge from the BoatHire24 fleet captains.',
    url: 'https://boathire24.com/blog',
    type: 'website',
    siteName: 'BoatHire24',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Charter Guide & Boat Reviews — BoatHire24',
    description: 'In-depth boat reviews and destination guides from Marbella charter specialists.',
  },
}

const gold = '#c9a84e'
const goldFaint = 'rgba(201,168,78,0.12)'
const goldBorder = 'rgba(201,168,78,0.22)'
const textMuted = 'rgba(244,244,242,0.55)'

export default function BlogPage() {
  const [featured, ...rest] = POSTS
  const boatPosts = ALL_POSTS.filter((p) => p.tag === 'Boat review')

  return (
    <div style={{ background: '#07101e', color: '#f4f4f2' }}>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '104px', paddingBottom: '88px', borderBottom: '1px solid rgba(201,168,78,0.12)' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,78,0.09) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <span style={{ display: 'inline-flex', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', padding: '5px 14px', borderRadius: '99px', background: goldFaint, color: gold, border: `1px solid ${goldBorder}`, marginBottom: '20px' }}>
            Editorial
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '16px', color: '#f4f4f2' }}>
            The Captain&apos;s Log
          </h1>
          <p style={{ fontSize: '17px', maxWidth: '640px', color: textMuted, lineHeight: 1.7 }}>
            Practical guides, destination deep-dives, and insider knowledge from the
            BoatHire24 fleet captains and charter specialists.
          </p>
        </div>
      </section>

      {/* ── Featured post ── */}
      <section style={{ padding: '88px 0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <Link
            href={`/blog/${featured.slug}`}
            className="group"
            style={{ display: 'block', overflow: 'hidden', borderRadius: '18px', background: '#0c1828', border: `1px solid ${goldBorder}`, textDecoration: 'none' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#0a1420', minHeight: '280px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.heroImage}
                  alt={featured.title}
                  className="group-hover:scale-105"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 40%, rgba(12,24,40,0.50) 100%)' }} />
              </div>
              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.10em', padding: '4px 12px', borderRadius: '99px', background: goldFaint, color: gold, border: `1px solid ${goldBorder}` }}>
                    {featured.tag}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(244,244,242,0.40)' }}>{featured.readTime}</span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3, color: '#f4f4f2' }}>{featured.title}</h2>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: textMuted }}>{featured.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f2' }}>{featured.author}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(244,244,242,0.40)' }}>{featured.date}</div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: gold }}>
                    Read article <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,78,0.25), transparent)' }} />
      </div>

      {/* ── 3 editorial cards ── */}
      <section style={{ padding: '88px 0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group"
                style={{ display: 'block', overflow: 'hidden', borderRadius: '18px', background: '#0c1828', border: '1px solid rgba(201,168,78,0.15)', textDecoration: 'none' }}
              >
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#0a1420' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.heroImage}
                    alt={post.title}
                    className="group-hover:scale-105"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  />
                </div>
                <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.10em', padding: '3px 10px', borderRadius: '99px', background: goldFaint, color: gold, border: `1px solid ${goldBorder}` }}>
                      {post.tag}
                    </span>
                    <span style={{ fontSize: '12px', color: 'rgba(244,244,242,0.40)' }}>{post.readTime}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, lineHeight: 1.35, color: '#f4f4f2' }}>{post.title}</h3>
                  <p style={{ fontSize: '14px', lineHeight: 1.65, color: textMuted }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(201,168,78,0.10)' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(244,244,242,0.40)' }}>{post.author} · {post.date}</div>
                    <ChevronRight style={{ width: '16px', height: '16px', color: 'rgba(201,168,78,0.50)' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Boat Reviews ── */}
      {boatPosts.length > 0 && (
        <>
          {/* Divider */}
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,78,0.25), transparent)' }} />
          </div>

          <section style={{ padding: '88px 0' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '52px' }}>
                <span style={{ display: 'inline-flex', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', padding: '5px 14px', borderRadius: '99px', background: goldFaint, color: gold, border: `1px solid ${goldBorder}`, marginBottom: '16px' }}>
                  Fleet Reviews
                </span>
                <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, color: '#f4f4f2' }}>
                  Complete Marbella Fleet Reviews
                </h2>
                <p style={{ fontSize: '15px', maxWidth: '640px', margin: '12px auto 0', color: textMuted, lineHeight: 1.7 }}>
                  In-depth reviews of every boat in our Marbella fleet — specs, prices, itineraries, and honest assessments.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
                {boatPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group"
                    style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '18px', background: '#0c1828', border: '1px solid rgba(201,168,78,0.15)', textDecoration: 'none' }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#0a1420' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.heroImage}
                        alt={post.title}
                        className="group-hover:scale-105"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                      />
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.10em', padding: '3px 8px', borderRadius: '99px', background: 'rgba(7,16,30,0.80)', color: gold, border: `1px solid ${goldBorder}` }}>
                          Boat review
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      <h3 style={{ fontWeight: 700, lineHeight: 1.35, fontSize: '14px', color: '#f4f4f2' }}>{post.title}</h3>
                      <p style={{ fontSize: '12px', lineHeight: 1.6, color: textMuted, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        {post.excerpt}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: gold, marginTop: '4px' }}>
                        Read review <ChevronRight style={{ width: '14px', height: '14px' }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Divider */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,78,0.25), transparent)' }} />
      </div>

      {/* ── CTA ── */}
      <section style={{ padding: '88px 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontSize: '15px', marginBottom: '20px', color: textMuted }}>
            Ready to stop reading and start sailing?
          </p>
          <Link
            href="/search"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 36px',
              fontSize: '15px', fontWeight: 700, borderRadius: '99px',
              background: 'linear-gradient(135deg,#d4b05e,#c9a84e,#b8942e)', color: '#07101e',
              boxShadow: '0 8px 24px rgba(201,168,78,0.28)',
              textDecoration: 'none',
            }}
          >
            Browse available boats <ChevronRight style={{ width: '18px', height: '18px' }} />
          </Link>
        </div>
      </section>

    </div>
  )
}
