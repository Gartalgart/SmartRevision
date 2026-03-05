import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VocabularyItem } from '../../services/vocabulary.service';
import { colors } from '../../utils/styles';

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
        }, 1200);
    };

    return (
        <View style={styles.container}>
            <View style={styles.questionContainer}>
                <Text style={styles.questionLabel}>Traduisez ce mot</Text>
                <Text style={styles.questionWord}>{question}</Text>
            </View>

            <View style={styles.optionsGrid}>
                {options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === correctAnswer;

                    let buttonStyle: any = styles.optionButton;
                    let textStyle: any = styles.optionText;

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
                        <View key={index} style={{ width: '100%' }}>
                            <TouchableOpacity
                                style={buttonStyle}
                                onPress={() => handleSelect(option)}
                                disabled={!!selectedOption}
                                activeOpacity={0.7}
                            >
                                <Text style={textStyle}>{option}</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
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
        borderBottomWidth: 6,
        alignItems: 'center',
        width: '100%',
    },
    optionText: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.text,
    },
    correctButton: {
        backgroundColor: '#D1FAE5',
        borderColor: colors.success,
        borderBottomColor: '#059669',
    },
    correctText: {
        color: '#065F46',
    },
    wrongButton: {
        backgroundColor: '#FFE4E6',
        borderColor: colors.danger,
        borderBottomColor: '#E11D48',
    },
    wrongText: {
        color: '#9F1239',
    },
});
