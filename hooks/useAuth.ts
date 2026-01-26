import { useAuthStore } from '@/stores/authStore'

export const useAuth = () => {
    const session = useAuthStore(state => state.session)
    const loading = useAuthStore(state => state.loading)
    const signOut = useAuthStore(state => state.signOut)
    const initialize = useAuthStore(state => state.initialize)

    return {
        session: session || { user: { email: 'guest@smartrevision.app' } } as any,
        loading: false, // Force loading to false for guest mode
        signOut,
        initialize,
        isAuthenticated: true // Always true for guest mode
    }
}
