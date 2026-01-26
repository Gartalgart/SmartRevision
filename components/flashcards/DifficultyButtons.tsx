import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Difficulty } from '@/utils/sm2';
import { colors } from '@/utils/styles';

interface DifficultyButtonsProps {
    onRate: (difficulty: Difficulty) => void;
    disabled?: boolean;
}

export const DifficultyButtons = ({ onRate, disabled }: DifficultyButtonsProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.buttonWrapper}>
                <Button
                    title="Difficile"
                    variant="danger"
                    onPress={() => onRate('hard')}
                    disabled={disabled}
                />
                <Text style={styles.label}>1 jour</Text>
            </View>
            <View style={styles.buttonWrapper}>
                <Button
                    title="Moyen"
                    variant="warning"
                    onPress={() => onRate('medium')}
                    disabled={disabled}
                />
                <Text style={styles.label}>3 jours</Text>
            </View>
            <View style={styles.buttonWrapper}>
                <Button
                    title="Facile"
                    variant="success"
                    onPress={() => onRate('easy')}
                    disabled={disabled}
                />
                <Text style={styles.label}>7 jours</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
        paddingHorizontal: 8,
        paddingBottom: 32,
    },
    buttonWrapper: {
        flex: 1,
    },
    label: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.gray400,
        marginTop: 8,
        fontWeight: '500',
    },
});
