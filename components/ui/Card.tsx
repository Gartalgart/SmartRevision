import React, { useMemo } from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
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

    const cardStyle = [
        commonStyles.card,
        {
            backgroundColor: hasCustomBg ? flatStyle?.backgroundColor : theme.card,
            borderColor: theme.border
        },
        style
    ];

    return (
        <View style={cardStyle} {...props}>
            {children}
        </View>
    );
};
