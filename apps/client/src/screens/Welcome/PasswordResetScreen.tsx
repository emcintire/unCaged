import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from '@uncaged/shared';
import * as SecureStore from 'expo-secure-store';
import { Text,View } from 'react-native';
import { z } from 'zod';

import { AppForm, SubmitButton } from '@/components/forms';
import PasswordInput from '@/components/forms/PasswordInput';
import Screen from '@/components/Screen';
import { form, screen, typography, utils } from '@/config';
import { useAuth } from '@/hooks';
import { useResetPassword } from '@/services';
import type { WelcomeAuthTabParamList } from '@/types';
import { showSuccessToast, toFormikValidator } from '@/utils';

const schema = z.object({
  newPassword: z.string().min(1, 'Password is required').regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
});

const validate = toFormikValidator(schema);

type PasswordResetFormValues = {
  newPassword: string;
};

export default function PasswordResetScreen() {
  const { signIn } = useAuth();
  const { navigate } = useNavigation<NativeStackNavigationProp<WelcomeAuthTabParamList>>();
  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async (values: PasswordResetFormValues) => {
    const code = await SecureStore.getItemAsync('code');
    const email = await SecureStore.getItemAsync('email');
    if (!code || !email) {
      navigate('Welcome');
      return;
    }

    const { accessToken, refreshToken } = await resetPasswordMutation.mutateAsync({ data: { code, email, newPassword: values.newPassword } });
    await signIn(accessToken, refreshToken);
    showSuccessToast('Password reset successful!');
  };

  return (
    <Screen style={screen.withPadding}>
      <Text style={[typography.h1, utils.selfCenter]}>New password</Text>
      <View style={form.container}>
        <AppForm<PasswordResetFormValues>
          initialValues={{ newPassword: '' }}
          onSubmit={handleSubmit}
          validate={validate}
        >
          <PasswordInput<PasswordResetFormValues> autoComplete="new-password" name="newPassword" placeholder="Password" />
          <SubmitButton<PasswordResetFormValues> title="Submit" style={form.submitButton} />
        </AppForm>
      </View>
    </Screen>
  );
}
