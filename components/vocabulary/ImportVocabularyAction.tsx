import React, { useState } from 'react';
import { Alert, StyleSheet, Modal, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Papa from 'papaparse';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { VocabularyService } from '@/services/vocabulary.service';
import { useQueryClient } from '@tanstack/react-query';
import { colors } from '@/utils/styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export const ImportVocabularyAction = ({ folderId = null }: { folderId?: string | null }) => {
    const [loading, setLoading] = useState(false);
    const [showTuto, setShowTuto] = useState(false);
    const queryClient = useQueryClient();

    const startImport = async () => {
        setShowTuto(false);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'application/json', 'text/comma-separated-values'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            setLoading(true);
            const file = result.assets[0];
            const content = await FileSystem.readAsStringAsync(file.uri);

            let items: any[] = [];

            if (file.name.endsWith('.json')) {
                items = JSON.parse(content);
            } else {
                const parsed = Papa.parse(content, {
                    header: true,
                    skipEmptyLines: true,
                });
                items = parsed.data;
            }

            const validItems = items.filter(
                (item: any) => item.english_word && item.french_translation
            ).map((item: any) => ({
                english_word: item.english_word.trim(),
                french_translation: item.french_translation.trim(),
                example_sentence: item.example_sentence?.trim() || null,
            }));

            if (validItems.length === 0) {
                throw new Error('Aucun mot valide trouvé. Vérifiez les en-têtes du fichier.');
            }

            await VocabularyService.importMany(validItems, folderId);

            queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
            Alert.alert('Succès', `${validItems.length} mots importés !`);
        } catch (error: any) {
            console.error('Import error:', error);
            Alert.alert('Erreur', error.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                title="Importer"
                variant="outline"
                onPress={() => setShowTuto(true)}
                loading={loading}
                style={styles.button}
            />

            <Modal
                visible={showTuto}
                transparent
                animationType="fade"
                onRequestClose={() => setShowTuto(false)}
            >
                <View style={styles.modalOverlay}>
                    <Card style={styles.tutoCard}>
                        <View style={styles.tutoHeader}>
                            <Text style={styles.tutoTitle}>Guide d'importation</Text>
                            <TouchableOpacity onPress={() => setShowTuto(false)}>
                                <FontAwesome name="close" size={20} color={colors.gray400} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.tutoContent} showsVerticalScrollIndicator={false}>
                            <Text style={styles.tutoText}>
                                Pour que l'importation fonctionne, votre fichier (CSV ou JSON) doit utiliser ces noms de colonnes exacts :
                            </Text>

                            <View style={styles.columnList}>
                                <View style={styles.columnItem}>
                                    <Text style={styles.columnName}>english_word</Text>
                                    <Text style={styles.columnDesc}>Le mot anglais (Requis)</Text>
                                </View>
                                <View style={styles.columnItem}>
                                    <Text style={styles.columnName}>french_translation</Text>
                                    <Text style={styles.columnDesc}>La traduction (Requis)</Text>
                                </View>
                                <View style={styles.columnItem}>
                                    <Text style={styles.columnName}>example_sentence</Text>
                                    <Text style={styles.columnDesc}>Une phrase d'exemple (Optionnel)</Text>
                                </View>
                            </View>

                            <Text style={styles.exampleTitle}>Exemple de fichier CSV :</Text>
                            <View style={styles.codeBlock}>
                                <Text style={styles.codeText}>
                                    english_word,french_translation,example_sentence{"\n"}
                                    Ephemeral,Éphémère,"Life is ephemeral."{"\n"}
                                    Knowledge,Connaissance,"Knowledge is power."
                                </Text>
                            </View>

                            <Text style={styles.tutoFooter}>
                                Note : Le séparateur automatique est la virgule (,).
                            </Text>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button title="Choisir un fichier" onPress={startImport} />
                        </View>
                    </Card>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        marginVertical: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    tutoCard: {
        maxHeight: '85%',
        padding: 24,
    },
    tutoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    tutoTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
    },
    tutoContent: {
        marginBottom: 20,
    },
    tutoText: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: 16,
    },
    columnList: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    columnItem: {
        marginBottom: 10,
    },
    columnName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    columnDesc: {
        fontSize: 12,
        color: colors.gray500,
    },
    exampleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    codeBlock: {
        backgroundColor: colors.gray100,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    codeText: {
        fontSize: 12,
        color: colors.gray500,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    tutoFooter: {
        fontSize: 13,
        color: colors.gray400,
        fontStyle: 'italic',
    },
    modalFooter: {
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        paddingTop: 16,
    },
});
