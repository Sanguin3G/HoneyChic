import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import SaveReview from '#modules/reviews/save_review'
const validator = vine.create({
  slug: vine.string().trim().minLength(1).maxLength(200),
  rating: vine.number().withoutDecimals().min(1).max(5),
  body: vine.string().trim().minLength(1).maxLength(2000),
})
export default class ReviewsController {
  async store(ctx: HttpContext) {
    const input = await ctx.request.validateUsing(validator)
    await new SaveReview().execute(
      ctx.auth.getUserOrFail().id,
      input.slug,
      { rating: input.rating, body: input.body },
      ctx.locale
    )
    ctx.session.flash('notice', 'modules.reviewSaved')
    return ctx.response.redirect().toPath('/products/' + encodeURIComponent(input.slug))
  }
}
