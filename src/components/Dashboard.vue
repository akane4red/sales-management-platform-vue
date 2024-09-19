<template>
  <v-container>
    <v-card class="mt-4">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>{{ capitalizedUserRole }} Dashboard</v-toolbar-title>
        <v-spacer />
        {{ username }}
        <ThemeToggleButton />
        <v-btn icon @click="logout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </v-toolbar>
      <v-tabs v-if="isAdmin" v-model="tab">
        <v-tab value="sales">Sales Data</v-tab>
        <v-tab value="users">Manage Users</v-tab>
      </v-tabs>
      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="sales">
            <SalesDataForm />
          </v-tabs-window-item>
          <v-tabs-window-item value="users">
            <UserManagement />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import SalesDataForm from './SalesDataForm.vue'
  import UserManagement from './UserManagement.vue'
  const router = useRouter()
  const userRole = ref(localStorage.getItem('userRole') || '')
  const username = ref(localStorage.getItem('username') || '')
  const tab = ref('sales')

  const capitalizedUserRole = computed(() => {
    return userRole.value.charAt(0).toUpperCase() + userRole.value.slice(1)
  })

  const isAdmin = computed(() => userRole.value === 'admin') // Check if user is admin

  const logout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userRole')
    router.push('/')
  }
</script>

<style scoped></style>
