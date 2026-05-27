import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { POSTS, ALL_POSTS } from '@/lib/blog/posts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Charter Guide & Boat Reviews — BoatAway Blog",
  description: "Practical guides, destination deep-dives, and in-depth reviews of every boat in the Marbella fleet from BoatAway's fleet captains and charter specialists.",
}

export default function BlogPage() {
  const [featured, ...rest] = POSTS
  const boatPosts = ALL_POSTS.filter((p) => p.tag === 'Boat review')

  return (
    <div style={{ background: '#07101e', color: '#f4f4f2' }}>

      {/* ── Section 1: Hero / Editorial picks ── */}
      <section
        className="section-sm"
        style={{ borderBottom: '1px solid rgba(201,168,78,0.15)' }}
      >
        <div className="container">
          <p className="eyebrow mb-4">Editorial</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#f4f4f2' }}>
            The Captain&apos;s Log
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'rgba(244,244,242,0.58)' }}>
            Practical guides, destination deep-dives, and insider knowledge from the
            BoatAway fleet captains and charter specialists.
          </p>
        </div>
      </section>

      {/* Featured editorial post */}
      <section className="section-sm">
        <div className="container">
          <Link href={`/blog/${featured.slug}`} className="group block">
            <div
              className="overflow-hidden transition-all duration-250"
              style={{ background: '#0c1828', border: '1px solid rgba(201,168,78,0.18)', borderRadius: '14px' }}
            >
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden" style={{ background: '#0a1420', minHeight: '280px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.heroImage}
                    alt={featured.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 absolute inset-0"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 40%, rgba(12,24,40,0.50) 100%)' }} />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="eyebrow">{featured.tag}</span>
                    <span className="text-xs" style={{ color: 'rgba(244,244,242,0.40)' }}>{featured.readTime}</span>
                  </div>
                  <h2 className="text-2xl font-bold leading-snug mb-4" style={{ color: '#f4f4f2' }}>{featured.title}</h2>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(244,244,242,0.60)' }}>{featured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold" style={{ color: '#f4f4f2' }}>{featured.author}</div>
                      <div className="text-xs" style={{ color: 'rgba(244,244,242,0.40)' }}>{featured.date}</div>
                    </div>
                    <span className="text-sm font-semibold flex items-center gap-1 group-hover:text-[#f4f4f2] transition-colors" style={{ color: '#c9a84e' }}>
                      Read article <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Remaining 3 editorial posts */}
      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden transition-all duration-250 block"
                style={{ background: '#0c1828', border: '1px solid rgba(201,168,78,0.18)', borderRadius: '14px' }}
              >
                <div className="relative aspect-[16/9] overflow-hidden" style={{ background: '#0a1420' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.heroImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="eyebrow text-xs">{post.tag}</span>
                    <span className="text-xs" style={{ color: 'rgba(244,244,242,0.40)' }}>{post.readTime}</span>
                  </div>
                  <h3 className="font-bold leading-snug mb-3" style={{ color: '#f4f4f2' }}>{post.title}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(244,244,242,0.55)' }}>{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(201,168,78,0.10)' }}>
                    <div className="text-xs" style={{ color: 'rgba(244,244,242,0.40)' }}>{post.author} · {post.date}</div>
                    <ChevronRight className="w-4 h-4 group-hover:text-[#c9a84e] transition-colors" style={{ color: 'rgba(201,168,78,0.50)' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Boat Reviews ── */}
      {boatPosts.length > 0 && (
        <section
          className="section"
          style={{ borderTop: '1px solid rgba(201,168,78,0.15)' }}
        >
          <div className="container">
            <div className="mb-10">
              <p className="eyebrow mb-4">Fleet Reviews</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#f4f4f2' }}>
                Complete Marbella Fleet Reviews
              </h2>
              <p className="text-base max-w-2xl" style={{ color: 'rgba(244,244,242,0.58)' }}>
                In-depth reviews of every boat in our Marbella fleet — specs, prices, itineraries, and honest assessments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {boatPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden flex flex-col transition-all duration-250 block"
                  style={{
                    background: '#0c1828',
                    border: '1px solid rgba(201,168,78,0.18)',
                    borderRadius: '14px',
                  }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', background: '#0a1420' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.heroImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="eyebrow" style={{ fontSize: '0.6rem' }}>Boat review</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3
                      className="font-bold leading-snug mb-2 text-sm"
                      style={{ color: '#f4f4f2' }}
                    >
                      {post.title}
                    </h3>
                    <p
                      className="text-xs leading-relaxed flex-1 mb-4"
                      style={{
                        color: 'rgba(244,244,242,0.55)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.excerpt}
                    </p>
                    <div
                      className="text-xs font-semibold flex items-center gap-1 group-hover:text-[#f4f4f2] transition-colors"
                      style={{ color: '#c9a84e' }}
                    >
                      Read review <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 3: CTA strip ── */}
      <section
        className="section-sm"
        style={{ borderTop: '1px solid rgba(201,168,78,0.15)' }}
      >
        <div className="container text-center">
          <p className="text-base mb-5" style={{ color: 'rgba(244,244,242,0.60)' }}>
            Ready to stop reading and start sailing?
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-full transition-all"
            style={{ background: '#c9a84e', color: '#07101e', boxShadow: '0 8px 24px rgba(201,168,78,0.22)' }}
          >
            Browse available boats <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  )
}
