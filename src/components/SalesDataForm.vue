<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>{{ isEditing ? "Update Entry" : "Create Entry" }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="salesData.customerName"
            class="custom-text-field"
            label="Customer Name"
            required
            :rules="[(v) => !!v || 'Customer Name is required']"
          />
          <v-text-field
            v-model="salesData.product"
            label="Product"
            required
            :rules="[(v) => !!v || 'Product is required']"
          />
          <v-text-field
            v-model="salesData.salesAmount"
            label="Sales Amount"
            :rules="[(v) => v >= 0 || 'Sales Amount must be a positive number']"
            step="1"
            type="number"
          />
          <v-menu offset-y transition="scale-transition">
            <template #activator="{ props }">
              <v-text-field
                v-model="formattedDate"
                v-bind="props"
                append-icon="mdi-calendar"
                label="Select a date"
                readonly
                required
                :rules="[(v) => !!v || 'Date is required']"
              />
            </template>
            <v-date-picker v-model="salesData.date" />
          </v-menu>
          <v-select
            v-model="salesData.country"
            :items="countries"
            label="Country"
            required
            :rules="[(v) => !!v || 'Country is required']"
          />
        </v-form>
        <v-card-actions>
          <v-btn
            v-if="!isEditing"
            color="primary"
            :disabled="!valid"
            @click="createEntry"
          >Add Entry</v-btn>
          <v-btn
            v-else
            color="primary"
            :disabled="!valid"
            @click="updateEntry"
          >Update Entry</v-btn>
          <v-btn @click="closeDialog">Cancel</v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-card-text>
    <v-data-table
      class="elevation-1"
      :headers="headers"
      item-key="customerName"
      :items="salesEntries"
      :search="search"
    >
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>Sales Entries</v-toolbar-title>
          <v-text-field
            v-model="search"
            density="compact"
            flat
            hide-details
            label="Search"
            prepend-inner-icon="mdi-magnify"
            single-line
            variant="solo-filled"
          />
          <v-spacer />
          <v-btn color="primary" @click="addEntry">
            Add Entry
          </v-btn>
        </v-toolbar>
      </template>
      <template #item.date="{ item }">
        {{ formatDate(item.date) }}
      </template>
      <template #item.actions="{ item }">
        <v-icon class="me-2" size="small" @click="editEntry(item)">
          mdi-pencil
        </v-icon>
        <v-icon size="small" @click="deleteEntry(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </v-card-text>
</template>

<script lang="ts" setup>
  import axios from 'axios'
  import { computed, onMounted, ref, watch } from 'vue'

  interface SalesEntry {
    id: number;
    customerName: string;
    product: string;
    salesAmount: number;
    date: Date;
    country: string;
  }

  const userRole = ref(localStorage.getItem('userRole') || '')
  const salesData: Ref<SalesEntry> = ref({
    id: 0,
    customerName: '',
    product: '',
    salesAmount: 0,
    date: new Date(),
    country: '',
  })
  const dialog = ref(false)
  const valid = ref(false)
  const isEditing = ref(false)
  const search = ref('')
  const countries = ['USA', 'Canada', 'UK', 'Australia']
  const salesEntries = ref<SalesEntry[]>([])

  const notAdmin = computed(() => userRole.value !== 'admin')
  const headers = computed(() => {
    const baseHeaders = [
      { title: 'Customer Name', key: 'customerName' },
      { title: 'Product', key: 'product' },
      { title: 'Sales Amount', key: 'salesAmount' },
      { title: 'Date', key: 'date' },
      { title: 'Country', key: 'country' },
    ]
    if (!notAdmin.value) {
      return [...baseHeaders, { title: 'Actions', key: 'actions', sortable: false }]
    }
    return baseHeaders
  })

  onMounted(() => {
    fetchSalesEntries()
  })

  watch(() => salesData.value.salesAmount, newValue => {
    salesData.value.salesAmount = Math.floor(Number(newValue))
  })

  const fetchSalesEntries = async () => {
    const response = await axios.get('http://localhost:5000/sales')
    salesEntries.value = response.data.map((entry: SalesEntry) => ({
      ...entry,
      date: new Date(entry.date),
    }))
  }

  const addEntry = () => {
    resetForm()
    dialog.value = true
    isEditing.value = false
  }

  const editEntry = (item: SalesEntry) => {
    dialog.value = true
    salesData.value = {
      ...item,
      date: new Date(item.date),
    }
    isEditing.value = true
  }

  const createEntry = async () => {
    const newEntry = {
      ...salesData.value,
      date: salesData.value.date.toISOString(),
    }
    await axios.post('http://localhost:5000/sales', newEntry)
    fetchSalesEntries()
    closeDialog()
  }

  const deleteEntry = (item: SalesEntry) => {
    salesEntries.value = salesEntries.value.filter(entry => entry.id !== item.id)
  }

  const updateEntry = async () => {
    const updatedEntry = {
      ...salesData.value,
      date: salesData.value.date.toISOString(),
    }
    await axios.put(`http://localhost:5000/sales/${salesData.value.id}`, updatedEntry)
    fetchSalesEntries()
    closeDialog()
  }

  const closeDialog = () => {
    dialog.value = false
  }

  const resetForm = () => {
    salesData.value = {
      id: 0,
      customerName: '',
      product: '',
      salesAmount: 0,
      date: new Date(),
      country: '',
    }
    isEditing.value = false
  }

  const formattedDate = computed({
    get () {
      return salesData.value.date.toLocaleDateString('en-GB')
    },
    set (value) {
      const [day, month, year] = value.split('/')
      salesData.value.date = new Date(`${year}-${month}-${day}`)
    },
  })

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

</script>

<style scoped>
</style>
