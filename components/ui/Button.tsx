import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({ onPress, title, variant = 'primary', loading, disabled, style, textStyle: customTextStyle }: ButtonProps) => {
    const theme = useTheme();
    const scale = useSharedValue(1);
    const pressOpacity = useSharedValue(1);

    const handlePressIn = () => {
        if (disabled || loading) return;
        scale.value = withSpring(0.95, { damping: 10, stiffness: 200 });
        pressOpacity.value = withTiming(0.8, { duration: 100 });
    };

    const handlePressOut = () => {
        if (disabled || loading) return;
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
        pressOpacity.value = withTiming(1, { duration: 100 });
    };

    const animatedStyle = useAnimatedStyle(() => {
        const vStyle = getVariantStyle(variant, theme);
        const sColor = getShadowColor(variant, theme);
        return {
            transform: [{ scale: scale.value }],
            opacity: disabled ? 0.5 : pressOpacity.value,
            backgroundColor: withTiming(vStyle.backgroundColor as string),
            borderColor: withTiming((vStyle.borderColor as string) || 'transparent'),
            borderBottomColor: withTiming(sColor),
        };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        const tColor = getTextColor(variant, theme);
        return {
            color: withTiming(tColor),
        };
    });

    const baseButtonStyle: ViewStyle = {
        ...commonStyles.button,
        ...style,
    };

    const hasSolidShadow = variant !== 'outline' && variant !== 'ghost';
    if (hasSolidShadow) {
        baseButtonStyle.borderBottomWidth = 4;
    }

    const textStyles: TextStyle = {
        ...commonStyles.buttonText,
        ...customTextStyle,
    };

    return (
        <AnimatedPressable
            style={[baseButtonStyle, animatedStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor(variant, theme)} />
            ) : (
                <Animated.Text style={[textStyles, animatedTextStyle]}>{title}</Animated.Text>
            )}
        </AnimatedPressable>
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
    // On simule une ombre plus foncée en fonction de la couleur
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
