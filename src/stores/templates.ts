import { defineStore } from 'pinia'

export const templatesStore = defineStore({
  id: 'templates',
  state: () => {
    return {templates: []}
  },
  persist: true
})
