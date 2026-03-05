import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../utils/styles';

interface FlashCardProps {
    englishWord: string;
    frenchTranslation: string;
    exampleSentence?: string | null;
    onFlip?: (isFlipped: boolean) => void;
    reset?: boolean;
}

export const FlashCard = ({ englishWord, frenchTranslation, exampleSentence, onFlip, reset }: FlashCardProps) => {
    const theme = useTheme();
    const spin = useSharedValue(0);

    useEffect(() => {
        if (reset) {
            spin.value = 0;
        }
    }, [reset]);

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const spinVal = interpolate(spin.value, [0, 180], [0, 180]);
        return {
            transform: [{ rotateY: `${spinVal}deg` }],
            opacity: spin.value < 90 ? 1 : 0,
            zIndex: spin.value < 90 ? 1 : 0,
            backgroundColor: withTiming(theme.card),
            borderColor: withTiming(theme.border),
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const spinVal = interpolate(spin.value, [0, 180], [180, 360]);
        return {
            transform: [{ rotateY: `${spinVal}deg` }],
            opacity: spin.value >= 90 ? 1 : 0,
            zIndex: spin.value >= 90 ? 1 : 0,
            backgroundColor: withTiming(theme.isDark ? theme.gray100 : '#F8FAFC'),
            borderColor: withTiming(theme.isDark ? theme.gray200 : '#E2E8F0'),
        };
    });

    const flip = () => {
        if (spin.value < 90) {
            spin.value = withSpring(180, { damping: 12, stiffness: 100 });
            onFlip?.(true);
        } else {
            spin.value = withSpring(0, { damping: 12, stiffness: 100 });
            onFlip?.(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={flip}>
            <View style={styles.container}>
                {/* Front */}
                <Animated.View style={[styles.card, styles.frontCard, frontAnimatedStyle]}>
                    <View style={styles.topRow}>
                        <Text style={[styles.label, { color: theme.primary }]}>ANGLAIS</Text>
                        <Text style={styles.emoji}>🇬🇧</Text>
                    </View>
                    <View style={styles.centerContent}>
                        <Text style={[styles.wordFront, { color: theme.text }]}>{englishWord}</Text>
                    </View>
                    <View style={styles.bottomRow}>
                        <FontAwesome name="hand-pointer-o" size={16} color={theme.primaryLight} />
                        <Text style={[styles.hint, { color: theme.textSecondary }]}>Appuyez pour retourner</Text>
                    </View>
                </Animated.View>

                {/* Back */}
                <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
                    <View style={styles.topRow}>
                        <Text style={[styles.label, { color: theme.success }]}>FRANÇAIS</Text>
                        <Text style={styles.emoji}>🇫🇷</Text>
                    </View>
                    <View style={styles.centerContent}>
                        <Text style={[styles.wordBack, { color: theme.text }]}>{frenchTranslation}</Text>
                        {exampleSentence ? (
                            <View style={[styles.exampleContainer, { backgroundColor: theme.indigo50, borderColor: theme.primaryLight }]}>
                                <FontAwesome name="quote-left" size={12} color={theme.primaryLight} style={styles.quoteIcon} />
                                <Text style={[styles.exampleText, { color: theme.primary }]}>{exampleSentence}</Text>
                            </View>
                        ) : null}
                    </View>
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 500, // Légèrement plus haut
        perspective: 1000, // Ajoute un effet 3D plus réaliste
    },
    card: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 32,
        padding: 24,
        backfaceVisibility: 'hidden',
    },
    frontCard: {
        borderWidth: 3,
        borderBottomWidth: 8, // Effet 3D "posé" on table
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    backCard: {
        borderWidth: 3,
        borderBottomWidth: 8,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
    },
    emoji: {
        fontSize: 24,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wordFront: {
        fontSize: 48,
        fontWeight: '900',
        textAlign: 'center',
        lineHeight: 56,
    },
    wordBack: {
        fontSize: 40,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 48,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 'auto',
    },
    hint: {
        fontSize: 14,
        fontWeight: '700',
    },
    exampleContainer: {
        padding: 20,
        borderRadius: 20,
        width: '100%',
        borderWidth: 2,
        alignItems: 'center',
    },
    quoteIcon: {
        marginBottom: 8,
    },
    exampleText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        fontStyle: 'italic',
        lineHeight: 26,
    },
});
