import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { colors, commonStyles } from '../../utils/styles';

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
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const handlePressIn = () => {
        if (disabled || loading) return;
        scale.value = withSpring(0.95, { damping: 10, stiffness: 200 });
        opacity.value = withTiming(0.8, { duration: 100 });
    };

    const handlePressOut = () => {
        if (disabled || loading) return;
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
        opacity.value = withTiming(1, { duration: 100 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: disabled ? 0.5 : opacity.value,
    }));

    const baseButtonStyle: ViewStyle = {
        ...commonStyles.button,
        ...getVariantStyle(variant),
        ...style,
    };

    // Pour les boutons pleins, on ajoute une petite ombre "solide" en bas pour l'effet tactile
    const hasSolidShadow = variant !== 'outline' && variant !== 'ghost';
    
    if (hasSolidShadow) {
        baseButtonStyle.borderBottomWidth = 4;
        baseButtonStyle.borderColor = getShadowColor(variant);
    }

    const textStyles: TextStyle = {
        ...commonStyles.buttonText,
        color: getTextColor(variant),
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
                <ActivityIndicator color={getTextColor(variant)} />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </AnimatedPressable>
    );
};

function getVariantStyle(variant: string): ViewStyle {
    switch (variant) {
        case 'primary': return { backgroundColor: colors.primary };
        case 'secondary': return { backgroundColor: colors.secondary };
        case 'outline': return { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary };
        case 'ghost': return { backgroundColor: 'transparent' };
        case 'danger': return { backgroundColor: colors.danger };
        case 'success': return { backgroundColor: colors.success };
        case 'warning': return { backgroundColor: colors.warning };
        default: return { backgroundColor: colors.primary };
    }
}

function getShadowColor(variant: string): string {
    switch (variant) {
        case 'primary': return '#4338CA'; // Plus foncé que primary
        case 'secondary': return '#0096C7';
        case 'danger': return '#D90429';
        case 'success': return '#21863A';
        case 'warning': return '#E85D04';
        default: return '#4338CA';
    }
}

function getTextColor(variant: string): string {
    if (variant === 'outline' || variant === 'ghost') {
        return colors.primary;
    }
    return '#ffffff';
}
