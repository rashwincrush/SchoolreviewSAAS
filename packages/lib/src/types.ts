export type TenantSummary = { id: string; name: string; slug: string; review_count: number; avg_rating: number | null }
export type PublicReview = { id: string; rating: number; title: string | null; body: string | null; created_at: string }
