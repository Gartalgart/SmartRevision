import { Platform } from 'react-native'

// Type pour le storage compatible Supabase
interface StorageAdapter {
    getItem: (key: string) => Promise<string | null>
    setItem: (key: string, value: string) => Promise<void>
    removeItem: (key: string) => Promise<void>
}

// Storage pour le web (utilise localStorage)
const webStorage: StorageAdapter = {
    getItem: async (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key)
        }
        return null
    },
    setItem: async (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value)
        }
    },
    removeItem: async (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key)
        }
    },
}

// Storage pour mobile (utilise AsyncStorage)
let nativeStorage: StorageAdapter | null = null

// Import dynamique d'AsyncStorage uniquement sur mobile
if (Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default
    nativeStorage = AsyncStorage
}

// Export du storage adapté à la plateforme
export const storage: StorageAdapter = Platform.OS === 'web' ? webStorage : (nativeStorage as StorageAdapter)
