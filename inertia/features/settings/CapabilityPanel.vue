<script setup lang="ts">
import { usePage } from '@inertiajs/vue3'
import HcPanel from '~/app/design/HcPanel.vue'
import { useI18n, type SharedProps } from '~/app/shared/i18n'
const page = usePage<SharedProps>()
const { t } = useI18n()
</script>

<template>
  <HcPanel>
    <h2>{{ t('capabilities', 'title') }}</h2>
    <p class="hc-help">{{ t('capabilities', 'help') }}</p>
    <div class="table-scroll">
      <table class="hc-table">
        <thead>
          <tr>
            <th scope="col">{{ t('capabilities', 'feature') }}</th>
            <th v-for="state in ['installed', 'enabled', 'configured']" :key="state" scope="col">
              {{ t('capabilities', state) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(capability, name) in page.props.capabilities" :key="name">
            <th scope="row">{{ t('capabilities', String(name)) }}</th>
            <td v-for="state in ['installed', 'enabled', 'configured'] as const" :key="state">
              <span :class="capability[state] ? 'state-yes' : 'state-no'">
                {{ t('capabilities', capability[state] ? 'yes' : 'no') }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </HcPanel>
</template>
