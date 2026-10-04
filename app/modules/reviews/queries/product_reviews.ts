import Review from '#modules/reviews/models/review'
export async function productReviews(productId: number, customerId?: number) {
  const rows = await Review.query().where('productId', productId).orderBy('id', 'desc').limit(20)
  const mine = customerId
    ? await Review.query().where('productId', productId).where('customerId', customerId).first()
    : null
  return {
    rows: rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      body: row.body,
      createdAt: row.createdAt.toISO(),
    })),
    mine: mine ? { rating: mine.rating, body: mine.body } : null,
  }
}
