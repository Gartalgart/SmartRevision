import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Card } from '../../components/ui/Card';
import { useReviewSession } from '../../hooks/useReviewSession';
import { commonStyles, useTheme } from '../../utils/styles';

export default function Home() {
    const router = useRouter();
    const theme = useTheme();
    const { width } = useWindowDimensions();
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
        try {
            const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
            return new Date().toLocaleDateString('fr-FR', options);
        } catch (e) {
            return new Date().toDateString();
        }
    };

    const animatedTextStyle = useAnimatedStyle(() => ({
        color: withTiming(theme.text),
    }));

    const animatedSubTextStyle = useAnimatedStyle(() => ({
        color: withTiming(theme.textSecondary),
    }));

    const actionItemWidth = (width - 60) / 3;

    return (
        <ScrollView
            style={[commonStyles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={isLoadingReviews} onRefresh={refetchReviews} tintColor={theme.primary} />}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
                <View>
                    <Animated.Text style={[styles.dateText, animatedSubTextStyle]}>{formatDate()}</Animated.Text>
                    <Animated.Text style={[styles.greeting, animatedTextStyle]}>Bonjour ! 👋</Animated.Text>
                </View>
                <TouchableOpacity style={styles.profileIcon} onPress={() => router.push('/(tabs)/profile')}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.indigo50, borderColor: theme.primaryLight }]}>
                        <FontAwesome name="user" size={24} color={theme.primary} />
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {/* Main Action Card */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={startReview}
                disabled={dueCount === 0}
            >
                <Card animated delay={200} style={[
                    styles.mainCard,
                    dueCount > 0
                        ? { backgroundColor: theme.primary, ...(Platform.OS === 'ios' ? { shadowColor: theme.primary } : {}) }
                        : { backgroundColor: theme.gray200, ...(Platform.OS === 'ios' ? { shadowColor: theme.gray400 } : {}) },
                ]}>
                    <View style={styles.mainCardHeader}>
                        <View style={styles.mainCardInfo}>
                            <Text style={[styles.mainCardLabel, dueCount === 0 && { color: theme.textSecondary }]}>Révision quotidienne</Text>
                            <Text style={[styles.mainCardValue, dueCount === 0 && { color: theme.text }]}>{dueCount} mots dus</Text>
                        </View>
                        <View style={[styles.mainCardIcon, dueCount === 0 && { backgroundColor: theme.gray300 }]}>
                            <FontAwesome name="bolt" size={28} color={dueCount > 0 ? theme.warning : theme.gray400} />
                        </View>
                    </View>

                    <View style={[styles.progressBarContainer, dueCount === 0 && { backgroundColor: theme.gray300 }]}>
                        <View style={[styles.progressBar, { backgroundColor: theme.success, width: totalCount > 0 ? `${Math.min((learnedCount / totalCount) * 100, 100)}%` : '0%' }]} />
                    </View>

                    <View style={styles.mainCardFooter}>
                        <Text style={[styles.mainCardHint, dueCount === 0 && { color: theme.textSecondary }]}>
                            {dueCount > 0
                                ? "Boostez votre mémoire maintenant !"
                                : "Tout est à jour ! Profitez-en pour en rajouter."}
                        </Text>
                        {dueCount > 0 && (
                            <View style={styles.startBadge}>
                                <Text style={[styles.startBadgeText, { color: theme.primary }]}>Lancer</Text>
                                <FontAwesome name="chevron-right" size={12} color={theme.primary} style={{ marginLeft: 4 }} />
                            </View>
                        )}
                    </View>
                </Card>
            </TouchableOpacity>

            <Animated.Text style={[styles.sectionTitle, animatedTextStyle]} entering={FadeInRight.delay(300).springify()}>Ma Progression</Animated.Text>

            <View style={styles.statsGrid}>
                <Card animated delay={400} style={[styles.statCard, { backgroundColor: theme.emerald100, borderColor: theme.success }]}>
                    <FontAwesome name="trophy" size={28} color={theme.success} />
                    <Text style={[styles.statValue, { color: theme.success }]}>{learnedCount}</Text>
                    <Animated.Text style={[styles.statLabel, animatedSubTextStyle]}>Maîtrisés</Animated.Text>
                </Card>
                <Card animated delay={500} style={[styles.statCard, { backgroundColor: theme.amber100, borderColor: theme.warning }]}>
                    <FontAwesome name="fire" size={28} color={theme.warning} />
                    <Text style={[styles.statValue, { color: theme.warning }]}>{streak}</Text>
                    <Animated.Text style={[styles.statLabel, animatedSubTextStyle]}>Série</Animated.Text>
                </Card>
                <Card animated delay={600} style={[styles.statCard, { backgroundColor: theme.indigo100, borderColor: theme.primary }]}>
                    <FontAwesome name="book" size={28} color={theme.primary} />
                    <Text style={[styles.statValue, { color: theme.primary }]}>{totalCount}</Text>
                    <Animated.Text style={[styles.statLabel, animatedSubTextStyle]}>Total</Animated.Text>
                </Card>
            </View>

            <Animated.Text style={[styles.sectionTitle, animatedTextStyle]} entering={FadeInRight.delay(700).springify()}>Actions Rapides</Animated.Text>

            <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.quickActions}>
                <TouchableOpacity style={[styles.actionItem, { width: actionItemWidth }]} onPress={() => router.push('/(tabs)/words')}>
                    <View style={[styles.actionIcon, { backgroundColor: theme.indigo50, borderColor: theme.primaryLight, borderWidth: 2 }]}>
                        <FontAwesome name="folder-open" size={24} color={theme.primary} />
                    </View>
                    <Animated.Text style={[styles.actionLabel, animatedSubTextStyle]}>Explorateur</Animated.Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionItem, { width: actionItemWidth }]} onPress={() => router.push('/add-word')}>
                    <View style={[styles.actionIcon, { backgroundColor: theme.emerald100, borderColor: theme.success, borderWidth: 2, opacity: 0.8 }]}>
                        <FontAwesome name="plus" size={24} color={theme.success} />
                    </View>
                    <Animated.Text style={[styles.actionLabel, animatedSubTextStyle]}>Ajouter</Animated.Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionItem, { width: actionItemWidth }]} onPress={() => router.push('/(tabs)/words')}>
                    <View style={[styles.actionIcon, { backgroundColor: theme.isDark ? '#451a1a' : '#FFE4E6', borderColor: theme.danger, borderWidth: 2, opacity: 0.8 }]}>
                        <FontAwesome name="upload" size={24} color={theme.danger} />
                    </View>
                    <Animated.Text style={[styles.actionLabel, animatedSubTextStyle]}>Importer</Animated.Text>
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
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    greeting: {
        fontSize: 36,
        fontWeight: '900',
        marginTop: 4,
    },
    profileIcon: {
        padding: 4,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    mainCard: {
        padding: 28,
        borderRadius: 32,
        marginBottom: 40,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 0,
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
        fontWeight: '800',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
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
    },
});
