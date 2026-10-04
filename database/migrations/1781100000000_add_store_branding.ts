import { BaseSchema } from '@adonisjs/lucid/schema'

const uploadKey =
  '^uploads/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(jpg|jpeg|png|webp|avif)$'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('store_settings', (table) => {
      table.string('logo_key', 80).nullable()
      table.string('favicon_key', 80).nullable()
      table.string('website', 300).nullable()
      table.string('facebook', 300).nullable()
      table.string('instagram', 300).nullable()
      table.string('youtube', 300).nullable()
      table.string('tiktok', 300).nullable()
      table.string('primary_color', 7).nullable()
      table.string('accent_color', 7).nullable()
    })

    // Knex invents a broken constraint name when a check contains quotes.
    const rules = [
      ['store_settings_logo_key_format', `logo_key IS NULL OR logo_key ~* '${uploadKey}'`],
      ['store_settings_favicon_key_format', `favicon_key IS NULL OR favicon_key ~* '${uploadKey}'`],
      ['store_settings_website_https', `website IS NULL OR website ~ '^https://[^[:space:]]+$'`],
      ['store_settings_facebook_https', `facebook IS NULL OR facebook ~ '^https://[^[:space:]]+$'`],
      [
        'store_settings_instagram_https',
        `instagram IS NULL OR instagram ~ '^https://[^[:space:]]+$'`,
      ],
      ['store_settings_youtube_https', `youtube IS NULL OR youtube ~ '^https://[^[:space:]]+$'`],
      ['store_settings_tiktok_https', `tiktok IS NULL OR tiktok ~ '^https://[^[:space:]]+$'`],
      [
        'store_settings_primary_color_format',
        `primary_color IS NULL OR primary_color ~ '^#[0-9a-f]{6}$'`,
      ],
      [
        'store_settings_accent_color_format',
        `accent_color IS NULL OR accent_color ~ '^#[0-9a-f]{6}$'`,
      ],
    ] as const
    for (const [name, expression] of rules) {
      this.schema.raw(`alter table store_settings add constraint ${name} check (${expression})`)
    }
  }

  async down() {
    this.schema.alterTable('store_settings', (table) => {
      table.dropColumns(
        'logo_key',
        'favicon_key',
        'website',
        'facebook',
        'instagram',
        'youtube',
        'tiktok',
        'primary_color',
        'accent_color'
      )
    })
  }
}
