import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function ReviewShortcut() {
    const router = useRouter();

    useEffect(() => {
        // Rediriger immédiatement vers la page de révision
        router.replace('/review');
    }, []);

    return null;
}
