import React, { useMemo } from 'react';
import { StyleSheet, ViewProps, ViewStyle } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { commonStyles, useTheme } from '../../utils/styles';

interface CardProps extends ViewProps {
    delay?: number;
    animated?: boolean;
}

export const Card = ({ children, style, delay = 0, animated = false, ...props }: CardProps) => {
    const theme = useTheme();

    // Flatten the style prop to check if a custom backgroundColor is provided
    const flatStyle = useMemo(() => StyleSheet.flatten(style) as ViewStyle | undefined, [style]);
    const hasCustomBg = !!flatStyle?.backgroundColor;

    const animatedStyle = useAnimatedStyle(() => ({
        ...(!hasCustomBg ? { backgroundColor: withTiming(theme.card) } : {}),
        borderColor: withTiming(theme.border),
    }));

    if (animated) {
        return (
            <Animated.View
                entering={FadeInDown.delay(delay).duration(400)}
                style={[commonStyles.card, animatedStyle, style]}
                {...props}
            >
                {children}
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[commonStyles.card, animatedStyle, style]} {...props}>
            {children}
        </Animated.View>
    );
};
