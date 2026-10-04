import { Bouncer } from '@adonisjs/bouncer'
import type User from '#domains/customers/models/user'

export const accessAdmin = Bouncer.ability((user: User) => ['owner', 'staff'].includes(user.role))
export const manageStore = Bouncer.ability((user: User) => user.role === 'owner')
