import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, commonStyles } from '@/utils/styles';

export default function Index() {
    // Redirection directe vers l'application sans authentification
    return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
