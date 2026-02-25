import type { FormikValues } from 'formik';
import { useFormikContext } from 'formik';
import type { StyleProp, ViewStyle } from 'react-native';

import type { ColorKey } from '@/config';

import AppButton from '../AppButton';

type Props = {
  color?: ColorKey;
  style?: StyleProp<ViewStyle>;
  title: string;
};

export default function SubmitButton<Values extends FormikValues>({ color = 'orange', style, title }: Props) {
  const { handleSubmit, isSubmitting } = useFormikContext<Values>();

  return <AppButton title={title} onPress={handleSubmit} color={color} style={style} loading={isSubmitting} />;
}
