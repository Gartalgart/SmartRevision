import { create } from 'zustand'

interface AuthState {
    session: { user: { id: string; email: string } } | null
    loading: boolean
    initialize: () => Promise<void>
    signOut: () => Promise<void> // On garde signOut pour compatibilité, mais il ne fera rien d'utile en local
}

const LOCAL_USER = {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'local@smartrevision.app'
};

export const useAuthStore = create<AuthState>((set) => ({
    session: { user: LOCAL_USER }, // Session active par défaut !
    loading: false, // Plus de chargement initial bloquant
    initialize: async () => {
        // En mode local, on est toujours connecté.
        set({ session: { user: LOCAL_USER }, loading: false });
    },
    signOut: async () => {
        // En local, se déconnecter ne fait pas grand sens, mais on peut simuler
        console.log("Déconnexion simulée (Mode local)");
    },
}))
