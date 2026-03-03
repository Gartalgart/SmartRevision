import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useReviewSession } from '../../hooks/useReviewSession';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, commonStyles } from '../../utils/styles';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function Profile() {
    const { signOut } = useAuth();
    const { stats, refetchReviews, isLoadingReviews } = useReviewSession();

    useFocusEffect(
        useCallback(() => {
            refetchReviews();
        }, [])
    );

    const breakdown = (stats as any)?.breakdown || { new: 0, learning: 0, review: 0, mastered: 0 };
    const total = (stats as any)?.totalCount || 0;

    const getPercent = (val: number) => total > 0 ? (val / total) * 100 : 0;

    return (
        <ScrollView
            style={commonStyles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={isLoadingReviews} onRefresh={refetchReviews} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarEmoji}>🎓</Text>
                    </View>
                </View>
                <Text style={styles.username}>Étudiant</Text>
                <Text style={styles.userSubtitle}>Membre depuis aujourd'hui</Text>
            </Animated.View>

            <Animated.Text entering={FadeInDown.delay(200).springify()} style={styles.sectionTitle}>Statistiques Globales</Animated.Text>

            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.overviewGrid}>
                <Card style={[styles.overviewCard, { borderColor: colors.primaryLight, borderWidth: 2 }]}>
                    <Text style={styles.overviewValue}>{total}</Text>
                    <Text style={styles.overviewLabel}>Mots Total</Text>
                </Card>
                <Card style={[styles.overviewCard, { borderColor: colors.amber100, borderWidth: 2 }]}>
                    <Text style={[styles.overviewValue, { color: colors.warning }]}>{(stats as any)?.dueCount || 0}</Text>
                    <Text style={styles.overviewLabel}>À Réviser</Text>
                </Card>
            </Animated.View>

            <Animated.Text entering={FadeInDown.delay(400).springify()} style={styles.sectionTitle}>Progression</Animated.Text>

            <Animated.View entering={FadeInDown.delay(500).springify()}>
                <Card style={styles.chartCard}>
                    {/* Visual Bar Chart */}
                    <View style={styles.chartBarContainer}>
                        {breakdown.mastered > 0 && <View style={[styles.chartSegment, { flex: breakdown.mastered, backgroundColor: colors.success, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }]} />}
                        {breakdown.review > 0 && <View style={[styles.chartSegment, { flex: breakdown.review, backgroundColor: colors.warning }]} />}
                        {breakdown.learning > 0 && <View style={[styles.chartSegment, { flex: breakdown.learning, backgroundColor: colors.secondary }]} />}
                        {breakdown.new > 0 && <View style={[styles.chartSegment, { flex: breakdown.new, backgroundColor: colors.gray300, borderTopRightRadius: 12, borderBottomRightRadius: 12 }]} />}
                        {total === 0 && <View style={[styles.chartSegment, { flex: 1, backgroundColor: colors.gray200, borderRadius: 12 }]} />}
                    </View>

                    {/* Legend / Details */}
                    <View style={styles.legendContainer}>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                            <Text style={styles.legendLabel}>Maîtrisés</Text>
                            <Text style={styles.legendValue}>{breakdown.mastered} ({getPercent(breakdown.mastered).toFixed(0)}%)</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                            <Text style={styles.legendLabel}>En Révision</Text>
                            <Text style={styles.legendValue}>{breakdown.review} ({getPercent(breakdown.review).toFixed(0)}%)</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
                            <Text style={styles.legendLabel}>En Apprentissage</Text>
                            <Text style={styles.legendValue}>{breakdown.learning} ({getPercent(breakdown.learning).toFixed(0)}%)</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: colors.gray300 }]} />
                            <Text style={styles.legendLabel}>Nouveaux</Text>
                            <Text style={styles.legendValue}>{breakdown.new} ({getPercent(breakdown.new).toFixed(0)}%)</Text>
                        </View>
                    </View>
                </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.actionContainer}>
                <Button
                    title="Déconnexion"
                    variant="danger"
                    onPress={signOut}
                    style={styles.logoutButton}
                />
                <Text style={styles.versionText}>SmartRevision v1.0.0</Text>
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
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarContainer: {
        padding: 4,
        backgroundColor: colors.background,
        borderRadius: 60,
        marginBottom: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.indigo50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.primaryLight,
    },
    avatarEmoji: {
        fontSize: 48,
    },
    username: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.text,
        marginBottom: 4,
    },
    userSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.text,
        marginBottom: 20,
        marginLeft: 4,
    },
    overviewGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 40,
    },
    overviewCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: colors.card,
        shadowOpacity: 0,
        elevation: 0,
    },
    overviewValue: {
        fontSize: 36,
        fontWeight: '900',
        color: colors.primary,
        marginBottom: 8,
    },
    overviewLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    chartCard: {
        padding: 24,
        marginBottom: 40,
        borderWidth: 2,
        borderColor: colors.border,
    },
    chartBarContainer: {
        height: 24,
        flexDirection: 'row',
        width: '100%',
        marginBottom: 32,
        borderRadius: 12,
        overflow: 'hidden',
    },
    chartSegment: {
        height: '100%',
    },
    legendContainer: {
        gap: 16,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 16,
    },
    legendLabel: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontWeight: '700',
    },
    legendValue: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '800',
    },
    actionContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    logoutButton: {
        width: '100%',
        marginBottom: 24,
    },
    versionText: {
        fontSize: 14,
        color: colors.gray400,
        fontWeight: '600',
    },
});
