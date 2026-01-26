import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useFolders } from '@/hooks/useFolders';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors, commonStyles } from '@/utils/styles';
import { ImportVocabularyAction } from '@/components/vocabulary/ImportVocabularyAction';
import { FolderService, Folder } from '@/services/folder.service';

export default function Words() {
    const router = useRouter();
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [path, setPath] = useState<Folder[]>([]);
    const { vocabulary, isLoading: wordsLoading, deleteWord } = useVocabulary(currentFolderId);
    const { folders, isLoading: foldersLoading, createFolder, deleteFolder } = useFolders(currentFolderId);
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
            <View style={styles.header}>
                <Text style={styles.title}>Explorateur</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/review', params: { folderId: currentFolderId } })}
                        style={[styles.headerIcon, { backgroundColor: colors.indigo50 }]}
                    >
                        <FontAwesome name="play" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsCreatingFolder(true)} style={[styles.headerIcon, { backgroundColor: colors.indigo50 }]}>
                        <FontAwesome name="folder-open-o" size={18} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Fil d'Ariane / Breadcrumbs */}
            <View style={styles.breadcrumb}>
                <TouchableOpacity onPress={() => setCurrentFolderId(null)}>
                    <Text style={[styles.breadcrumbItem, !currentFolderId && styles.breadcrumbActive]}>Racine</Text>
                </TouchableOpacity>
                {path.map((f, i) => (
                    <React.Fragment key={f.id}>
                        <Text style={styles.breadcrumbSeparator}>/</Text>
                        <TouchableOpacity onPress={() => setCurrentFolderId(f.id)}>
                            <Text style={[styles.breadcrumbItem, i === path.length - 1 && styles.breadcrumbActive]} numberOfLines={1}>
                                {f.name}
                            </Text>
                        </TouchableOpacity>
                    </React.Fragment>
                ))}
            </View>

            <View style={styles.searchContainer}>
                <Input placeholder="Rechercher..." value={search} onChangeText={setSearch} />
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
                <Card style={styles.createFolderCard}>
                    <TextInput
                        style={styles.folderInput}
                        placeholder="Nom du dossier..."
                        value={newFolderName}
                        onChangeText={setNewFolderName}
                        autoFocus
                    />
                    <View style={styles.createFolderButtons}>
                        <Button title="Annuler" variant="ghost" onPress={() => setIsCreatingFolder(false)} style={{ flex: 1 }} />
                        <Button title="Créer" onPress={handleCreateFolder} style={{ flex: 1 }} />
                    </View>
                </Card>
            )}

            <FlatList
                data={data}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }: any) => (
                    <Card style={item.type === 'folder' ? styles.folderCard : styles.wordCard}>
                        {item.type === 'folder' ? (
                            <TouchableOpacity
                                style={styles.itemContent}
                                onPress={() => setCurrentFolderId(item.id)}
                                onLongPress={() => handleDeleteFolder(item.id)}
                            >
                                <FontAwesome name="folder" size={24} color={colors.warning} style={styles.icon} />
                                <View style={styles.info}>
                                    <Text style={styles.folderName}>{item.name}</Text>
                                </View>
                                <FontAwesome name="chevron-right" size={14} color={colors.gray300} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.itemContent}>
                                <FontAwesome name="file-text-o" size={20} color={colors.primary} style={styles.icon} />
                                <View style={styles.info}>
                                    <Text style={styles.englishWord}>{item.english_word}</Text>
                                    <Text style={styles.frenchWord}>{item.french_translation}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteWord(item.id)}>
                                    <FontAwesome name="trash-o" size={18} color={colors.danger} style={{ opacity: 0.5 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </Card>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FontAwesome name="folder-open" size={48} color={colors.gray200} />
                        <Text style={styles.emptyText}>Ce dossier est vide.</Text>
                    </View>
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
        paddingHorizontal: 24,
        paddingTop: 48,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { fontSize: 28, fontWeight: '800', color: colors.text },
    breadcrumb: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    breadcrumbItem: { color: colors.gray500, fontSize: 13 },
    breadcrumbActive: { color: colors.primary, fontWeight: 'bold' },
    breadcrumbSeparator: { marginHorizontal: 6, color: colors.gray300 },
    searchContainer: { paddingHorizontal: 16, marginTop: 16 },
    actionsRow: {
        paddingHorizontal: 16,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    listContent: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 8 },
    folderCard: { marginBottom: 8, borderLeftWidth: 4, borderLeftColor: colors.warning },
    wordCard: { marginBottom: 8 },
    itemContent: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    icon: { marginRight: 16 },
    info: { flex: 1 },
    folderName: { fontSize: 16, fontWeight: '600', color: colors.text },
    englishWord: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    frenchWord: { fontSize: 14, color: colors.gray500 },
    createFolderCard: { margin: 16, padding: 16, backgroundColor: colors.indigo50 },
    folderInput: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 16,
    },
    createFolderButtons: { flexDirection: 'row', gap: 12 },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { color: colors.gray400, marginTop: 16 },
});
