import React from 'react'

export function JsonLd({ name, avg, count }: { name: string; avg: number | null; count: number }) {
  const data: any = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name,
  }
  if (avg != null) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(avg),
      reviewCount: String(count),
    }
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
