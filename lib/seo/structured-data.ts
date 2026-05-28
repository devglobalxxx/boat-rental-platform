const BASE_URL = 'https://boathire24.com'
const ORG_NAME = 'BoatHire24'

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface BoatJsonLdInput {
  slug: string
  name: string
  description: string | null
  tagline: string | null
  type: string
  length_m: number | null
  capacity_pax: number
  departure_port: string | null
  includes_skipper: boolean
  includes_fuel: boolean
  includes_drinks: boolean
  /** Hero image absolute URL */
  imageUrl?: string | null
  /** Lowest price in EUR */
  lowestPrice?: number | null
  /** Currency code e.g. "EUR" */
  currency?: string
  avg_rating?: number
  review_count?: number
  /** Array of tag strings */
  tags?: string[]
}

export interface ImageJsonLdInput {
  /** slug for the gallery image page */
  slug: string
  title: string | null
  description: string | null
  /** Absolute URL to the image asset */
  storageUrl: string
  tags?: string[]
}

export interface BoatBasic {
  slug: string
  name: string
  type: string
}

export interface LocationJsonLdInput {
  slug: string
  name: string
  city: string
  country: string
  description: string | null
  imageUrl?: string | null
  boats?: Array<{ slug: string; name: string }>
}

// ─── boatJsonLd ───────────────────────────────────────────────────────────────

/**
 * Returns a JSON-LD object combining Product + Service + Offer schemas
 * for a boat listing page.
 */
export function boatJsonLd(boat: BoatJsonLdInput): object {
  const url = `${BASE_URL}/boats/${boat.slug}`
  const currency = boat.currency ?? 'EUR'

  const includes: string[] = []
  if (boat.includes_skipper) includes.push('Licensed skipper')
  if (boat.includes_fuel) includes.push('Fuel')
  if (boat.includes_drinks) includes.push('Drinks')

  const description =
    boat.description ??
    `${boat.name} — ${boat.type.replace('_', ' ')} charter in Marbella, Spain. Capacity: ${boat.capacity_pax} guests.${includes.length ? ` Includes: ${includes.join(', ')}.` : ''}`

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Service'],
    name: boat.name,
    description,
    url,
    ...(boat.imageUrl ? { image: boat.imageUrl } : {}),
    brand: {
      '@type': 'Brand',
      name: ORG_NAME,
    },
    provider: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: BASE_URL,
    },
    areaServed: {
      '@type': 'Place',
      name: 'Marbella, Spain',
      address: {
        '@type': 'PostalAddress',
        addressLocality: boat.departure_port ?? 'Puerto Banús',
        addressRegion: 'Andalusia',
        addressCountry: 'ES',
      },
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Vessel type',
        value: boat.type.replace('_', ' '),
      },
      {
        '@type': 'PropertyValue',
        name: 'Maximum guests',
        value: String(boat.capacity_pax),
      },
      ...(boat.length_m
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Length',
              value: `${boat.length_m}m`,
            },
          ]
        : []),
    ],
    ...(boat.tags?.length
      ? { keywords: boat.tags.join(', ') }
      : {}),
  }

  // Offer block
  if (boat.lowestPrice != null) {
    jsonLd['offers'] = {
      '@type': 'Offer',
      price: boat.lowestPrice,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url,
      seller: {
        '@type': 'Organization',
        name: ORG_NAME,
      },
      ...(includes.length
        ? { description: `Includes: ${includes.join(', ')}` }
        : {}),
    }
  }

  // AggregateRating block
  if (boat.review_count && boat.review_count > 0 && boat.avg_rating != null) {
    jsonLd['aggregateRating'] = {
      '@type': 'AggregateRating',
      ratingValue: boat.avg_rating.toFixed(1),
      reviewCount: boat.review_count,
      bestRating: '5',
      worstRating: '1',
    }
  }

  return jsonLd
}

// ─── imageJsonLd ──────────────────────────────────────────────────────────────

/**
 * Returns a JSON-LD ImageObject for a gallery image page.
 */
export function imageJsonLd(image: ImageJsonLdInput, boat: BoatBasic): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: image.title ?? `${boat.name} — boat photo`,
    description:
      image.description ??
      `Photo of ${boat.name}, a ${boat.type.replace('_', ' ')} available for charter in Marbella via BoatHire24.`,
    contentUrl: image.storageUrl,
    url: `${BASE_URL}/gallery/${image.slug}`,
    ...(image.tags?.length ? { keywords: image.tags.join(', ') } : {}),
    isPartOf: {
      '@type': 'WebPage',
      url: `${BASE_URL}/boats/${boat.slug}`,
      name: boat.name,
    },
    creator: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: BASE_URL,
    },
    license: `${BASE_URL}/terms`,
    acquireLicensePage: `${BASE_URL}/terms`,
  }
}

// ─── tagPageJsonLd ────────────────────────────────────────────────────────────

/**
 * Returns a JSON-LD ItemList for a tag browse page.
 */
export function tagPageJsonLd(tag: string, count: number): object {
  const label = tag
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${label} — Boat Charter`,
    description: `Browse ${count} boat${count !== 1 ? 's' : ''} tagged "${label}" available for charter in Marbella.`,
    url: `${BASE_URL}/tags/${tag}`,
    numberOfItems: count,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
  }
}

// ─── siteJsonLd ───────────────────────────────────────────────────────────────

/**
 * Returns combined WebSite + Organization JSON-LD for the homepage.
 */
export function siteJsonLd(): object {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: ORG_NAME,
      url: BASE_URL,
      description:
        'Find and book verified boats, yachts, catamarans, and sailing boats in Marbella, Spain. Licensed skippers, instant booking, secure payments.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: ORG_NAME,
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
      sameAs: [
        'https://www.instagram.com/boathire24',
        'https://www.facebook.com/boathire24',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        areaServed: 'ES',
        availableLanguage: ['English', 'Spanish'],
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Marbella',
        addressRegion: 'Andalusia',
        addressCountry: 'ES',
      },
    },
  ]
}

// ─── locationJsonLd ───────────────────────────────────────────────────────────

/**
 * Returns combined TouristAttraction + ItemList JSON-LD for a location page.
 */
export function locationJsonLd(location: LocationJsonLdInput): object {
  const url = `${BASE_URL}/${location.slug}`

  const attraction: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: `Boat Charter in ${location.city}`,
    description:
      location.description ??
      `Explore ${location.city}, ${location.country} by boat. Book motor yachts, catamarans, sailing boats and more with BoatHire24.`,
    url,
    ...(location.imageUrl ? { image: location.imageUrl } : {}),
    touristType: ['Leisure', 'Sports', 'Adventure'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.city,
      addressCountry: location.country,
    },
    provider: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: BASE_URL,
    },
  }

  const results: object[] = [attraction]

  if (location.boats && location.boats.length > 0) {
    results.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Boats available in ${location.city}`,
      url,
      numberOfItems: location.boats.length,
      itemListElement: location.boats.map((boat, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: boat.name,
        url: `${BASE_URL}/boats/${boat.slug}`,
      })),
    })
  }

  return results
}
