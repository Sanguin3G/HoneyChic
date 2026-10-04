<script setup lang="ts">
import { useForm, usePage } from '@inertiajs/vue3'
import HcPanel from '~/app/design/HcPanel.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcInput from '~/app/design/HcInput.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
interface Coupon {
  id: number
  code: string
  kind: 'fixed' | 'percentage'
  currency: string
  value: number
  minimumMinor: number
  startsAt: string | null
  endsAt: string | null
  usageLimit: number | null
  uses: number
  isActive: boolean
}
defineProps<{ coupons: Coupon[] }>()
const page = usePage<SharedProps>()
const { t } = useI18n()
const defaults = () => ({
  id: undefined as number | undefined,
  code: '',
  kind: 'fixed' as 'fixed' | 'percentage',
  currency: page.props.store.currency,
  value: 1,
  minimumMinor: 0,
  startsAt: '',
  endsAt: '',
  usageLimit: null as number | null,
  isActive: true,
  module: '',
})
const form = useForm(defaults())
function edit(coupon: Coupon) {
  Object.assign(form, {
    ...coupon,
    startsAt: coupon.startsAt?.slice(0, 16) ?? '',
    endsAt: coupon.endsAt?.slice(0, 16) ?? '',
  })
}
function save() {
  form
    .transform((data) => ({
      ...data,
      usageLimit:
        data.usageLimit === null || String(data.usageLimit) === '' ? null : data.usageLimit,
      startsAt: data.startsAt || null,
      endsAt: data.endsAt || null,
    }))
    .post('/admin/module-configuration/coupons')
}
</script>
<template>
  <HcPanel
    ><h2>{{ t('modules', 'coupons') }}</h2>
    <p class="hc-help">{{ t('modules', 'couponValueHelp') }}</p>
    <ul>
      <li v-for="coupon in coupons" :key="coupon.id">
        {{ coupon.code }} · {{ coupon.uses }}/{{ coupon.usageLimit ?? '∞' }} ·
        {{ t('modules', coupon.isActive ? 'active' : 'inactive') }}
        <HcButton v-if="page.props.permissions.manageStore" variant="quiet" @click="edit(coupon)">{{
          t('admin', 'edit')
        }}</HcButton>
      </li>
    </ul>
    <form v-if="page.props.permissions.manageStore" class="hc-form" @submit.prevent="save">
      <HcInput
        id="coupon-admin-code"
        v-model="form.code"
        :label="t('modules', 'couponCode')"
        required
        maxlength="40"
      />
      <label class="hc-field"
        >{{ t('modules', 'kind')
        }}<select v-model="form.kind" class="hc-input">
          <option value="fixed">{{ t('modules', 'fixed') }}</option>
          <option value="percentage">{{ t('modules', 'percentage') }}</option>
        </select></label
      >
      <HcInput
        id="coupon-currency"
        v-model="form.currency"
        :label="t('settings', 'currency')"
        required
        maxlength="3"
      />
      <HcInput
        id="coupon-value"
        v-model="form.value"
        type="number"
        :label="t('modules', 'value')"
        min="1"
        step="1"
        required
      />
      <HcInput
        id="coupon-minimum"
        v-model="form.minimumMinor"
        type="number"
        :label="t('modules', 'minimumMinor')"
        min="0"
        step="1"
        required
      />
      <HcInput
        id="coupon-start"
        v-model="form.startsAt"
        type="datetime-local"
        :label="t('modules', 'startsAt')"
      />
      <HcInput
        id="coupon-end"
        v-model="form.endsAt"
        type="datetime-local"
        :label="t('modules', 'endsAt')"
      />
      <HcInput
        id="coupon-limit"
        v-model="form.usageLimit"
        type="number"
        :label="t('modules', 'usageLimit')"
        min="1"
        step="1"
      />
      <label class="hc-check"
        ><input v-model="form.isActive" type="checkbox" />{{ t('modules', 'active') }}</label
      >
      <p v-for="(error, key) in form.errors" :key="key" class="hc-error" role="alert">
        {{ error }}
      </p>
      <div class="hc-actions">
        <HcButton type="submit" :disabled="form.processing">{{ t('admin', 'save') }}</HcButton
        ><HcButton variant="quiet" @click="Object.assign(form, defaults())">{{
          t('modules', 'new')
        }}</HcButton>
      </div>
    </form>
  </HcPanel>
</template>
