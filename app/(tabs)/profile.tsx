import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useReviewSession } from '@/hooks/useReviewSession';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, commonStyles } from '@/utils/styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from 'expo-router';

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

    // Calculate percentages for bar chart
    const getPercent = (val: number) => total > 0 ? (val / total) * 100 : 0;

    return (
        <ScrollView
            style={commonStyles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={isLoadingReviews} onRefresh={refetchReviews} tintColor={colors.primary} />}
        >
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarEmoji}>🎓</Text>
                </View>
                <Text style={styles.username}>Étudiant</Text>
                <Text style={styles.userSubtitle}>Statistiques Globales</Text>
            </View>

            <Text style={styles.sectionTitle}>Vue d'ensemble</Text>

            <View style={styles.overviewGrid}>
                <Card style={styles.overviewCard}>
                    <Text style={styles.overviewValue}>{total}</Text>
                    <Text style={styles.overviewLabel}>Mots Total</Text>
                </Card>
                <Card style={styles.overviewCard}>
                    <Text style={styles.overviewValue}>{(stats as any)?.dueCount || 0}</Text>
                    <Text style={styles.overviewLabel}>À Réviser</Text>
                </Card>
            </View>

            <Text style={styles.sectionTitle}>Progression de l'apprentissage</Text>

            <Card style={styles.chartCard}>
                {/* Visual Bar Chart */}
                <View style={styles.chartBarContainer}>
                    {breakdown.mastered > 0 && <View style={[styles.chartSegment, { flex: breakdown.mastered, backgroundColor: colors.success, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }]} />}
                    {breakdown.review > 0 && <View style={[styles.chartSegment, { flex: breakdown.review, backgroundColor: colors.warning }]} />}
                    {breakdown.learning > 0 && <View style={[styles.chartSegment, { flex: breakdown.learning, backgroundColor: colors.secondary }]} />}
                    {breakdown.new > 0 && <View style={[styles.chartSegment, { flex: breakdown.new, backgroundColor: colors.gray300, borderTopRightRadius: 8, borderBottomRightRadius: 8 }]} />}
                    {total === 0 && <View style={[styles.chartSegment, { flex: 1, backgroundColor: colors.gray200, borderRadius: 8 }]} />}
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

            <View style={styles.actionContainer}>
                <Button
                    title="Déconnexion"
                    variant="ghost"
                    onPress={signOut}
                    style={styles.logoutButton}
                    textStyle={{ color: colors.danger }}
                />
                <Text style={styles.versionText}>SmartRevision v1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.indigo50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: 'white',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarEmoji: {
        fontSize: 32,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    userSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
        marginTop: 8,
    },
    overviewGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    overviewCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 24,
    },
    overviewValue: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 4,
    },
    overviewLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chartCard: {
        padding: 24,
        marginBottom: 32,
    },
    chartBarContainer: {
        height: 24,
        flexDirection: 'row',
        width: '100%',
        marginBottom: 24,
        borderRadius: 8,
        overflow: 'hidden', // Ensure segments don't overflow rounded corners
    },
    chartSegment: {
        height: '100%',
    },
    legendContainer: {
        gap: 12,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    legendLabel: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    legendValue: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    actionContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    logoutButton: {
        width: '100%',
        marginBottom: 16,
    },
    versionText: {
        fontSize: 12,
        color: colors.gray400,
    },
});
