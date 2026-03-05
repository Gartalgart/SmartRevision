import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';
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

    const animatedTextStyle = useAnimatedStyle(() => ({
        color: withTiming(theme.text),
    }));

    const animatedSubTextStyle = useAnimatedStyle(() => ({
        color: withTiming(theme.textSecondary),
    }));

    return (
        <ScrollView
            style={commonStyles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={isLoadingReviews} onRefresh={refetchReviews} tintColor={theme.primary} />}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
                <View style={[styles.avatarContainer, Platform.OS === 'ios' ? { shadowColor: theme.primary } : {}]}>
                    <View style={[styles.avatar, { backgroundColor: theme.indigo50, borderColor: theme.indigo100 }]}>
                        <Text style={styles.avatarEmoji}>🎓</Text>
                    </View>
                </View>
                <Animated.Text style={[styles.username, animatedTextStyle]}>Étudiant</Animated.Text>
                <Animated.Text style={[styles.userSubtitle, animatedSubTextStyle]}>Membre depuis aujourd'hui</Animated.Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
                <Card style={styles.settingsCard}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <FontAwesome name={isDark ? "moon-o" : "sun-o"} size={20} color={theme.primary} style={{ marginRight: 12 }} />
                            <Animated.Text style={[styles.settingLabel, animatedTextStyle]}>Mode Sombre</Animated.Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: theme.gray300, true: theme.primary }}
                            thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                        />
                    </View>
                </Card>
            </Animated.View>

            <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={[styles.sectionTitle, { color: theme.text }]}>Statistiques Globales</Animated.Text>

            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.overviewGrid}>
                <Card style={[styles.overviewCard, { borderColor: theme.indigo100, borderWidth: 2 }]}>
                    <Animated.Text style={[styles.overviewValue, { color: theme.primary }]}>{total}</Animated.Text>
                    <Animated.Text style={[styles.overviewLabel, animatedSubTextStyle]}>Mots Total</Animated.Text>
                </Card>
                <Card style={[styles.overviewCard, { borderColor: theme.amber100, borderWidth: 2 }]}>
                    <Animated.Text style={[styles.overviewValue, { color: theme.warning }]}>{(stats as any)?.dueCount || 0}</Animated.Text>
                    <Animated.Text style={[styles.overviewLabel, animatedSubTextStyle]}>À Réviser</Animated.Text>
                </Card>
            </Animated.View>

            <Animated.Text entering={FadeInDown.delay(400).duration(400)} style={[styles.sectionTitle, { color: theme.text }]}>Progression</Animated.Text>

            <Animated.View entering={FadeInDown.delay(500).duration(400)}>
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
                            <Animated.Text style={[styles.legendLabel, animatedTextStyle]}>Maîtrisés</Animated.Text>
                            <Animated.Text style={[styles.legendValue, animatedSubTextStyle]}>{breakdown.mastered} ({getPercent(breakdown.mastered).toFixed(0)}%)</Animated.Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: theme.warning }]} />
                            <Animated.Text style={[styles.legendLabel, animatedTextStyle]}>En Révision</Animated.Text>
                            <Animated.Text style={[styles.legendValue, animatedSubTextStyle]}>{breakdown.review} ({getPercent(breakdown.review).toFixed(0)}%)</Animated.Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: theme.secondary }]} />
                            <Animated.Text style={[styles.legendLabel, animatedTextStyle]}>En Apprentissage</Animated.Text>
                            <Animated.Text style={[styles.legendValue, animatedSubTextStyle]}>{breakdown.learning} ({getPercent(breakdown.learning).toFixed(0)}%)</Animated.Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: theme.gray300 }]} />
                            <Animated.Text style={[styles.legendLabel, animatedTextStyle]}>Nouveaux</Animated.Text>
                            <Animated.Text style={[styles.legendValue, animatedSubTextStyle]}>{breakdown.new} ({getPercent(breakdown.new).toFixed(0)}%)</Animated.Text>
                        </View>
                    </View>
                </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.actionContainer}>
                <Button
                    title="Déconnexion"
                    variant="danger"
                    onPress={signOut}
                    style={styles.logoutButton}
                />
                <Animated.Text style={[styles.versionText, animatedSubTextStyle]}>SmartRevision v1.0.0</Animated.Text>
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
        marginBottom: 32,
    },
    avatarContainer: {
        padding: 4,
        borderRadius: 60,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            }
        }),
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
        shadowOpacity: 0,
        elevation: 0,
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
