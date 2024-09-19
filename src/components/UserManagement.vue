<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>{{ isEditing ? "Update User" : "Create User" }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="userData.username"
            class="custom-text-field"
            label="Username"
            required
            :rules="[(v) => !!v || 'Username is required']"
          />
          <v-text-field
            v-if="!isEditing"
            v-model="userData.password"
            label="Password"
            required
            :rules="[(v) => !!v || 'Password is required']"
          />
          <v-select
            v-model="userData.role"
            :items="roles"
            label="Role"
            required
            :rules="[(v) => !!v || 'Role is required']"
          />
        </v-form>
        <v-alert v-if="error" class="mt-3" type="error">{{
          error
        }}</v-alert>
        <v-card-actions>
          <v-btn
            v-if="!isEditing"
            color="primary"
            :disabled="!valid"
            @click="createUser"
          >Create User</v-btn>
          <v-btn
            v-else
            color="primary"
            :disabled="!valid"
            @click="updateUser"
          >Update User</v-btn>
          <v-btn @click="closeDialog">Cancel</v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-container>
    <v-card>
      <v-data-table class="elevation-1" :headers="headers" :items="userEntries">
        <template #top>
          <v-toolbar flat>
            <v-toolbar-title>User List</v-toolbar-title>
            <v-spacer />
            <v-btn color="primary" @click="addUser">Add User</v-btn>
          </v-toolbar>
        </template>
        <template #item.actions="{ item }: { item: User }">
          <v-icon class="me-2" :disabled="item.username === username" size="small" @click="editUser(item)">
            mdi-pencil
          </v-icon>
          <v-icon :disabled="item.username === username" size="small" @click="deleteUser(item)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>
  </v-container>

  <v-alert v-if="alertMessage" dismissible type="error" @close="alertMessage = ''">
    {{ alertMessage }}
  </v-alert>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import bcrypt from 'bcryptjs'
  import axios from 'axios'

  interface User {
    id: number;
    username: string;
    password: string;
    role: string;
  }

  const userData: Ref<User> = ref({
    id: 0,
    username: '',
    password: '',
    role: '',
  })

  const dialog = ref(false)
  const isEditing = ref(false)
  const valid = ref(false)
  const roles = ['admin', 'user']
  const error = ref('')
  const alertMessage = ref('')
  const username = ref(localStorage.getItem('username') || '')

  const headers = [
    { title: 'Username', key: 'username' },
    { title: 'Role', key: 'role' },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' as 'end' },
  ]

  const userEntries = ref([])

  const addUser = () => {
    resetForm()
    dialog.value = true
    isEditing.value = false
  }

  const createUser = async () => {
    const isDuplicate = userEntries.value.some((user: User) => user.username === userData.value.username)
    if (isDuplicate) {
      error.value = 'Username already exists. Please choose a different username.'
      return
    }

    const hashedPassword = await bcrypt.hash(userData.value.password, 10)
    const newUser = { ...userData.value, password: hashedPassword }
    await axios.post('http://localhost:5000/users', newUser)
    fetchUsers()
    closeDialog()
  }

  const updateUser = async () => {
    const updatedUser = { ...userData.value }
    await axios.put(`http://localhost:5000/users/${userData.value.id}`, updatedUser)
    fetchUsers()
    closeDialog()
  }

  const deleteUser = async (item: User) => {
    if (item.username === userData.value.username) {
      alertMessage.value = 'You cannot delete your own account.'
      return
    }

    await axios.delete(`http://localhost:5000/users/${item.id}`)
    fetchUsers()
  }

  const editUser = (item: User) => {
    dialog.value = true
    userData.value = { ...item }
    isEditing.value = true
  }

  const fetchUsers = async () => {
    const response = await axios.get('http://localhost:5000/users')
    userEntries.value = response.data
  }

  onMounted(() => {
    fetchUsers()
  })

  const closeDialog = () => {
    dialog.value = false
  }

  const resetForm = () => {
    userData.value = {
      id: 0,
      username: '',
      password: '',
      role: '',
    }
    isEditing.value = false
  }
</script>

<style scoped>
</style>
