import { memo } from 'react';
import { Text, type TextProps } from 'react-native';
import type { PropsWithChildren } from 'react';
import { defaultStyles } from '@/config';

export default memo(function AppText({ children, style, ...otherProps }: TextProps & PropsWithChildren) {
  return (
    <Text style={[defaultStyles.text, style]} {...otherProps}>
      {children}
    </Text>
  );
});
