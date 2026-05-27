import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { getAllPost, getAllPostSlugs, POSTS } from '@/lib/blog/posts'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getAllPost(slug)
  if (!post) return { title: 'Article not found' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.heroImage }],
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getAllPost(slug)
  if (!post) notFound()

  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.heroImage,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.authorRole,
    },
  }

  const faqJsonLd = post.faqs && post.faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      }
    : null

  return (
    <div style={{ background: '#07101e', color: '#f4f4f2' }}>

      {/* JSON-LD: Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* JSON-LD: FAQPage (only when faqs exist) */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Hero */}
      <div className="relative" style={{ height: '420px', background: '#0a1420' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.heroImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(7,16,30,0.30) 0%, rgba(7,16,30,0.85) 75%, #07101e 100%)' }}
        />
        <div className="relative z-10 container h-full flex flex-col justify-end pb-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors hover:text-[#c9a84e]"
            style={{ color: 'rgba(244,244,242,0.55)' }}
          >
            <ChevronLeft className="w-4 h-4" /> All articles
          </Link>
          <span className="eyebrow mb-4 w-fit">{post.tag}</span>
          <h1 className="text-3xl md:text-4xl font-bold leading-snug max-w-3xl" style={{ color: '#f4f4f2' }}>
            {post.title}
          </h1>
        </div>
      </div>

      {/* Meta bar */}
      <div
        className="sticky top-16 z-40"
        style={{
          background: 'rgba(7,16,30,0.94)',
          borderBottom: '1px solid rgba(201,168,78,0.12)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="container py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5 text-sm" style={{ color: 'rgba(244,244,242,0.55)' }}>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTime}</span>
            <span style={{ color: 'rgba(244,244,242,0.35)' }}>{post.date}</span>
          </div>
          <Link
            href="/search"
            className="text-xs font-semibold px-4 py-2 rounded-full transition-all"
            style={{ background: '#c9a84e', color: '#07101e' }}
          >
            Book a charter →
          </Link>
        </div>
      </div>

      {/* Article body */}
      <div className="container py-14">
        <div className="max-w-2xl mx-auto">

          {/* Excerpt lead */}
          <p
            className="text-xl leading-relaxed mb-10 pb-10"
            style={{ color: 'rgba(244,244,242,0.72)', borderBottom: '1px solid rgba(201,168,78,0.15)' }}
          >
            {post.excerpt}
          </p>

          {/* Content */}
          <div
            className="prose-dark"
            style={{ color: 'rgba(244,244,242,0.72)' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Boat-specific CTA (only when boatSlug is set) */}
          {post.boatSlug && (
            <div
              className="my-10 p-6 rounded-2xl flex items-center justify-between gap-6"
              style={{
                background: 'linear-gradient(135deg, #0e1e35 0%, #0c1828 100%)',
                border: '1px solid rgba(201,168,78,0.30)',
              }}
            >
              <div>
                <p className="font-bold text-base" style={{ color: '#f4f4f2' }}>Ready to book this charter?</p>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(244,244,242,0.55)' }}>Check live availability and instant pricing</p>
              </div>
              <Link
                href={`/boats/${post.boatSlug}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap"
                style={{ background: '#c9a84e', color: '#07101e' }}
              >
                View boat &amp; book →
              </Link>
            </div>
          )}

          {/* FAQ section (only when faqs exist) */}
          {post.faqs && post.faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#f4f4f2' }}>Frequently Asked Questions</h2>
              <div className="space-y-4">
                {post.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-xl p-5"
                    style={{ background: '#0c1828', border: '1px solid rgba(201,168,78,0.15)' }}
                  >
                    <summary
                      className="font-semibold cursor-pointer list-none flex justify-between items-center"
                      style={{ color: '#f4f4f2' }}
                    >
                      {faq.q}
                      <span className="ml-4 text-[#c9a84e] group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(244,244,242,0.65)' }}>{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Author card */}
          <div
            className="mt-14 p-6 flex items-center gap-5"
            style={{
              background: '#0c1828',
              border: '1px solid rgba(201,168,78,0.18)',
              borderRadius: '14px',
            }}
          >
            <div
              className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-xl font-bold"
              style={{ background: 'rgba(201,168,78,0.15)', color: '#c9a84e' }}
            >
              {post.author[0]}
            </div>
            <div>
              <div className="font-semibold" style={{ color: '#f4f4f2' }}>{post.author}</div>
              <div className="text-sm" style={{ color: 'rgba(244,244,242,0.50)' }}>{post.authorRole}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section
          className="section-sm"
          style={{ borderTop: '1px solid rgba(201,168,78,0.12)' }}
        >
          <div className="container">
            <h2 className="text-2xl font-bold mb-8" style={{ color: '#f4f4f2' }}>Related articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex gap-4 p-5 transition-all"
                  style={{
                    background: '#0c1828',
                    border: '1px solid rgba(201,168,78,0.18)',
                    borderRadius: '14px',
                  }}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ background: '#0a1420' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.heroImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#c9a84e' }}>{p.tag}</span>
                    <h3 className="font-bold text-sm leading-snug mt-1 group-hover:text-[#c9a84e] transition-colors" style={{ color: '#f4f4f2' }}>{p.title}</h3>
                    <div className="text-xs mt-2 flex items-center gap-1 group-hover:text-[#f4f4f2] transition-colors" style={{ color: 'rgba(201,168,78,0.60)' }}>
                      Read <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
