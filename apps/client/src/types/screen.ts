import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { ComponentType } from 'react';

export type Screen<StackParamList> = {
  name: keyof StackParamList;
  // oxlint-disable-next-line typescript/no-explicit-any
  component: ComponentType<any>;
  options?: NativeStackNavigationOptions;
};