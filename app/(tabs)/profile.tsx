import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useReviewSession } from '../../hooks/useReviewSession';
import { useThemeStore } from '../../stores/themeStore';
import { commonStyles, useTheme } from '../../utils/styles';

export default function Profile() {
    const { signOut } = useAuth();
    const { stats, refetchReviews, isLoadingReviews } = useReviewSession();
    const { isDark, toggleTheme } = useThemeStore();
    const theme = useTheme();

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
            refreshControl={<RefreshControl refreshing={isLoadingReviews} onRefresh={refetchReviews} tintColor={theme.primary} />}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: theme.indigo50, borderColor: theme.indigo100 }]}>
                        <Text style={styles.avatarEmoji}>🎓</Text>
                    </View>
                </View>
                <Text style={[styles.username, { color: theme.text }]}>Étudiant</Text>
                <Text style={[styles.userSubtitle, { color: theme.textSecondary }]}>Membre depuis aujourd'hui</Text>
            </View>

            <View>
                <Card style={styles.settingsCard}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <FontAwesome name={isDark ? "moon-o" : "sun-o"} size={20} color={theme.primary} style={{ marginRight: 12 }} />
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Mode Sombre</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: theme.gray300, true: theme.primary }}
                            thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                        />
                    </View>
                </Card>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Statistiques Globales</Text>

            <View style={styles.overviewGrid}>
                <Card style={[styles.overviewCard, { borderColor: theme.indigo100, borderWidth: 2 }]}>
                    <Text style={[styles.overviewValue, { color: theme.primary }]}>{total}</Text>
                    <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Mots Total</Text>
                </Card>
                <Card style={[styles.overviewCard, { borderColor: theme.amber100, borderWidth: 2 }]}>
                    <Text style={[styles.overviewValue, { color: theme.warning }]}>{(stats as any)?.dueCount || 0}</Text>
                    <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>À Réviser</Text>
                </Card>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Progression</Text>

            <View>
                <Card style={styles.chartCard}>
                    <View style={styles.chartBarContainer}>
                        {breakdown.mastered > 0 && <View style={[styles.chartSegment, { flex: breakdown.mastered, backgroundColor: theme.success, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }]} />}
                        {breakdown.review > 0 && <View style={[styles.chartSegment, { flex: breakdown.review, backgroundColor: theme.warning }]} />}
                        {breakdown.learning > 0 && <View style={[styles.chartSegment, { flex: breakdown.learning, backgroundColor: theme.secondary }]} />}
                        {breakdown.new > 0 && <View style={[styles.chartSegment, { flex: breakdown.new, backgroundColor: theme.gray300, borderTopRightRadius: 12, borderBottomRightRadius: 12 }]} />}
                        {total === 0 && <View style={[styles.chartSegment, { flex: 1, backgroundColor: theme.gray200, borderRadius: 12 }]} />}
                    </View>

                    <View style={styles.legendContainer}>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
                            <Text style={[styles.legendLabel, { color: theme.text }]}>Maîtrisés</Text>
                            <Text style={[styles.legendValue, { color: theme.textSecondary }]}>{breakdown.mastered} ({getPercent(breakdown.mastered).toFixed(0)}%)</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: theme.warning }]} />
                            <Text style={[styles.legendLabel, { color: theme.text }]}>En Révision</Text>
                            <Text style={[styles.legendValue, { color: theme.textSecondary }]}>{breakdown.review} ({getPercent(breakdown.review).toFixed(0)}%)</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: theme.secondary }]} />
                            <Text style={[styles.legendLabel, { color: theme.text }]}>En Apprentissage</Text>
                            <Text style={[styles.legendValue, { color: theme.textSecondary }]}>{breakdown.learning} ({getPercent(breakdown.learning).toFixed(0)}%)</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: theme.gray300 }]} />
                            <Text style={[styles.legendLabel, { color: theme.text }]}>Nouveaux</Text>
                            <Text style={[styles.legendValue, { color: theme.textSecondary }]}>{breakdown.new} ({getPercent(breakdown.new).toFixed(0)}%)</Text>
                        </View>
                    </View>
                </Card>
            </View>

            <View style={styles.actionContainer}>
                <Button
                    title="Déconnexion"
                    variant="danger"
                    onPress={signOut}
                    style={styles.logoutButton}
                />
                <Text style={[styles.versionText, { color: theme.textSecondary }]}>SmartRevision v1.0.0</Text>
            </View>
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
        marginBottom: 32,
    },
    avatarContainer: {
        padding: 4,
        borderRadius: 60,
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
    },
    avatarEmoji: {
        fontSize: 48,
    },
    username: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 4,
    },
    userSubtitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    settingsCard: {
        padding: 16,
        marginBottom: 32,
        borderRadius: 24,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
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
    },
    overviewValue: {
        fontSize: 36,
        fontWeight: '900',
        marginBottom: 8,
    },
    overviewLabel: {
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    chartCard: {
        padding: 24,
        marginBottom: 40,
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
        fontWeight: '700',
    },
    legendValue: {
        fontSize: 16,
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
        fontWeight: '600',
    },
});
