import { BaseSeeder } from '@adonisjs/lucid/seeders'
import app from '@adonisjs/core/services/app'
import Category from '#domains/catalog/models/category'
import Product from '#domains/catalog/models/product'
import StoreSeeder from '#database/seeders/store_seeder'
import StoreSetting from '#core/store/store_setting'
import CreateProduct from '#domains/catalog/actions/create_product'
import { demoProducts } from '#database/data/demo_catalog'

export default class CatalogSeeder extends BaseSeeder {
  static environment = ['development']

  async run() {
    if (!app.inDev) return
    await new StoreSeeder(this.client).run()
    const store = await StoreSetting.findOrFail(1)
    for (const demo of demoProducts) {
      const category = await Category.firstOrCreate(
        { slug: demo.categorySlug },
        {
          name: demo.category,
          description: '',
          isActive: true,
        }
      )
      // Never overwrite merchant changes when the development seeder is re-run.
      if (await Product.findBy('slug', demo.slug)) continue
      await new CreateProduct().execute(
        {
          name: demo.name,
          slug: demo.slug,
          description: demo.description,
          status: 'published',
          categoryId: category.id,
          options: demo.options,
          variants: demo.variants.map((variant) => ({
            sku: variant.sku,
            selections: variant.selections,
            price: store.currency === 'VND' ? variant.vnd : variant.other,
          })),
          images: demo.images.map((image, position) => ({
            storageKey: 'catalog/' + image,
            altText: demo.name + ' — placeholder photo',
            isPrimary: position === 0,
          })),
        },
        store.currency,
        'en'
      )
    }
  }
}
