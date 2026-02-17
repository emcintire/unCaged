import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { ComponentType } from 'react';

export type Screen<StackParamList> = {
  name: keyof StackParamList;
  component: ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  options?: NativeStackNavigationOptions;
};