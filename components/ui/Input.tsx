import React from 'react';
import { TextInput, View, Text, TextInputProps, StyleSheet } from 'react-native';
import { useTheme, commonStyles } from '../../utils/styles';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            {label && <Text style={[commonStyles.label, { color: theme.text }]}>{label}</Text>}
            <TextInput
                placeholderTextColor={theme.gray400}
                style={[
                    commonStyles.input,
                    { 
                        backgroundColor: theme.card, 
                        borderColor: error ? theme.danger : theme.gray200,
                        color: theme.text 
                    },
                    style
                ]}
                {...props}
            />
            {error && <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    errorText: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 6,
        marginLeft: 4,
    },
});
