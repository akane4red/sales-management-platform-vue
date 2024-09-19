<template>
  <v-container class="centered-container" fill-height fluid>
    <v-row align="center" justify="center">
      <v-col align="center" cols="12">
        <v-card class="elevation-12" max-width="400px">
          <v-toolbar color="primary" rounded="0">
            <v-toolbar-title class="white--text text-left" justify="start">Login</v-toolbar-title>
            <v-spacer />
            <ThemeToggleButton />
            <v-tooltip
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  icon
                  v-bind="props"
                >
                  <v-icon>
                    mdi-information
                  </v-icon>
                </v-btn>
              </template>
              <span>admin for both username and password. <br> sales for both username and password</span>
            </v-tooltip>
          </v-toolbar>
          <v-card-text @keyup.enter="login">
            <v-form ref="form" @submit.prevent="login">
              <v-text-field
                v-model="username"
                dense
                label="Username"
                outlined
                required
              />
              <v-text-field
                v-model="password"
                dense
                label="Password"
                outlined
                required
                type="password"
              />
              <v-alert v-if="error" class="mt-3" type="error">{{
                error
              }}</v-alert>
              <v-btn
                class="mt-4"
                color="primary"
                @click="login"
              >Login</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import ThemeToggleButton from './ThemeToggleButton.vue'

  const username = ref('')
  const password = ref('')
  const error = ref('')
  const router = useRouter()

  const login = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username: username.value,
        password: password.value,
      })
      const role = response.data.role
      localStorage.isAuthenticated = true
      localStorage.setItem('userRole', role)
      localStorage.setItem('username', username.value)
      if (role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/sales')
      }
    } catch (err) {
      error.value = 'Invalid username or password'
      console.error(err)
    }
  }
</script>

<style scoped>
.centered-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
