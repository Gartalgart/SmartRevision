import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ImportVocabularyAction } from '../../components/vocabulary/ImportVocabularyAction';
import { useFolders } from '../../hooks/useFolders';
import { useVocabulary } from '../../hooks/useVocabulary';
import { Folder, FolderService } from '../../services/folder.service';
import { commonStyles, useTheme } from '../../utils/styles';

export default function Words() {
    const router = useRouter();
    const theme = useTheme();
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

    const animatedTextStyle = useAnimatedStyle(() => ({
        color: withTiming(theme.text),
    }));

    const [search, setSearch] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    useEffect(() => {
        if (currentFolderId) {
            FolderService.getFolderPath(currentFolderId)
                .then(setPath)
                .catch(e => console.error("Erreur chemin dossier:", e));
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
            <View style={[commonStyles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const data = [
        ...filteredFolders.map(f => ({ ...f, type: 'folder', flatKey: `f-${f.id}` })),
        ...filteredWords.map(w => ({ ...w, type: 'word', flatKey: `w-${w.id}` }))
    ];

    return (
        <View style={[commonStyles.container, { backgroundColor: theme.background }]}>
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
                <Animated.Text style={[styles.title, animatedTextStyle]}>Explorateur</Animated.Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/review', params: { folderId: currentFolderId } })}
                        style={[styles.headerIcon, { backgroundColor: theme.indigo50 }]}
                    >
                        <FontAwesome name="play" size={20} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsCreatingFolder(!isCreatingFolder)} style={[styles.headerIcon, { backgroundColor: theme.emerald100 }]}>
                        <FontAwesome name="plus-square" size={20} color={theme.success} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Fil d'Ariane / Breadcrumbs */}
            <View style={styles.breadcrumb}>
                <TouchableOpacity onPress={() => setCurrentFolderId(null)} style={[styles.breadcrumbPill, { backgroundColor: !currentFolderId ? theme.primary : theme.indigo50 }]}>
                    <FontAwesome name="home" size={14} color={!currentFolderId ? '#FFF' : theme.primary} />
                    <Text style={[styles.breadcrumbItem, { color: !currentFolderId ? '#FFF' : theme.primary }]}>Racine</Text>
                </TouchableOpacity>
                {path.map((f, i) => {
                    const isActive = i === path.length - 1;
                    return (
                        <React.Fragment key={f.id}>
                            <FontAwesome name="angle-right" size={12} color={theme.gray300} style={styles.breadcrumbSeparator} />
                            <TouchableOpacity onPress={() => setCurrentFolderId(f.id)} style={[styles.breadcrumbPill, { backgroundColor: isActive ? theme.primary : theme.indigo50 }]}>
                                <Text style={[styles.breadcrumbItem, { color: isActive ? '#FFF' : theme.primary }]} numberOfLines={1}>
                                    {f.name}
                                </Text>
                            </TouchableOpacity>
                        </React.Fragment>
                    );
                })}
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
                    <Card style={[styles.createFolderCard, { backgroundColor: theme.indigo50, borderColor: theme.indigo100 }]}>
                        <TextInput
                            style={[styles.folderInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                            placeholder="Nom du nouveau dossier..."
                            placeholderTextColor={theme.gray400}
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
                keyExtractor={(item: any) => item.flatKey}
                renderItem={({ item, index }: any) => (
                    <Card animated delay={200 + (index * 50)} style={item.type === 'folder' ? [styles.folderCard, { borderColor: theme.amber100 }] : styles.wordCard}>
                        {item.type === 'folder' ? (
                            <TouchableOpacity
                                style={styles.itemContent}
                                onPress={() => setCurrentFolderId(item.id)}
                                onLongPress={() => handleDeleteFolder(item.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.folderIconContainer, { backgroundColor: theme.amber100 }]}>
                                    <FontAwesome name="folder" size={24} color={theme.warning} />
                                </View>
                                <View style={styles.info}>
                                    <Text style={[styles.folderName, { color: theme.text }]}>{item.name}</Text>
                                    <Text style={[styles.folderSub, { color: theme.textSecondary }]}>Dossier</Text>
                                </View>
                                <FontAwesome name="chevron-right" size={16} color={theme.gray300} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.itemContent}>
                                <View style={[styles.wordIconContainer, { backgroundColor: theme.indigo50 }]}>
                                    <Text style={styles.wordEmoji}>🇬🇧</Text>
                                </View>
                                <View style={styles.info}>
                                    <Text style={[styles.englishWord, { color: theme.text }]}>{item.english_word}</Text>
                                    <Text style={[styles.frenchWord, { color: theme.textSecondary }]}>{item.french_translation}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteWord(item.id)} style={[styles.deleteButton, { backgroundColor: theme.isDark ? '#451a1a' : '#FFE4E6' }]}>
                                    <FontAwesome name="trash" size={18} color={theme.danger} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </Card>
                )}
                ListEmptyComponent={
                    <Animated.View entering={FadeInDown.delay(300)} style={styles.emptyContainer}>
                        <View style={[styles.emptyIconCircle, { backgroundColor: theme.indigo50 }]}>
                            <FontAwesome name="inbox" size={48} color={theme.primaryLight} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>C'est bien vide ici</Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Commencez par ajouter des mots ou créer un dossier.</Text>
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
    title: { fontSize: 32, fontWeight: '900' },
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
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    breadcrumbItem: { fontSize: 13, fontWeight: '700' },
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    wordIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    wordEmoji: {
        fontSize: 24,
    },
    info: { flex: 1, justifyContent: 'center' },
    folderName: { fontSize: 18, fontWeight: '800' },
    folderSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    englishWord: { fontSize: 18, fontWeight: '800' },
    frenchWord: { fontSize: 14, fontWeight: '600', marginTop: 2 },
    deleteButton: {
        padding: 10,
        borderRadius: 12,
    },
    createFolderCard: { marginHorizontal: 20, marginBottom: 16, padding: 20, borderWidth: 2 },
    folderInput: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 1,
    },
    createFolderButtons: { flexDirection: 'row', gap: 12 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
    emptyText: { textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
});
