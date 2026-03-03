import React, { useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '../../utils/styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface FlashCardProps {
    englishWord: string;
    frenchTranslation: string;
    exampleSentence?: string | null;
    onFlip?: (isFlipped: boolean) => void;
    reset?: boolean;
}

export const FlashCard = ({ englishWord, frenchTranslation, exampleSentence, onFlip, reset }: FlashCardProps) => {
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
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const spinVal = interpolate(spin.value, [0, 180], [180, 360]);
        return {
            transform: [{ rotateY: `${spinVal}deg` }],
            opacity: spin.value >= 90 ? 1 : 0,
            zIndex: spin.value >= 90 ? 1 : 0,
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
                        <Text style={styles.label}>ANGLAIS</Text>
                        <Text style={styles.emoji}>🇬🇧</Text>
                    </View>
                    <View style={styles.centerContent}>
                        <Text style={styles.wordFront}>{englishWord}</Text>
                    </View>
                    <View style={styles.bottomRow}>
                        <FontAwesome name="hand-pointer-o" size={16} color={colors.primaryLight} />
                        <Text style={styles.hint}>Appuyez pour retourner</Text>
                    </View>
                </Animated.View>

                {/* Back */}
                <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
                     <View style={styles.topRow}>
                        <Text style={[styles.label, {color: colors.success}]}>FRANÇAIS</Text>
                        <Text style={styles.emoji}>🇫🇷</Text>
                    </View>
                    <View style={styles.centerContent}>
                        <Text style={styles.wordBack}>{frenchTranslation}</Text>
                        {exampleSentence ? (
                            <View style={styles.exampleContainer}>
                                <FontAwesome name="quote-left" size={12} color={colors.primaryLight} style={styles.quoteIcon} />
                                <Text style={styles.exampleText}>{exampleSentence}</Text>
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
        backgroundColor: colors.card,
        borderWidth: 3,
        borderColor: colors.border,
        borderBottomWidth: 8, // Effet 3D "posé" sur la table
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    backCard: {
        backgroundColor: '#F8FAFC', // Gris très très clair
        borderWidth: 3,
        borderColor: '#E2E8F0',
        borderBottomWidth: 8,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        color: colors.primary,
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
        color: colors.text,
        lineHeight: 56,
    },
    wordBack: {
        fontSize: 40,
        fontWeight: '900',
        textAlign: 'center',
        color: colors.text,
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
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '700',
    },
    exampleContainer: {
        backgroundColor: colors.indigo50,
        padding: 20,
        borderRadius: 20,
        width: '100%',
        borderWidth: 2,
        borderColor: colors.primaryLight,
        alignItems: 'center',
    },
    quoteIcon: {
        marginBottom: 8,
    },
    exampleText: {
        color: colors.primary,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        fontStyle: 'italic',
        lineHeight: 26,
    },
});
