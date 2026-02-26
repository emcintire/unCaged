import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from '@uncaged/shared';
import { type FormikHelpers } from 'formik';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { AppForm, SubmitButton } from '@/components/forms';
import PasswordInput from '@/components/forms/PasswordInput';
import Screen from '@/components/Screen';
import { form, spacing } from '@/config';
import { useChangePassword } from '@/services';
import { showErrorToast, showSuccessToast, toFormikValidator } from '@/utils';

const schema = z.object({
  currentPassword: z.string().min(1, 'Password is required'),
  newPassword: z.string().min(1, 'New Password is required').regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
  confirmPassword: z.string().min(1, 'Confirm Password is required').regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
});

type FormValues = z.infer<typeof schema>;

const validate = toFormikValidator(schema);

export default function SecurityScreen() {
  const changePasswordMutation = useChangePassword();

  const handleSubmit = async (values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
    if (values.newPassword !== values.confirmPassword) {
      return showErrorToast('Passwords do not match');
    }

    if (values.newPassword === values.currentPassword) {
      return showErrorToast('New password must be different from current password');
    }

    await changePasswordMutation.mutateAsync({
      data: { currentPassword: values.currentPassword, password: values.newPassword,
    }});
    showSuccessToast('Password updated!');
    resetForm();
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.formContainer}>
        <AppForm<FormValues>
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          onSubmit={handleSubmit}
          validate={validate}
        >
          <View style={styles.currentPasswordContainer}>
            <PasswordInput<FormValues>
              autoComplete="current-password"
              name="currentPassword"
              placeholder="Current Password"
            />
          </View>
          <PasswordInput<FormValues> autoComplete="new-password" name="newPassword" placeholder="New Password" />
          <PasswordInput<FormValues>
            autoComplete="new-password"
            name="confirmPassword"
            placeholder="Confirm New Password"
          />
          <SubmitButton<FormValues> title="Submit" style={styles.submitButton} />
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
  formContainer: form.container,
  submitButton: form.submitButton,
  currentPasswordContainer: {
    marginBottom: 20,
  },
});
