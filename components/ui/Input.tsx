import React from 'react';
import { TextInput, View, Text, TextInputProps, StyleSheet } from 'react-native';
import { colors, commonStyles } from '@/utils/styles';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
    return (
        <View style={styles.container}>
            {label && <Text style={commonStyles.label}>{label}</Text>}
            <TextInput
                placeholderTextColor={colors.gray400}
                style={[
                    commonStyles.input,
                    error ? commonStyles.inputError : null,
                    style
                ]}
                {...props}
            />
            {error && <Text style={commonStyles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
});
