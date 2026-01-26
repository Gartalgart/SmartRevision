import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useReviewSession } from '@/hooks/useReviewSession';
import { FlashCard } from '@/components/flashcards/FlashCard';
import { MCQReview } from '@/components/flashcards/MCQReview';
import { DifficultyButtons } from '@/components/flashcards/DifficultyButtons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Difficulty } from '@/utils/sm2';
import { colors, commonStyles } from '@/utils/styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type ReviewMode = 'flashcard' | 'qcm-eng' | 'qcm-fra';

export default function Review() {
    const router = useRouter();
    const { folderId } = useLocalSearchParams<{ folderId: string }>();
    const { dueReviews, allWords, isLoadingReviews, submitReview } = useReviewSession(folderId || null);

    const [mode, setMode] = useState<ReviewMode | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [sessionQueue, setSessionQueue] = useState<any[]>([]);

    useEffect(() => {
        if (dueReviews && dueReviews.length > 0 && sessionQueue.length === 0) {
            setSessionQueue([...dueReviews].sort(() => 0.5 - Math.random()));
        }
    }, [dueReviews]);

    const currentCard = sessionQueue[currentIndex];

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
        }
    };

    const handleMCQAnswer = (isCorrect: boolean) => {
        handleRate(isCorrect ? 'medium' : 'incorrect');
    };

    if (isLoadingReviews && sessionQueue.length === 0) {
        return (
            <View style={[commonStyles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!isLoadingReviews && (!dueReviews || dueReviews.length === 0) && sessionQueue.length === 0) {
        return (
            <View style={[commonStyles.container, styles.center]}>
                <Text style={styles.emptyTitle}>Rien à réviser !</Text>
                <Text style={styles.emptySubtitle}>Revenez plus tard ou ajoutez de nouveaux mots.</Text>
                <View style={styles.emptyButton}>
                    <Button title="Retour" onPress={() => router.back()} />
                </View>
            </View>
        );
    }

    // Mode Selection Screen
    if (!mode && !sessionComplete) {
        return (
            <View style={[commonStyles.container, styles.modeSelection]}>
                <Text style={styles.selectionTitle}>Comment voulez-vous réviser ?</Text>

                <TouchableOpacity style={styles.modeCard} onPress={() => setMode('flashcard')}>
                    <Card style={styles.modeCardInner}>
                        <FontAwesome name="clone" size={32} color={colors.primary} />
                        <View style={styles.modeTextContainer}>
                            <Text style={styles.modeTitle}>Flashcards classiques</Text>
                            <Text style={styles.modeDesc}>Retournez la carte et évaluez votre mémoire.</Text>
                        </View>
                    </Card>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modeCard} onPress={() => setMode('qcm-eng')}>
                    <Card style={styles.modeCardInner}>
                        <FontAwesome name="list-ul" size={32} color={colors.success} />
                        <View style={styles.modeTextContainer}>
                            <Text style={styles.modeTitle}>QCM (Anglais → Français)</Text>
                            <Text style={styles.modeDesc}>Choisissez la bonne traduction parmi 4 options.</Text>
                        </View>
                    </Card>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modeCard} onPress={() => setMode('qcm-fra')}>
                    <Card style={styles.modeCardInner}>
                        <FontAwesome name="language" size={32} color={colors.warning} />
                        <View style={styles.modeTextContainer}>
                            <Text style={styles.modeTitle}>QCM (Français → Anglais)</Text>
                            <Text style={styles.modeDesc}>Traduisez les mots français vers l'anglais.</Text>
                        </View>
                    </Card>
                </TouchableOpacity>

                <Button title="Annuler" variant="ghost" onPress={() => router.back()} style={{ marginTop: 20 }} />
            </View>
        );
    }

    if (sessionComplete) {
        return (
            <View style={[commonStyles.container, styles.center]}>
                <Text style={styles.celebrationEmoji}>🎉</Text>
                <Text style={styles.completeTitle}>Session terminée !</Text>
                <Text style={styles.completeSubtitle}>
                    Vous avez maîtrisé {correctCount} sur {sessionQueue.length} mots.{"\n"}Continuez comme ça !
                </Text>
                <View style={styles.completeButton}>
                    <Button title="Retour à l'accueil" onPress={() => router.back()} />
                </View>
            </View>
        );
    }

    if (!currentCard) return null;

    const progress = ((currentIndex) / sessionQueue.length) * 100;

    return (
        <View style={[commonStyles.container, styles.reviewContainer]}>
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            <View style={styles.topInfo}>
                <Text style={styles.progressText}>
                    Mot {currentIndex + 1} sur {sessionQueue.length}
                </Text>
                <TouchableOpacity onPress={() => setMode(null)}>
                    <Text style={styles.changeModeText}>Changer de mode</Text>
                </TouchableOpacity>
            </View>

            {/* Card Area */}
            <View style={styles.cardContainer}>
                {mode === 'flashcard' ? (
                    <FlashCard
                        key={currentCard.id}
                        englishWord={currentCard.english_word}
                        frenchTranslation={currentCard.french_translation}
                        exampleSentence={currentCard.example_sentence}
                        onFlip={setIsFlipped}
                    />
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

            {/* Controls */}
            {mode === 'flashcard' && (
                <View style={styles.controlsContainer}>
                    {isFlipped ? (
                        <DifficultyButtons onRate={handleRate} />
                    ) : (
                        <Text style={styles.hint}>Appuyez sur la carte pour voir la réponse</Text>
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
    reviewContainer: {
        paddingTop: 16,
        paddingBottom: 32,
        paddingHorizontal: 16,
    },
    modeSelection: {
        padding: 24,
        justifyContent: 'center',
    },
    selectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 32,
        textAlign: 'center',
    },
    modeCard: {
        marginBottom: 16,
    },
    modeCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 20,
    },
    modeTextContainer: {
        flex: 1,
    },
    modeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    modeDesc: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    topInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    changeModeText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: colors.gray200,
        borderRadius: 4,
        marginBottom: 8,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    progressText: {
        color: colors.gray400,
        fontWeight: '500',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        marginBottom: 32,
    },
    controlsContainer: {
        height: 96,
        justifyContent: 'flex-end',
    },
    hint: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: 16,
    },
    emptyTitle: {
        fontSize: 20,
        marginBottom: 16,
        color: colors.text,
        fontWeight: 'bold',
    },
    emptySubtitle: {
        color: colors.gray500,
        textAlign: 'center',
        marginBottom: 32,
    },
    emptyButton: {
        width: '100%',
    },
    celebrationEmoji: {
        fontSize: 60,
        marginBottom: 24,
    },
    completeTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 16,
        color: colors.primary,
    },
    completeSubtitle: {
        fontSize: 18,
        marginBottom: 32,
        color: colors.gray500,
        textAlign: 'center',
    },
    completeButton: {
        width: '100%',
    },
});
