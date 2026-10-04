<script setup lang="ts">
import { useForm, usePage } from '@inertiajs/vue3'
import HcPanel from '~/app/design/HcPanel.vue'
import HcButton from '~/app/design/HcButton.vue'
import HcInput from '~/app/design/HcInput.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
interface Rate {
  id: number
  name: string
  kind: 'pickup' | 'flat'
  currency: string
  amountMinor: number
  freeAboveMinor: number | null
  countries: string[]
  isActive: boolean
}
defineProps<{ rates: Rate[] }>()
const page = usePage<SharedProps>()
const { t } = useI18n()
const defaults = () => ({
  id: undefined as number | undefined,
  name: '',
  kind: 'flat' as 'pickup' | 'flat',
  currency: page.props.store.currency,
  amountMinor: 0,
  freeAboveMinor: null as number | null,
  countries: '',
  isActive: true,
  module: '',
})
const form = useForm(defaults())
function edit(rate: Rate) {
  Object.assign(form, { ...rate, countries: rate.countries.join(', ') })
}
function save() {
  form
    .transform((data) => ({
      ...data,
      freeAboveMinor:
        data.freeAboveMinor === null || String(data.freeAboveMinor) === ''
          ? null
          : data.freeAboveMinor,
      countries: data.countries
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    }))
    .post('/admin/module-configuration/shipping')
}
</script>
<template>
  <HcPanel
    ><h2>{{ t('modules', 'shipping') }}</h2>
    <p class="hc-help">{{ t('modules', 'minorUnitsHelp') }}</p>
    <ul>
      <li v-for="rate in rates" :key="rate.id">
        {{ rate.name }} · {{ rate.currency }} · {{ rate.amountMinor }} ·
        {{ t('modules', rate.isActive ? 'active' : 'inactive') }}
        <HcButton v-if="page.props.permissions.manageStore" variant="quiet" @click="edit(rate)">{{
          t('admin', 'edit')
        }}</HcButton>
      </li>
    </ul>
    <form v-if="page.props.permissions.manageStore" class="hc-form" @submit.prevent="save">
      <HcInput
        id="rate-name"
        v-model="form.name"
        :label="t('modules', 'name')"
        required
        maxlength="120"
      />
      <label class="hc-field"
        >{{ t('modules', 'kind')
        }}<select v-model="form.kind" class="hc-input">
          <option value="pickup">{{ t('modules', 'pickup') }}</option>
          <option value="flat">{{ t('modules', 'flat') }}</option>
        </select></label
      >
      <HcInput
        id="rate-currency"
        v-model="form.currency"
        :label="t('settings', 'currency')"
        required
        maxlength="3"
      />
      <HcInput
        id="rate-amount"
        v-model="form.amountMinor"
        type="number"
        :label="t('modules', 'amountMinor')"
        min="0"
        step="1"
        required
      />
      <HcInput
        id="rate-free"
        v-model="form.freeAboveMinor"
        type="number"
        :label="t('modules', 'freeAboveMinor')"
        min="0"
        step="1"
      />
      <HcInput id="rate-countries" v-model="form.countries" :label="t('modules', 'countries')" />
      <p class="hc-help">{{ t('modules', 'zonesHelp') }}</p>
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
