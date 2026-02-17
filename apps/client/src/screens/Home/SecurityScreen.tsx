import { StyleSheet, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { z } from 'zod';
import type { HomeStackParamList } from '@/types';
import { form, spacing, showErrorToast, showSuccessToast } from '@/config';
import { useChangePassword } from '@/services';
import { AppForm, SubmitButton } from '@/components/forms';
import Screen from '@/components/Screen';
import PasswordInput from '@/components/forms/PasswordInput';
import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from '@/constants';
import { toFormikValidator } from '@/utils/toFormikValidator';

type SecurityFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function SecurityScreen() {
  const { navigate } = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const changePasswordMutation = useChangePassword();

  const handleSubmit = async (values: SecurityFormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      return showErrorToast('Passwords do not match');
    }

    if (values.newPassword === values.currentPassword) {
      return showErrorToast('New password must be different from current password');
    }

    try {
      await changePasswordMutation.mutateAsync({
        password: values.newPassword,
      });
      showSuccessToast('Password updated!');
      navigate('SettingsTab');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update password';
      showErrorToast(message);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.formContainer}>
        <AppForm<SecurityFormValues>
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          onSubmit={handleSubmit}
          validate={validate}
        >
          <View style={styles.currentPasswordContainer}>
            <PasswordInput<SecurityFormValues>
              autoComplete="current-password"
              name="currentPassword"
              placeholder="Current Password"
            />
          </View>
          <PasswordInput<SecurityFormValues> autoComplete="new-password" name="newPassword" placeholder="New Password" />
          <PasswordInput<SecurityFormValues>
            autoComplete="new-password"
            name="confirmPassword"
            placeholder="Confirm New Password"
          />
          <SubmitButton<SecurityFormValues> title="Submit" style={styles.submitButton} />
        </AppForm>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  scrollContainer: {
    height: '100%',
    width: '100%',
  },
  formContainer: form.container,
  submitButton: form.submitButton,
  currentPasswordContainer: {
    marginBottom: 20,
  },
});

const schema = z.object({
  currentPassword: z.string().min(1, 'Password is required'),
  newPassword: z.string().min(1, 'New Password is required').regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
  confirmPassword: z.string().min(1, 'Confirm Password is required').regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
});

const validate = toFormikValidator(schema);
