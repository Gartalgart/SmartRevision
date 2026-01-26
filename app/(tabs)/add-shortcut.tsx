import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AddShortcut() {
    const router = useRouter();

    useEffect(() => {
        // Rediriger immédiatement vers la page d'ajout
        router.replace('/add-word');
    }, []);

    return null;
}
