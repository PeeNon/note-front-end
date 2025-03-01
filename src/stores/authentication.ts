import { defineStore } from 'pinia'
import localforage from 'localforage'

export const useAuthStore = defineStore('authentication', {
  state: () => ({
    token: '',
  }),
  actions: {
    async setToken(token: string) {
      this.token = token
      await localforage.setItem('auth_token', token)
    },
    async loadToken() {
      const token = await localforage.getItem<string>('auth_token')
      if (token) {
        this.token = token
      }
    },
    async clearToken() {
      this.token = ''
      await localforage.removeItem('auth_token')
    },
  },
})
