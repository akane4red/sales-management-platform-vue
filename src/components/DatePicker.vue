<template>
  <v-menu v-model="isMenuOpen" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-text-field
        v-bind="props"
        hide-details
        :label="label"
        :model-value="formattedDate"
        readonly
        variant="solo"
      />
    </template>
    <v-date-picker v-model="selectedDate" :color="color" hide-actions title="">
      <template #header />
    </v-date-picker>
  </v-menu>
</template>

<script setup>
  import { computed, defineEmits, defineProps, ref, watch } from 'vue'

  const { label, color, modelValue } = defineProps([
    'label',
    'color',
    'modelValue',
  ])
  const emit = defineEmits('update:modelValue')

  const isMenuOpen = ref(false)
  const selectedDate = ref(modelValue)

  const formattedDate = computed(() => {
    return selectedDate.value ? selectedDate.value.toLocaleDateString('en') : ''
  })

  watch(() => modelValue, newDate => {
    selectedDate.value = newDate
  })

  watch(selectedDate, newDate => {
    emit('update:modelValue', newDate)
  })
</script>
<style>
.v-overlay__content:has(> .v-date-picker) {
  min-width: auto !important;
}
.v-picker-title {
  padding: 0 !important;
}
</style>
