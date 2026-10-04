import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'
import type { InferMailers } from '@adonisjs/mail/types'

const username = env.get('SMTP_USERNAME')
const password = env.get('SMTP_PASSWORD')

const mailConfig = defineConfig({
  default: 'smtp',
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST') || '127.0.0.1',
      port: env.get('SMTP_PORT') || 1025,
      ...(username
        ? { auth: { type: 'login' as const, user: username, pass: password?.release() ?? '' } }
        : {}),
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
