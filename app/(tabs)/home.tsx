import React, { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useReviewSession } from '../../hooks/useReviewSession';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors, commonStyles } from '../../utils/styles';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

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
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
                <View>
                    <Text style={styles.dateText}>{formatDate()}</Text>
                    <Text style={styles.greeting}>Bonjour ! 👋</Text>
                </View>
                <TouchableOpacity style={styles.profileIcon} onPress={() => router.push('/(tabs)/profile')}>
                    <View style={styles.avatarPlaceholder}>
                        <FontAwesome name="user" size={24} color={colors.primary} />
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {/* Main Action Card */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={startReview}
                disabled={dueCount === 0}
            >
                <Card animated delay={200} style={[styles.mainCard, dueCount === 0 && styles.disabledCard]}>
                    <View style={styles.mainCardHeader}>
                        <View style={styles.mainCardInfo}>
                            <Text style={styles.mainCardLabel}>Révision quotidienne</Text>
                            <Text style={styles.mainCardValue}>{dueCount} mots dus</Text>
                        </View>
                        <View style={styles.mainCardIcon}>
                            <FontAwesome name="bolt" size={28} color={dueCount > 0 ? colors.warning : 'white'} />
                        </View>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: totalCount > 0 ? `${Math.min((learnedCount / totalCount) * 100, 100)}%` : '0%' }]} />
                    </View>

                    <View style={styles.mainCardFooter}>
                        <Text style={styles.mainCardHint}>
                            {dueCount > 0
                                ? "Boostez votre mémoire maintenant !"
                                : "Tout est à jour ! Profitez-en pour en rajouter."}
                        </Text>
                        {dueCount > 0 && (
                            <View style={styles.startBadge}>
                                <Text style={styles.startBadgeText}>Lancer</Text>
                                <FontAwesome name="chevron-right" size={12} color={colors.primary} style={{marginLeft: 4}} />
                            </View>
                        )}
                    </View>
                </Card>
            </TouchableOpacity>

            <Animated.Text entering={FadeInRight.delay(300).springify()} style={styles.sectionTitle}>Ma Progression</Animated.Text>

            <View style={styles.statsGrid}>
                <Card animated delay={400} style={[styles.statCard, { backgroundColor: colors.emerald100, borderColor: colors.success }]}>
                    <FontAwesome name="trophy" size={28} color={colors.success} />
                    <Text style={[styles.statValue, { color: colors.success }]}>{learnedCount}</Text>
                    <Text style={styles.statLabel}>Maîtrisés</Text>
                </Card>
                <Card animated delay={500} style={[styles.statCard, { backgroundColor: colors.amber100, borderColor: colors.warning }]}>
                    <FontAwesome name="fire" size={28} color={colors.warning} />
                    <Text style={[styles.statValue, { color: colors.warning }]}>{streak}</Text>
                    <Text style={styles.statLabel}>Série</Text>
                </Card>
                <Card animated delay={600} style={[styles.statCard, { backgroundColor: colors.indigo100, borderColor: colors.primary }]}>
                    <FontAwesome name="book" size={28} color={colors.primary} />
                    <Text style={[styles.statValue, { color: colors.primary }]}>{totalCount}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </Card>
            </View>

            <Animated.Text entering={FadeInRight.delay(700).springify()} style={styles.sectionTitle}>Actions Rapides</Animated.Text>

            <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.quickActions}>
                <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/words')}>
                    <View style={[styles.actionIcon, { backgroundColor: colors.indigo100, borderColor: colors.primaryLight, borderWidth: 2 }]}>
                        <FontAwesome name="folder-open" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.actionLabel}>Explorateur</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/add-word')}>
                    <View style={[styles.actionIcon, { backgroundColor: colors.emerald100, borderColor: '#A7F3D0', borderWidth: 2 }]}>
                        <FontAwesome name="plus" size={24} color={colors.success} />
                    </View>
                    <Text style={styles.actionLabel}>Ajouter</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/words')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#FFE4E6', borderColor: '#FECDD3', borderWidth: 2 }]}>
                        <FontAwesome name="upload" size={24} color={colors.danger} />
                    </View>
                    <Text style={styles.actionLabel}>Importer</Text>
                </TouchableOpacity>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    dateText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    greeting: {
        fontSize: 36,
        fontWeight: '900',
        color: colors.text,
        marginTop: 4,
    },
    profileIcon: {
        padding: 4,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.indigo100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primaryLight,
    },
    mainCard: {
        backgroundColor: colors.primary,
        padding: 28,
        borderRadius: 32,
        marginBottom: 40,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 0,
    },
    disabledCard: {
        backgroundColor: colors.gray300,
        shadowColor: colors.gray400,
        shadowOpacity: 0.2,
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
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    mainCardValue: {
        color: 'white',
        fontSize: 36,
        fontWeight: '900',
        marginTop: 8,
    },
    mainCardIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 6,
        marginTop: 32,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.success,
        borderRadius: 6,
    },
    mainCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
    },
    mainCardHint: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
        paddingRight: 16,
    },
    startBadge: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    startBadgeText: {
        color: colors.primary,
        fontWeight: '800',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.text,
        marginBottom: 20,
        marginLeft: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 40,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 28,
        borderWidth: 2,
        alignItems: 'center',
        shadowOpacity: 0,
        elevation: 0,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
        marginTop: 12,
    },
    statLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '700',
        marginTop: 4,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    actionItem: {
        alignItems: 'center',
        width: (width - 60) / 3,
    },
    actionIcon: {
        width: 72,
        height: 72,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textSecondary,
    },
});
