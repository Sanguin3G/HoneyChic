import vine from '@vinejs/vine'
import { maximumCartQuantity, maximumVariantId } from '#domains/cart/data/cart_state'
const quantity = () => vine.number().withoutDecimals().min(1).max(maximumCartQuantity)
const variantId = () => vine.number().withoutDecimals().min(1).max(maximumVariantId)
export const addCartValidator = vine.create({ variantId: variantId(), quantity: quantity() })
export const updateCartValidator = vine.create({ quantity: quantity() })
export const cartVariantValidator = vine.create({ id: variantId() })
