import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useVocabulary } from '../../hooks/useVocabulary';
import { useFolders } from '../../hooks/useFolders';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors, commonStyles } from '../../utils/styles';
import { ImportVocabularyAction } from '../../components/vocabulary/ImportVocabularyAction';
import { FolderService, Folder } from '../../services/folder.service';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function Words() {
    const router = useRouter();
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [path, setPath] = useState<Folder[]>([]);
    const { vocabulary, isLoading: wordsLoading, deleteWord, error: wordsError } = useVocabulary(currentFolderId);
    const { folders, isLoading: foldersLoading, createFolder, deleteFolder, error: foldersError } = useFolders(currentFolderId);

    useEffect(() => {
        if (wordsError) {
            console.error("Erreur Vocabulaire", wordsError);
        }
        if (foldersError) {
            console.error("Erreur Dossiers", foldersError);
        }
    }, [wordsError, foldersError]);

    const [search, setSearch] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    useEffect(() => {
        if (currentFolderId) {
            FolderService.getFolderPath(currentFolderId).then(setPath);
        } else {
            setPath([]);
        }
    }, [currentFolderId]);

    const filteredWords = vocabulary?.filter(v =>
        v.english_word.toLowerCase().includes(search.toLowerCase()) ||
        v.french_translation.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const filteredFolders = folders?.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await createFolder({ name: newFolderName, parentId: currentFolderId });
            setNewFolderName('');
            setIsCreatingFolder(false);
        } catch (e) {
            Alert.alert("Erreur", "Impossible de créer le dossier");
        }
    };

    const handleDeleteWord = (id: string) => {
        Alert.alert("Supprimer", "Supprimer ce mot ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Supprimer", style: "destructive", onPress: () => deleteWord(id) }
        ]);
    };

    const handleDeleteFolder = (id: string) => {
        Alert.alert("Supprimer", "Supprimer ce dossier et tout son contenu ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Supprimer", style: "destructive", onPress: () => deleteFolder(id) }
        ]);
    };

    if (wordsLoading || foldersLoading) {
        return (
            <View style={[commonStyles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const data = [
        ...filteredFolders.map(f => ({ ...f, type: 'folder' })),
        ...filteredWords.map(w => ({ ...w, type: 'word' }))
    ];

    return (
        <View style={commonStyles.container}>
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
                <Text style={styles.title}>Explorateur</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/review', params: { folderId: currentFolderId } })}
                        style={[styles.headerIcon, { backgroundColor: colors.indigo100 }]}
                    >
                        <FontAwesome name="play" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsCreatingFolder(!isCreatingFolder)} style={[styles.headerIcon, { backgroundColor: colors.emerald100 }]}>
                        <FontAwesome name="folder-plus" size={20} color={colors.success} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Fil d'Ariane / Breadcrumbs */}
            <View style={styles.breadcrumb}>
                <TouchableOpacity onPress={() => setCurrentFolderId(null)} style={styles.breadcrumbPill}>
                    <FontAwesome name="home" size={14} color={!currentFolderId ? colors.card : colors.primary} />
                    <Text style={[styles.breadcrumbItem, !currentFolderId && styles.breadcrumbActive]}>Racine</Text>
                </TouchableOpacity>
                {path.map((f, i) => (
                    <React.Fragment key={f.id}>
                        <FontAwesome name="angle-right" size={12} color={colors.gray300} style={styles.breadcrumbSeparator} />
                        <TouchableOpacity onPress={() => setCurrentFolderId(f.id)} style={[styles.breadcrumbPill, i === path.length - 1 && styles.breadcrumbPillActive]}>
                            <Text style={[styles.breadcrumbItem, i === path.length - 1 && styles.breadcrumbActive]} numberOfLines={1}>
                                {f.name}
                            </Text>
                        </TouchableOpacity>
                    </React.Fragment>
                ))}
            </View>

            <View style={styles.searchContainer}>
                <Input placeholder="Rechercher un mot..." value={search} onChangeText={setSearch} />
            </View>

            <View style={styles.actionsRow}>
                <View style={{ flex: 1 }}>
                    <ImportVocabularyAction folderId={currentFolderId} />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                    <Button
                        title="Ajouter un mot"
                        onPress={() => router.push({ pathname: '/add-word', params: { folderId: currentFolderId } })}
                    />
                </View>
            </View>

            {isCreatingFolder && (
                <Animated.View entering={FadeInDown.springify()}>
                    <Card style={styles.createFolderCard}>
                        <TextInput
                            style={styles.folderInput}
                            placeholder="Nom du nouveau dossier..."
                            placeholderTextColor={colors.gray400}
                            value={newFolderName}
                            onChangeText={setNewFolderName}
                            autoFocus
                        />
                        <View style={styles.createFolderButtons}>
                            <Button title="Annuler" variant="ghost" onPress={() => setIsCreatingFolder(false)} style={{ flex: 1 }} />
                            <Button title="Créer" onPress={handleCreateFolder} style={{ flex: 1 }} variant="success" />
                        </View>
                    </Card>
                </Animated.View>
            )}

            <FlatList
                data={data}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item, index }: any) => (
                    <Card animated delay={200 + (index * 50)} style={item.type === 'folder' ? styles.folderCard : styles.wordCard}>
                        {item.type === 'folder' ? (
                            <TouchableOpacity
                                style={styles.itemContent}
                                onPress={() => setCurrentFolderId(item.id)}
                                onLongPress={() => handleDeleteFolder(item.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.folderIconContainer}>
                                    <FontAwesome name="folder" size={24} color={colors.warning} />
                                </View>
                                <View style={styles.info}>
                                    <Text style={styles.folderName}>{item.name}</Text>
                                    <Text style={styles.folderSub}>Dossier</Text>
                                </View>
                                <FontAwesome name="chevron-right" size={16} color={colors.gray300} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.itemContent}>
                                <View style={styles.wordIconContainer}>
                                    <Text style={styles.wordEmoji}>🇬🇧</Text>
                                </View>
                                <View style={styles.info}>
                                    <Text style={styles.englishWord}>{item.english_word}</Text>
                                    <Text style={styles.frenchWord}>{item.french_translation}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteWord(item.id)} style={styles.deleteButton}>
                                    <FontAwesome name="trash" size={18} color={colors.danger} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </Card>
                )}
                ListEmptyComponent={
                    <Animated.View entering={FadeInDown.delay(300)} style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <FontAwesome name="inbox" size={48} color={colors.primaryLight} />
                        </View>
                        <Text style={styles.emptyTitle}>C'est bien vide ici</Text>
                        <Text style={styles.emptyText}>Commencez par ajouter des mots ou créer un dossier.</Text>
                    </Animated.View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        marginBottom: 16,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { fontSize: 32, fontWeight: '900', color: colors.text },
    breadcrumb: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    breadcrumbPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.indigo50,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    breadcrumbPillActive: {
        backgroundColor: colors.primary,
    },
    breadcrumbItem: { color: colors.primary, fontSize: 13, fontWeight: '700' },
    breadcrumbActive: { color: colors.card },
    breadcrumbSeparator: { marginHorizontal: 8 },
    searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
    actionsRow: {
        paddingHorizontal: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    folderCard: { 
        marginBottom: 12, 
        padding: 16,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: colors.amber100,
        backgroundColor: colors.card,
    },
    wordCard: { 
        marginBottom: 12, 
        padding: 16,
        borderRadius: 24,
    },
    itemContent: { flexDirection: 'row', alignItems: 'center' },
    folderIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: colors.amber100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    wordIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: colors.indigo50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    wordEmoji: {
        fontSize: 24,
    },
    info: { flex: 1, justifyContent: 'center' },
    folderName: { fontSize: 18, fontWeight: '800', color: colors.text },
    folderSub: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginTop: 2 },
    englishWord: { fontSize: 18, fontWeight: '800', color: colors.text },
    frenchWord: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', marginTop: 2 },
    deleteButton: {
        padding: 10,
        backgroundColor: '#FFE4E6',
        borderRadius: 12,
    },
    createFolderCard: { marginHorizontal: 20, marginBottom: 16, padding: 20, backgroundColor: colors.indigo50, borderWidth: 2, borderColor: colors.primaryLight },
    folderInput: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    createFolderButtons: { flexDirection: 'row', gap: 12 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.indigo50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
    emptyText: { color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
});
