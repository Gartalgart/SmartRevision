import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, commonStyles } from '@/utils/styles';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button = ({ onPress, title, variant = 'primary', loading, disabled, style }: ButtonProps) => {
    const buttonStyle: ViewStyle = {
        ...commonStyles.button,
        ...getVariantStyle(variant),
        opacity: disabled ? 0.5 : 1,
        ...style,
    };

    const textStyle: TextStyle = {
        ...commonStyles.buttonText,
        color: getTextColor(variant),
    };

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor(variant)} />
            ) : (
                <Text style={textStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

function getVariantStyle(variant: string): ViewStyle {
    switch (variant) {
        case 'primary':
            return { backgroundColor: colors.primary };
        case 'secondary':
            return { backgroundColor: colors.secondary };
        case 'outline':
            return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary };
        case 'ghost':
            return { backgroundColor: 'transparent' };
        case 'danger':
            return { backgroundColor: colors.danger };
        case 'success':
            return { backgroundColor: colors.success };
        case 'warning':
            return { backgroundColor: colors.warning };
        default:
            return { backgroundColor: colors.primary };
    }
}

function getTextColor(variant: string): string {
    if (variant === 'outline' || variant === 'ghost') {
        return colors.primary;
    }
    return '#ffffff';
}
