const { Difficulty, calculateNextReview } = require('./sm2.logic');

// This logic is copied from the frontend utils/sm2.ts
// to maintain consistency while moving the logic to the server.

const calculateSM2 = (difficulty, current) => {
    let { easinessFactor, repetitions, intervalDays, status } = current;

    if (!easinessFactor) easinessFactor = 2.5;
    if (repetitions === undefined) repetitions = 0;
    if (intervalDays === undefined) intervalDays = 0;

    if (difficulty === 'incorrect') {
        return {
            easinessFactor: Math.max(1.3, easinessFactor - 0.20),
            repetitions: 0,
            intervalDays: 0,
            status: 'learning'
        };
    }

    if (difficulty === 'hard') {
        easinessFactor = Math.max(1.3, easinessFactor - 0.15);
    } else if (difficulty === 'easy') {
        easinessFactor += 0.15;
    }

    if (difficulty === 'hard') {
        repetitions = 0;
        intervalDays = 1;
    } else {
        repetitions += 1;
        if (repetitions === 1) {
            intervalDays = difficulty === 'easy' ? 7 : 3;
        } else {
            intervalDays = Math.ceil(intervalDays * easinessFactor);
        }
    }

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

module.exports = { calculateSM2 };
