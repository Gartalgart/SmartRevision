import React from 'react';
import { View, ViewProps } from 'react-native';
import { commonStyles } from '@/utils/styles';

export const Card = ({ children, style, ...props }: ViewProps) => {
    return (
        <View style={[commonStyles.card, style]} {...props}>
            {children}
        </View>
    );
};
