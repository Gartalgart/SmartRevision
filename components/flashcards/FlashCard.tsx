import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
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
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (reset) {
            setIsFlipped(false);
        }
    }, [reset]);

    const flip = () => {
        const nextState = !isFlipped;
        setIsFlipped(nextState);
        onFlip?.(nextState);
    };

    return (
        <TouchableWithoutFeedback onPress={flip}>
            <View style={styles.container}>
                {!isFlipped ? (
                    /* Front */
                    <View style={[styles.card, styles.frontCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
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
                    </View>
                ) : (
                    /* Back */
                    <View style={[styles.card, styles.backCard, { backgroundColor: theme.isDark ? theme.gray100 : '#F8FAFC', borderColor: theme.isDark ? theme.gray200 : '#E2E8F0' }]}>
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
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 500,
    },
    card: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 32,
        padding: 24,
    },
    frontCard: {
        borderWidth: 3,
        borderBottomWidth: 8,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
            },
            android: {
                // Supprimé pour éviter les crashs
            }
        })
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
