import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Card } from '../ui/Card';
import { colors } from '../../utils/styles';
import { VocabularyItem } from '../../services/vocabulary.service';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

interface MCQReviewProps {
    item: VocabularyItem;
    allWords: VocabularyItem[];
    direction: 'eng-to-fra' | 'fra-to-eng';
    onAnswer: (isCorrect: boolean) => void;
}

export const MCQReview = ({ item, allWords, direction, onAnswer }: MCQReviewProps) => {
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const question = direction === 'eng-to-fra' ? item.english_word : item.french_translation;
    const correctAnswer = direction === 'eng-to-fra' ? item.french_translation : item.english_word;

    useEffect(() => {
        generateOptions();
        setSelectedOption(null);
    }, [item, direction]);

    const generateOptions = () => {
        const others = allWords.filter(w => w.id !== item.id);
        const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 3).map(w =>
            direction === 'eng-to-fra' ? w.french_translation : w.english_word
        );

        const allOptions = [...distractors, correctAnswer].sort(() => 0.5 - Math.random());
        setOptions(allOptions);
    };

    const handleSelect = (option: string) => {
        if (selectedOption) return;

        setSelectedOption(option);
        const isCorrect = option === correctAnswer;

        setTimeout(() => {
            onAnswer(isCorrect);
        }, 1200); // Un peu plus de temps pour voir la bonne réponse
    };

    return (
        <Animated.View entering={FadeInDown.springify()} style={styles.container}>
            <View style={styles.questionContainer}>
                <Text style={styles.questionLabel}>Traduisez ce mot</Text>
                <Text style={styles.questionWord}>{question}</Text>
            </View>

            <View style={styles.optionsGrid}>
                {options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === correctAnswer;
                    const showCorrect = selectedOption && isCorrect;

                    let buttonStyle = styles.optionButton;
                    let textStyle = styles.optionText;

                    if (selectedOption) {
                        if (isCorrect) {
                            buttonStyle = [styles.optionButton, styles.correctButton];
                            textStyle = [styles.optionText, styles.correctText];
                        } else if (isSelected) {
                            buttonStyle = [styles.optionButton, styles.wrongButton];
                            textStyle = [styles.optionText, styles.wrongText];
                        } else {
                            buttonStyle = [styles.optionButton, { opacity: 0.5 }];
                        }
                    }

                    return (
                        <Animated.View key={index} entering={ZoomIn.delay(100 * index).springify()} style={{ width: '100%' }}>
                            <TouchableOpacity
                                style={buttonStyle}
                                onPress={() => handleSelect(option)}
                                disabled={!!selectedOption}
                                activeOpacity={0.7}
                            >
                                <Text style={textStyle}>{option}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
    },
    questionContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    questionLabel: {
        fontSize: 18,
        color: colors.textSecondary,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    questionWord: {
        fontSize: 40,
        fontWeight: '900',
        color: colors.text,
        textAlign: 'center',
    },
    optionsGrid: {
        gap: 16,
        width: '100%',
    },
    optionButton: {
        backgroundColor: colors.card,
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.border,
        borderBottomWidth: 6, // Effet 3D
        alignItems: 'center',
        width: '100%',
    },
    optionText: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.text,
    },
    correctButton: {
        backgroundColor: '#D1FAE5', // emerald-100
        borderColor: colors.success,
        borderBottomColor: '#059669', // emerald-600
    },
    correctText: {
        color: '#065F46', // emerald-800
    },
    wrongButton: {
        backgroundColor: '#FFE4E6', // rose-100
        borderColor: colors.danger,
        borderBottomColor: '#E11D48', // rose-600
    },
    wrongText: {
        color: '#9F1239', // rose-800
    },
});
