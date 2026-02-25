import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { FormikValues } from 'formik';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import { StyleSheet,TouchableOpacity } from 'react-native';

import { colors, spacing } from '@/config';

import AppTextInput from '../AppTextInput';
import ErrorMessage from './ErrorMessage';

type Props<Values> = {
  autoComplete?: 'password' | 'new-password' | 'current-password';
  name: keyof Values & string;
  placeholder?: string;
};

export default function PasswordInput<Values extends FormikValues>({ autoComplete, name, placeholder }: Props<Values>) {
  const { setFieldTouched, handleChange, errors, touched, values } = useFormikContext<Values>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <AppTextInput
        icon="lock"
        placeholder={placeholder}
        value={values[name] as string}
        onBlur={() => setFieldTouched(name)}
        onChangeText={handleChange(name)}
        secureTextEntry={!showPassword}
        autoComplete={autoComplete}
        accessibilityLabel={placeholder ?? 'Password'}
        rightElement={
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.medium}
            />
          </TouchableOpacity>
        }
      />
      <ErrorMessage error={errors[name] as string} visible={touched[name] as boolean} />
    </>
  );
}

const styles = StyleSheet.create({
  eyeButton: {
    padding: spacing.xs,
  },
});
