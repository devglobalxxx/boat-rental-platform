// Country list for the "List your boat" location picker. Each entry carries the
// ISO country_code plus an approximate centroid (lat/lng) so a host-typed city
// can be saved into the NOT-NULL locations table without a geocoding round-trip.

export interface Country { name: string; code: string; lat: number; lng: number }

export const COUNTRIES: Country[] = [
  { name: 'Spain', code: 'ES', lat: 40.46, lng: -3.75 },
  { name: 'Portugal', code: 'PT', lat: 39.40, lng: -8.22 },
  { name: 'France', code: 'FR', lat: 46.23, lng: 2.21 },
  { name: 'Monaco', code: 'MC', lat: 43.74, lng: 7.42 },
  { name: 'Italy', code: 'IT', lat: 41.87, lng: 12.57 },
  { name: 'Malta', code: 'MT', lat: 35.94, lng: 14.38 },
  { name: 'Croatia', code: 'HR', lat: 45.10, lng: 15.20 },
  { name: 'Montenegro', code: 'ME', lat: 42.71, lng: 19.37 },
  { name: 'Greece', code: 'GR', lat: 39.07, lng: 21.82 },
  { name: 'Cyprus', code: 'CY', lat: 35.13, lng: 33.43 },
  { name: 'Turkey', code: 'TR', lat: 38.96, lng: 35.24 },
  { name: 'United Arab Emirates', code: 'AE', lat: 23.42, lng: 53.85 },
  { name: 'Qatar', code: 'QA', lat: 25.35, lng: 51.18 },
  { name: 'Bahrain', code: 'BH', lat: 26.07, lng: 50.56 },
  { name: 'Oman', code: 'OM', lat: 21.51, lng: 55.92 },
  { name: 'United Kingdom', code: 'GB', lat: 55.38, lng: -3.44 },
  { name: 'Ireland', code: 'IE', lat: 53.41, lng: -8.24 },
  { name: 'Netherlands', code: 'NL', lat: 52.13, lng: 5.29 },
  { name: 'Germany', code: 'DE', lat: 51.17, lng: 10.45 },
  { name: 'Denmark', code: 'DK', lat: 56.26, lng: 9.50 },
  { name: 'Sweden', code: 'SE', lat: 60.13, lng: 18.64 },
  { name: 'Norway', code: 'NO', lat: 60.47, lng: 8.47 },
  { name: 'United States', code: 'US', lat: 37.09, lng: -95.71 },
  { name: 'Mexico', code: 'MX', lat: 23.63, lng: -102.55 },
  { name: 'Bahamas', code: 'BS', lat: 25.03, lng: -77.40 },
  { name: 'British Virgin Islands', code: 'VG', lat: 18.42, lng: -64.64 },
  { name: 'Antigua and Barbuda', code: 'AG', lat: 17.06, lng: -61.80 },
  { name: 'St Lucia', code: 'LC', lat: 13.91, lng: -60.98 },
  { name: 'Barbados', code: 'BB', lat: 13.19, lng: -59.54 },
  { name: 'Dominican Republic', code: 'DO', lat: 18.74, lng: -70.16 },
  { name: 'Colombia', code: 'CO', lat: 4.57, lng: -74.30 },
  { name: 'Brazil', code: 'BR', lat: -14.24, lng: -51.93 },
  { name: 'South Africa', code: 'ZA', lat: -30.56, lng: 22.94 },
  { name: 'Mauritius', code: 'MU', lat: -20.35, lng: 57.55 },
  { name: 'Seychelles', code: 'SC', lat: -4.68, lng: 55.49 },
  { name: 'Egypt', code: 'EG', lat: 26.82, lng: 30.80 },
  { name: 'Maldives', code: 'MV', lat: 3.20, lng: 73.22 },
  { name: 'Thailand', code: 'TH', lat: 15.87, lng: 100.99 },
  { name: 'Malaysia', code: 'MY', lat: 4.21, lng: 101.98 },
  { name: 'Singapore', code: 'SG', lat: 1.35, lng: 103.82 },
  { name: 'Indonesia', code: 'ID', lat: -0.79, lng: 113.92 },
  { name: 'Philippines', code: 'PH', lat: 12.88, lng: 121.77 },
  { name: 'Vietnam', code: 'VN', lat: 14.06, lng: 108.28 },
  { name: 'Hong Kong', code: 'HK', lat: 22.32, lng: 114.17 },
  { name: 'Japan', code: 'JP', lat: 36.20, lng: 138.25 },
  { name: 'Australia', code: 'AU', lat: -25.27, lng: 133.78 },
  { name: 'New Zealand', code: 'NZ', lat: -40.90, lng: 174.89 },
  { name: 'Fiji', code: 'FJ', lat: -17.71, lng: 178.07 },
  { name: 'French Polynesia', code: 'PF', lat: -17.68, lng: -149.41 },
]

export function findCountry(name: string): Country | undefined {
  const n = (name || '').trim().toLowerCase()
  return COUNTRIES.find((c) => c.name.toLowerCase() === n)
}
