import React, { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useReviewSession } from '@/hooks/useReviewSession';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors, commonStyles } from '@/utils/styles';

const { width } = Dimensions.get('window');

export default function Home() {
    const router = useRouter();
    const { dueReviews, stats, refetchReviews, isLoadingReviews } = useReviewSession();

    useFocusEffect(
        useCallback(() => {
            refetchReviews();
        }, [])
    );

    const dueCount = dueReviews?.length || 0;
    const learnedCount = stats?.learnedCount || 0;
    const totalCount = (stats as any)?.totalCount || 0;
    const streak = stats?.streak || 0;

    const startReview = () => {
        router.push('/review');
    };

    const formatDate = () => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
        return new Date().toLocaleDateString('fr-FR', options);
    };

    return (
        <ScrollView
            style={commonStyles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={isLoadingReviews} onRefresh={refetchReviews} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.dateText}>{formatDate()}</Text>
                    <Text style={styles.greeting}>Bonjour ! 👋</Text>
                </View>
                <TouchableOpacity style={styles.profileIcon} onPress={() => router.push('/(tabs)/profile')}>
                    <FontAwesome name="user-circle-o" size={32} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Main Action Card */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={startReview}
                disabled={dueCount === 0}
            >
                <Card style={[styles.mainCard, dueCount === 0 && styles.disabledCard]}>
                    <View style={styles.mainCardHeader}>
                        <View style={styles.mainCardInfo}>
                            <Text style={styles.mainCardLabel}>Révision quotidienne</Text>
                            <Text style={styles.mainCardValue}>{dueCount} mots dus</Text>
                        </View>
                        <View style={styles.mainCardIcon}>
                            <FontAwesome name="bolt" size={24} color="white" />
                        </View>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: totalCount > 0 ? `${Math.min((learnedCount / totalCount) * 100, 100)}%` : '0%' }]} />
                    </View>

                    <View style={styles.mainCardFooter}>
                        <Text style={styles.mainCardHint}>
                            {dueCount > 0
                                ? "Boostez votre mémoire maintenant"
                                : "Tout est à jour ! Profitez-en pour en rajouter."}
                        </Text>
                        {dueCount > 0 && (
                            <View style={styles.startBadge}>
                                <Text style={styles.startBadgeText}>Lancer</Text>
                                <FontAwesome name="chevron-right" size={10} color={colors.primary} />
                            </View>
                        )}
                    </View>
                </Card>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Ma Progression</Text>

            <View style={styles.statsGrid}>
                <Card style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
                    <FontAwesome name="trophy" size={20} color={colors.success} />
                    <Text style={styles.statValue}>{learnedCount}</Text>
                    <Text style={styles.statLabel}>Maîtrisés</Text>
                </Card>
                <Card style={[styles.statCard, { backgroundColor: '#fff7ed' }]}>
                    <FontAwesome name="fire" size={20} color={colors.warning} />
                    <Text style={styles.statValue}>{streak}</Text>
                    <Text style={styles.statLabel}>Série</Text>
                </Card>
                <Card style={[styles.statCard, { backgroundColor: '#eef2ff' }]}>
                    <FontAwesome name="book" size={20} color={colors.primary} />
                    <Text style={styles.statValue}>{totalCount}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </Card>
            </View>

            <Text style={styles.sectionTitle}>Actions Rapides</Text>

            <View style={styles.quickActions}>
                <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/words')}>
                    <View style={[styles.actionIcon, { backgroundColor: colors.indigo50 }]}>
                        <FontAwesome name="folder-open" size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.actionLabel}>Explorateur</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/add-word')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
                        <FontAwesome name="plus" size={20} color={colors.success} />
                    </View>
                    <Text style={styles.actionLabel}>Ajouter</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/words')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#fff1f2' }]}>
                        <FontAwesome name="upload" size={20} color={colors.danger} />
                    </View>
                    <Text style={styles.actionLabel}>Importer</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    dateText: {
        fontSize: 14,
        color: colors.gray500,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    greeting: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.text,
        marginTop: 2,
    },
    profileIcon: {
        padding: 4,
    },
    mainCard: {
        backgroundColor: colors.primary,
        padding: 24,
        borderRadius: 28,
        marginBottom: 32,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
        borderWidth: 0,
    },
    disabledCard: {
        backgroundColor: colors.gray300,
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    mainCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    mainCardInfo: {
        flex: 1,
    },
    mainCardLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontWeight: '600',
    },
    mainCardValue: {
        color: 'white',
        fontSize: 28,
        fontWeight: '800',
        marginTop: 4,
    },
    mainCardIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        marginTop: 24,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 4,
    },
    mainCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    mainCardHint: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    startBadge: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    startBadgeText: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 24,
        borderWidth: 0,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text,
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
        marginTop: 2,
        textAlign: 'center',
    },
    miniChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
        marginTop: 12,
    },
    chartBar: {
        width: 6,
        backgroundColor: colors.primary,
        borderRadius: 3,
        opacity: 0.3,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    actionItem: {
        alignItems: 'center',
        width: (width - 40) / 3.5,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
    },
});
