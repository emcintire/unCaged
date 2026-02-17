import { useFormikContext } from 'formik';
import type { FormikValues } from 'formik';
import AppButton from '../AppButton';
import type { ColorKey } from '@/types';
import type { StyleProp, ViewStyle } from 'react-native';

type Props = {
  color?: ColorKey;
  style?: StyleProp<ViewStyle>;
  title: string;
};

export default function SubmitButton<Values extends FormikValues>({ color = 'orange', style, title }: Props) {
  const { handleSubmit, isSubmitting } = useFormikContext<Values>();

  return <AppButton title={title} onPress={handleSubmit} color={color} style={style} loading={isSubmitting} />;
}
