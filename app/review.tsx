import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DifficultyButtons } from '../components/flashcards/DifficultyButtons';
import { FlashCard } from '../components/flashcards/FlashCard';
import { MCQReview } from '../components/flashcards/MCQReview';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useReviewSession } from '../hooks/useReviewSession';
import { Difficulty } from '../utils/sm2';
import { commonStyles, useTheme } from '../utils/styles';

type ReviewMode = 'flashcard' | 'qcm-eng' | 'qcm-fra';

export default function Review() {
    const router = useRouter();
    const theme = useTheme();
    const { folderId } = useLocalSearchParams<{ folderId: string }>();
    const { dueReviews, allWords, isLoadingReviews, submitReview } = useReviewSession(folderId || null);

    const [mode, setMode] = useState<ReviewMode | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [sessionQueue, setSessionQueue] = useState<any[]>([]);
    const [autoPlay, setAutoPlay] = useState(true);

    useEffect(() => {
        if (dueReviews && dueReviews.length > 0 && sessionQueue.length === 0) {
            setSessionQueue([...dueReviews].sort(() => 0.5 - Math.random()));
        }
    }, [dueReviews]);

    const currentCard = sessionQueue[currentIndex];

    useEffect(() => {
        if (currentCard && autoPlay && mode !== 'qcm-fra') {
            speak(currentCard.english_word);
        }
    }, [currentCard, mode]);

    const speak = (text: string) => {
        Speech.stop();
        Speech.speak(text, { language: 'en-US', rate: 0.9 });
    };

    const handleRate = async (difficulty: Difficulty) => {
        if (!currentCard) return;

        try {
            await submitReview({
                itemId: currentCard.item_id || currentCard.id,
                difficulty
            });

            if (difficulty !== 'incorrect') {
                setCorrectCount(c => c + 1);
            }

            if (currentIndex < sessionQueue.length - 1) {
                setIsFlipped(false);
                setCurrentIndex(c => c + 1);
            } else {
                setSessionComplete(true);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Erreur", "Impossible de sauvegarder la révision.");
        }
    };

    const handleMCQAnswer = (isCorrect: boolean) => {
        handleRate(isCorrect ? 'medium' : 'incorrect');
    };

    if (isLoadingReviews && sessionQueue.length === 0) {
        return (
            <View style={[commonStyles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!isLoadingReviews && (!dueReviews || dueReviews.length === 0) && sessionQueue.length === 0) {
        return (
            <View style={[commonStyles.container, styles.center, { backgroundColor: theme.background }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.emerald100 }]}>
                    <FontAwesome name="check" size={60} color={theme.success} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Tout est à jour !</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Vous avez révisé tous vos mots pour aujourd'hui.</Text>
                <View style={styles.emptyButton}>
                    <Button title="Retourner à l'accueil" onPress={() => router.back()} />
                </View>
            </View>
        );
    }

    if (!mode && !sessionComplete) {
        return (
            <View style={[commonStyles.container, styles.modeSelection, { backgroundColor: theme.background }]}>
                <Text style={[styles.selectionTitle, { color: theme.text }]}>Choisissez un mode</Text>

                <TouchableOpacity activeOpacity={0.8} onPress={() => setMode('flashcard')}>
                    <Card style={[styles.modeCard, { borderColor: theme.indigo100, borderWidth: 2 }]}>
                        <View style={[styles.modeIconContainer, { backgroundColor: theme.indigo50 }]}>
                            <FontAwesome name="clone" size={32} color={theme.primary} />
                        </View>
                        <View style={styles.modeTextContainer}>
                            <Text style={[styles.modeTitle, { color: theme.text }]}>Flashcards</Text>
                            <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>Classique. Devinez et retournez la carte.</Text>
                        </View>
                        <FontAwesome name="chevron-right" size={16} color={theme.gray300} />
                    </Card>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={() => setMode('qcm-eng')}>
                    <Card style={[styles.modeCard, { borderColor: theme.emerald100, borderWidth: 2 }]}>
                        <View style={[styles.modeIconContainer, { backgroundColor: theme.emerald100 }]}>
                            <FontAwesome name="list-ul" size={32} color={theme.success} />
                        </View>
                        <View style={styles.modeTextContainer}>
                            <Text style={[styles.modeTitle, { color: theme.text }]}>QCM (Anglais → Français)</Text>
                            <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>Trouvez la bonne traduction parmi 4 choix.</Text>
                        </View>
                        <FontAwesome name="chevron-right" size={16} color={theme.gray300} />
                    </Card>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={() => setMode('qcm-fra')}>
                    <Card style={[styles.modeCard, { borderColor: theme.amber100, borderWidth: 2 }]}>
                        <View style={[styles.modeIconContainer, { backgroundColor: theme.amber100 }]}>
                            <FontAwesome name="language" size={32} color={theme.warning} />
                        </View>
                        <View style={styles.modeTextContainer}>
                            <Text style={[styles.modeTitle, { color: theme.text }]}>QCM (Français → Anglais)</Text>
                            <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>Entraînez-vous dans le sens inverse.</Text>
                        </View>
                        <FontAwesome name="chevron-right" size={16} color={theme.gray300} />
                    </Card>
                </TouchableOpacity>

                <View>
                    <Button title="Annuler" variant="ghost" onPress={() => router.back()} style={{ marginTop: 20 }} />
                </View>
            </View>
        );
    }

    if (sessionComplete) {
        return (
            <View style={[commonStyles.container, styles.center, { backgroundColor: theme.background }]}>
                <Text style={styles.celebrationEmoji}>🎉</Text>
                <Text style={[styles.completeTitle, { color: theme.text }]}>Session terminée !</Text>
                <Text style={[styles.completeSubtitle, { color: theme.textSecondary }]}>
                    Vous avez maîtrisé {correctCount} sur {sessionQueue.length} mots.
                </Text>
                <View style={[styles.completeScoreBox, { backgroundColor: theme.indigo50, borderColor: theme.primaryLight }]}>
                    <Text style={[styles.scoreText, { color: theme.primary }]}>{Math.round((correctCount / sessionQueue.length) * 100)}%</Text>
                    <Text style={[styles.scoreLabel, { color: theme.primary }]}>de réussite</Text>
                </View>
                <View style={styles.completeButton}>
                    <Button title="Super !" onPress={() => router.back()} variant="primary" />
                </View>
            </View>
        );
    }

    if (!currentCard) return null;

    const progress = ((currentIndex) / sessionQueue.length) * 100;

    return (
        <View style={[commonStyles.container, styles.reviewContainer, { backgroundColor: theme.background }]}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => setMode(null)} style={styles.closeButton}>
                    <FontAwesome name="close" size={24} color={theme.gray400} />
                </TouchableOpacity>
                <View style={[styles.progressBarContainer, { backgroundColor: theme.gray200 }]}>
                    <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.success }]} />
                </View>
                <TouchableOpacity onPress={() => setAutoPlay(!autoPlay)} style={styles.audioButton}>
                    <FontAwesome name={autoPlay ? "volume-up" : "volume-off"} size={24} color={autoPlay ? theme.primary : theme.gray400} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                {mode === 'flashcard' ? (
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <FlashCard
                            key={currentCard.id}
                            englishWord={currentCard.english_word}
                            frenchTranslation={currentCard.french_translation}
                            exampleSentence={currentCard.example_sentence}
                            onFlip={setIsFlipped}
                        />
                        <TouchableOpacity
                            style={[styles.speakButtonOverlay, { backgroundColor: theme.indigo50, borderColor: theme.primaryLight }]}
                            onPress={() => speak(currentCard.english_word)}
                        >
                            <FontAwesome name="volume-up" size={20} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <MCQReview
                        key={currentCard.id}
                        item={currentCard}
                        allWords={allWords || []}
                        direction={mode === 'qcm-eng' ? 'eng-to-fra' : 'fra-to-eng'}
                        onAnswer={handleMCQAnswer}
                    />
                )}
            </View>

            {mode === 'flashcard' && (
                <View style={styles.controlsContainer}>
                    {isFlipped ? (
                        <DifficultyButtons onRate={handleRate} />
                    ) : (
                        <Text style={[styles.hintText, { color: theme.gray400 }]}>Appuyez sur la carte pour révéler la réponse</Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    emptyButton: {
        width: '100%',
    },
    reviewContainer: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    modeSelection: {
        padding: 20,
        paddingTop: 60,
        justifyContent: 'center',
    },
    selectionTitle: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 32,
        textAlign: 'center',
    },
    modeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        marginBottom: 16,
        borderRadius: 24,
    },
    modeIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    modeTextContainer: {
        flex: 1,
    },
    modeTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    modeDesc: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    closeButton: {
        padding: 8,
    },
    audioButton: {
        padding: 8,
    },
    progressBarContainer: {
        flex: 1,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 16,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 6,
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    speakButtonOverlay: {
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 10,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        borderWidth: 2,
    },
    controlsContainer: {
        height: 100,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    hintText: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 20,
    },
    celebrationEmoji: {
        fontSize: 80,
        marginBottom: 24,
    },
    completeTitle: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 12,
    },
    completeSubtitle: {
        fontSize: 18,
        marginBottom: 32,
        textAlign: 'center',
        fontWeight: '600',
    },
    completeScoreBox: {
        paddingVertical: 24,
        paddingHorizontal: 48,
        borderRadius: 32,
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 2,
    },
    scoreText: {
        fontSize: 48,
        fontWeight: '900',
    },
    scoreLabel: {
        fontSize: 16,
        fontWeight: '700',
        opacity: 0.8,
    },
    completeButton: {
        width: '100%',
    },
});
