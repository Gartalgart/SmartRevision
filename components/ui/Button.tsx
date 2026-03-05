import React from 'react';
import { ActivityIndicator, Pressable, Text, TextStyle, ViewStyle } from 'react-native';
import { commonStyles, useTheme } from '../../utils/styles';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button = ({ onPress, title, variant = 'primary', loading, disabled, style, textStyle: customTextStyle }: ButtonProps) => {
    const theme = useTheme();

    const vStyle = getVariantStyle(variant, theme);
    const sColor = getShadowColor(variant, theme);
    const tColor = getTextColor(variant, theme);

    const baseButtonStyle: ViewStyle = {
        ...commonStyles.button,
        backgroundColor: vStyle.backgroundColor,
        borderColor: vStyle.borderColor || 'transparent',
        borderBottomColor: sColor,
        opacity: disabled ? 0.5 : 1,
        ...style,
    };

    const hasSolidShadow = variant !== 'outline' && variant !== 'ghost';
    if (hasSolidShadow) {
        baseButtonStyle.borderBottomWidth = 4;
    }

    const textStyles: TextStyle = {
        ...commonStyles.buttonText,
        color: tColor,
        ...customTextStyle,
    };

    return (
        <Pressable
            style={({ pressed }) => [
                baseButtonStyle,
                pressed && !disabled && { opacity: 0.8, transform: [{ scale: 0.98 }] }
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={tColor} />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </Pressable>
    );
};

function getVariantStyle(variant: string, theme: any): ViewStyle {
    switch (variant) {
        case 'primary': return { backgroundColor: theme.primary };
        case 'secondary': return { backgroundColor: theme.secondary };
        case 'outline': return { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.primary };
        case 'ghost': return { backgroundColor: 'transparent' };
        case 'danger': return { backgroundColor: theme.danger };
        case 'success': return { backgroundColor: theme.success };
        case 'warning': return { backgroundColor: theme.warning };
        default: return { backgroundColor: theme.primary };
    }
}

function getShadowColor(variant: string, theme: any): string {
    switch (variant) {
        case 'primary': return theme.isDark ? '#312E81' : '#4338CA';
        case 'secondary': return '#0096C7';
        case 'danger': return '#B91C1C';
        case 'success': return '#059669';
        case 'warning': return '#D97706';
        default: return '#4338CA';
    }
}

function getTextColor(variant: string, theme: any): string {
    if (variant === 'outline' || variant === 'ghost') {
        return theme.primary;
    }
    return '#ffffff';
}
