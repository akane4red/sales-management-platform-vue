<template>
  <v-btn icon @click="toggleTheme">
    <svg-icon :path="isDarkTheme ? mdiWhiteBalanceSunny : mdiMoonWaxingCrescent" type="mdi" />
  </v-btn>
</template>

<script setup>
  import { useTheme } from 'vuetify'
  import SvgIcon from '@jamescoyle/vue-icon'
  import { mdiMoonWaxingCrescent, mdiWhiteBalanceSunny } from '@mdi/js'

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      theme.global.name.value = savedTheme
      isDarkTheme.value = savedTheme === 'dark'
    } else {
      theme.global.name.value = 'light'
      isDarkTheme.value = false
    }
  })

  const theme = useTheme()
  const isDarkTheme = ref(theme.global.name.value === 'dark')
  const toggleTheme = () => {
    const newTheme = theme.global.current.value.dark ? 'light' : 'dark'
    theme.global.name.value = newTheme
    isDarkTheme.value = newTheme === 'dark'
    localStorage.setItem('theme', newTheme)
  }
</script>
