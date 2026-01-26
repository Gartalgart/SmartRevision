export type Difficulty = 'easy' | 'medium' | 'hard' | 'incorrect';

interface SM2Input {
    easinessFactor: number;
    repetitions: number;
    intervalDays: number;
    status: 'new' | 'learning' | 'review' | 'mastered';
}

interface SM2Output {
    easinessFactor: number;
    repetitions: number;
    intervalDays: number;
    status: 'new' | 'learning' | 'review' | 'mastered';
}

export const calculateNextReview = (
    difficulty: Difficulty,
    current: SM2Input
): SM2Output => {
    let { easinessFactor, repetitions, intervalDays, status } = current;

    // Defaults if missing (sanity check)
    if (!easinessFactor) easinessFactor = 2.5;
    if (!repetitions) repetitions = 0;
    if (!intervalDays) intervalDays = 0;

    if (difficulty === 'incorrect') {
        return {
            easinessFactor: Math.max(1.3, easinessFactor - 0.20),
            repetitions: 0,
            intervalDays: 0,
            status: 'learning' // Reset to learning on failure
        };
    }

    // Correct answer logic

    // Calculate new EF
    if (difficulty === 'hard') {
        easinessFactor = Math.max(1.3, easinessFactor - 0.15);
    } else if (difficulty === 'easy') {
        easinessFactor += 0.15;
    }
    // Medium: unchanged

    // Calculate Interval and Repetitions
    if (difficulty === 'hard') {
        repetitions = 0;
        intervalDays = 1;
    } else {
        // Medium or Easy
        repetitions += 1;

        if (repetitions === 1) {
            // First successful review
            intervalDays = difficulty === 'easy' ? 7 : 3;
        } else {
            // Subsequent reviews
            // SM-2: I(n) = I(n-1) * EF
            intervalDays = Math.ceil(intervalDays * easinessFactor);
        }
    }

    // Status Transitions
    let nextStatus = status;
    if (status === 'new') {
        nextStatus = 'learning';
    } else if (status === 'learning') {
        if (repetitions >= 3) nextStatus = 'review';
    } else if (status === 'review') {
        if (repetitions >= 5 && intervalDays > 21) nextStatus = 'mastered';
    }

    return {
        easinessFactor,
        repetitions,
        intervalDays,
        status: nextStatus
    };
};
