import React from 'react';
import { ViewProps } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { commonStyles } from '../../utils/styles';

interface CardProps extends ViewProps {
    delay?: number;
    animated?: boolean;
}

export const Card = ({ children, style, delay = 0, animated = false, ...props }: CardProps) => {
    if (animated) {
        return (
            <Animated.View 
                entering={FadeInDown.delay(delay).springify()} 
                style={[commonStyles.card, style]} 
                {...props}
            >
                {children}
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[commonStyles.card, style]} {...props}>
            {children}
        </Animated.View>
    );
};
