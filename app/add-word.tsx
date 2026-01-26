import React, { useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVocabulary } from '@/hooks/useVocabulary';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { commonStyles } from '@/utils/styles';

export default function AddWord() {
    const router = useRouter();
    const { folderId } = useLocalSearchParams<{ folderId: string }>();
    const { addWord, isAdding } = useVocabulary(folderId || null);

    const [english, setEnglish] = useState('');
    const [french, setFrench] = useState('');
    const [example, setExample] = useState('');

    const handleSubmit = async () => {
        if (!english || !french) {
            Alert.alert('Champs manquants', 'Veuillez remplir au moins le mot en anglais et sa traduction.');
            return;
        }

        try {
            await addWord({
                english_word: english,
                french_translation: french,
                example_sentence: example || null
            });

            router.back();
        } catch (e: any) {
            Alert.alert('Erreur', e.message || "Impossible d'ajouter le mot");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={commonStyles.container}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                <Input
                    label="Mot en anglais *"
                    value={english}
                    onChangeText={setEnglish}
                    placeholder="ex: Ephemeral"
                    autoFocus
                />

                <Input
                    label="Traduction française *"
                    value={french}
                    onChangeText={setFrench}
                    placeholder="ex: Éphémère"
                />

                <Input
                    label="Exemple de phrase (optionnel)"
                    value={example}
                    onChangeText={setExample}
                    placeholder="ex: Ideally, these messages are ephemeral."
                    multiline
                    numberOfLines={3}
                    style={styles.textArea}
                />

                <View style={styles.buttonGroup}>
                    <Button title="Ajouter le mot" onPress={handleSubmit} loading={isAdding} />
                    <View style={styles.buttonSpacer} />
                    <Button title="Annuler" variant="ghost" onPress={() => router.back()} disabled={isAdding} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    textArea: {
        height: 96,
        textAlignVertical: 'top',
    },
    buttonGroup: {
        marginTop: 32,
    },
    buttonSpacer: {
        height: 12,
    },
});
