import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'

interface AuthState {
    session: Session | null
    loading: boolean
    initialize: () => Promise<void>
    signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    loading: true,
    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            set({ session, loading: false })

            supabase.auth.onAuthStateChange((_event, session) => {
                set({ session })
            })
        } catch (error) {
            console.error('Auth initialization error:', error)
            set({ loading: false })
        }
    },
    signOut: async () => {
        await supabase.auth.signOut()
        set({ session: null })
    },
}))
