import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Card } from '../ui/Card';
import { colors } from '@/utils/styles';
import { VocabularyItem } from '@/services/vocabulary.service';

interface MCQReviewProps {
    item: VocabularyItem;
    allWords: VocabularyItem[];
    direction: 'eng-to-fra' | 'fra-to-eng';
    onAnswer: (isCorrect: boolean) => void;
}

export const MCQReview = ({ item, allWords, direction, onAnswer }: MCQReviewProps) => {
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [startTime, setStartTime] = useState(Date.now());

    const question = direction === 'eng-to-fra' ? item.english_word : item.french_translation;
    const correctAnswer = direction === 'eng-to-fra' ? item.french_translation : item.english_word;

    useEffect(() => {
        generateOptions();
        setSelectedOption(null);
        setStartTime(Date.now());
    }, [item, direction]);

    const generateOptions = () => {
        // Filter out the current item
        const others = allWords.filter(w => w.id !== item.id);

        // Pick 3 random distractors
        const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 3).map(w =>
            direction === 'eng-to-fra' ? w.french_translation : w.english_word
        );

        // Add correct answer and shuffle
        const allOptions = [...distractors, correctAnswer].sort(() => 0.5 - Math.random());
        setOptions(allOptions);
    };

    const handleSelect = (option: string) => {
        if (selectedOption) return;

        setSelectedOption(option);
        const isCorrect = option === correctAnswer;

        // Auto-advance after 1 second?
        setTimeout(() => {
            onAnswer(isCorrect);
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <Card style={styles.questionCard}>
                <Text style={styles.questionLabel}>Comment dit-on ?</Text>
                <Text style={styles.questionWord}>{question}</Text>
            </Card>

            <View style={styles.optionsGrid}>
                {options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === correctAnswer;

                    let buttonStyle = styles.optionButton;
                    let textStyle = styles.optionText;

                    if (selectedOption) {
                        if (isCorrect) {
                            buttonStyle = [styles.optionButton, styles.correctButton];
                            textStyle = [styles.optionText, styles.correctText];
                        } else if (isSelected) {
                            buttonStyle = [styles.optionButton, styles.wrongButton];
                            textStyle = [styles.optionText, styles.wrongText];
                        }
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            style={buttonStyle}
                            onPress={() => handleSelect(option)}
                            disabled={!!selectedOption}
                        >
                            <Text style={textStyle}>{option}</Text>
                        </TouchableOpacity>
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
    },
    questionCard: {
        paddingVertical: 40,
        alignItems: 'center',
        marginBottom: 32,
        backgroundColor: colors.indigo50,
        borderWidth: 0,
    },
    questionLabel: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    questionWord: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.text,
        textAlign: 'center',
    },
    optionsGrid: {
        gap: 12,
    },
    optionButton: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.gray100,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    optionText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    correctButton: {
        borderColor: colors.success,
        backgroundColor: '#ecfdf5',
    },
    correctText: {
        color: colors.success,
    },
    wrongButton: {
        borderColor: colors.danger,
        backgroundColor: '#fef2f2',
    },
    wrongText: {
        color: colors.danger,
    },
});
