/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import { VineDate } from '@vinejs/vine'
import { RequestValidator } from '@adonisjs/core/http'
import { validationMessages } from '#core/support/validation_messages'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

/**
 * Every request validation uses the request locale's messages, so controllers
 * call `ctx.request.validateUsing(validator)` without repeating a provider.
 */
RequestValidator.messagesProvider = (ctx) => validationMessages(ctx.locale ?? 'en')
