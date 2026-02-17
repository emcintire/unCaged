import { View, Text } from 'react-native';
import { z } from 'zod';
import { useChangePassword } from '@/services';
import { useAuth } from '@/hooks';
import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from '@/constants';
import { form, screen, typography, utils, showErrorToast, showSuccessToast } from '@/config';
import { AppForm, SubmitButton } from '@/components/forms';
import PasswordInput from '@/components/forms/PasswordInput';
import Screen from '@/components/Screen';
import { toFormikValidator } from '@/utils/toFormikValidator';

const schema = z.object({
  password: z.string().min(1, 'Password is required').regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
});

const validate = toFormikValidator(schema);

type PasswordResetFormValues = {
  password: string;
};

export default function PasswordResetScreen() {
  const { signIn } = useAuth();
  const changePasswordMutation = useChangePassword();

  const handleSubmit = async (values: PasswordResetFormValues) => {
    try {
      const token = await changePasswordMutation.mutateAsync({ password: values.password });
      if (typeof token === 'string') {
        await signIn(token);
      }
      showSuccessToast('Password reset successful!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      showErrorToast(message);
    }
  };

  return (
    <Screen style={screen.withPadding}>
      <Text style={[typography.h1, utils.selfCenter]}>New password</Text>
      <View style={form.container}>
        <AppForm<PasswordResetFormValues>
          initialValues={{ password: '' }}
          onSubmit={handleSubmit}
          validate={validate}
        >
          <PasswordInput<PasswordResetFormValues> autoComplete="new-password" name="password" placeholder="Password" />
          <SubmitButton<PasswordResetFormValues> title="Submit" style={form.submitButton} />
        </AppForm>
      </View>
    </Screen>
  );
}
