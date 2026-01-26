import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/services/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, commonStyles } from '@/utils/styles';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Erreur', error.message);
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={commonStyles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Bon retour !</Text>
                    <Text style={styles.subtitle}>Connectez-vous pour continuer votre progression.</Text>
                </View>

                <Input
                    label="Email"
                    onChangeText={setEmail}
                    value={email}
                    placeholder="votre@email.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <Input
                    label="Mot de passe"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                    placeholder="••••••••"
                    autoCapitalize="none"
                />

                <View style={styles.buttonContainer}>
                    <Button title="Se connecter" onPress={signInWithEmail} loading={loading} />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Pas encore de compte ? </Text>
                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity>
                            <Text style={styles.link}>S'inscrire</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 32,
    },
    header: {
        marginBottom: 48,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: 12,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 18,
        fontWeight: '500',
    },
    buttonContainer: {
        marginTop: 24,
        marginBottom: 32,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: colors.gray500,
        fontWeight: '500',
    },
    link: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
});
