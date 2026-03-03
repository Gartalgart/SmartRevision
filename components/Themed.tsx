import { Text as DefaultText, View as DefaultView } from 'react-native';
import { useTheme } from '../utils/styles';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function Text(props: DefaultText['props']) {
  const { style, ...otherProps } = props;
  const theme = useTheme();

  return <DefaultText style={[{ color: theme.text }, style]} {...otherProps} />;
}

export function View(props: DefaultView['props']) {
  const { style, ...otherProps } = props;
  const theme = useTheme();

  return <DefaultView style={[{ backgroundColor: theme.background }, style]} {...otherProps} />;
}
