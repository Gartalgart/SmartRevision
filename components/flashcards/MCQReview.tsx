import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VocabularyItem } from '../../services/vocabulary.service';
import { useTheme } from '../../utils/styles';

interface MCQReviewProps {
    item: VocabularyItem;
    allWords: VocabularyItem[];
    direction: 'eng-to-fra' | 'fra-to-eng';
    onAnswer: (isCorrect: boolean) => void;
}

export const MCQReview = ({ item, allWords, direction, onAnswer }: MCQReviewProps) => {
    const theme = useTheme();
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
                <Text style={[styles.questionLabel, { color: theme.textSecondary }]}>Traduisez ce mot</Text>
                <Text style={[styles.questionWord, { color: theme.text }]}>{question}</Text>
            </View>

            <View style={styles.optionsGrid}>
                {options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === correctAnswer;

                    let buttonStyle: any = [styles.optionButton, { backgroundColor: theme.card, borderColor: theme.border }];
                    let textStyle: any = [styles.optionText, { color: theme.text }];

                    if (selectedOption) {
                        if (isCorrect) {
                            buttonStyle.push({ backgroundColor: theme.emerald100, borderColor: theme.success, borderBottomColor: theme.isDark ? '#047857' : '#059669' });
                            textStyle.push({ color: theme.isDark ? '#34D399' : '#065F46' });
                        } else if (isSelected) {
                            buttonStyle.push({ backgroundColor: theme.isDark ? '#451a1a' : '#FFE4E6', borderColor: theme.danger, borderBottomColor: theme.isDark ? '#BE123C' : '#E11D48' });
                            textStyle.push({ color: theme.isDark ? '#F87171' : '#9F1239' });
                        } else {
                            buttonStyle.push({ opacity: 0.5 });
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
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    questionWord: {
        fontSize: 40,
        fontWeight: '900',
        textAlign: 'center',
    },
    optionsGrid: {
        gap: 16,
        width: '100%',
    },
    optionButton: {
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderWidth: 2,
        borderBottomWidth: 6,
        alignItems: 'center',
        width: '100%',
    },
    optionText: {
        fontSize: 18,
        fontWeight: '800',
    },
});
