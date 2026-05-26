import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { getPost, POSTS } from '@/lib/blog/posts'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
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
  const post = getPost(slug)
  if (!post) notFound()

  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2)

  return (
    <div style={{ background: '#07101e', color: '#f4f4f2' }}>

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
