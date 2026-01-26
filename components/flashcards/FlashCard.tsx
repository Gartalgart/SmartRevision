import React, { useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '@/utils/styles';

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
            spin.value = withSpring(180);
            onFlip?.(true);
        } else {
            spin.value = withSpring(0);
            onFlip?.(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={flip}>
            <View style={styles.container}>
                {/* Front */}
                <Animated.View style={[styles.card, frontAnimatedStyle]}>
                    <Text style={styles.labelFront}>ANGLAIS</Text>
                    <Text style={styles.wordFront}>{englishWord}</Text>
                    <Text style={styles.hint}>Appuyez pour retourner</Text>
                </Animated.View>

                {/* Back */}
                <Animated.View style={[styles.card, backAnimatedStyle]}>
                    <Text style={styles.labelBack}>FRANÇAIS</Text>
                    <Text style={styles.wordBack}>{frenchTranslation}</Text>

                    {exampleSentence ? (
                        <View style={styles.exampleContainer}>
                            <Text style={styles.exampleText}>"{exampleSentence}"</Text>
                        </View>
                    ) : null}
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
        height: 450,
    },
    card: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: colors.card,
        borderRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    labelFront: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 32,
        letterSpacing: 2,
        opacity: 0.6,
    },
    labelBack: {
        color: colors.secondary,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 32,
        letterSpacing: 2,
        opacity: 0.6,
    },
    wordFront: {
        fontSize: 48,
        fontWeight: '800',
        textAlign: 'center',
        color: '#1f2937',
        lineHeight: 56,
    },
    wordBack: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        color: '#4b5563',
        marginBottom: 32,
        lineHeight: 44,
    },
    hint: {
        color: colors.gray300,
        marginTop: 48,
        fontSize: 14,
        fontWeight: '500',
    },
    exampleContainer: {
        backgroundColor: colors.indigo50,
        padding: 24,
        borderRadius: 16,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.indigo100,
    },
    exampleText: {
        color: colors.indigo800,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '500',
        fontStyle: 'italic',
        lineHeight: 28,
    },
});
