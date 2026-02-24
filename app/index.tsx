import { Redirect } from 'expo-router';

export default function Index() {
    // Redirection immédiate vers l'accueil car on est en mode Local
    return <Redirect href="/(tabs)/home" />;
}
