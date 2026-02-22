import { View } from 'react-native';
import { z } from 'zod';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { WelcomeAuthTabParamList } from '@/types';
import { useForgotPassword } from '@/services';
import { showErrorToast, showSuccessToast, form, screen } from '@/config';
import { AppForm, AppFormField, SubmitButton } from '@/components/forms';
import Screen from '@/components/Screen';
import { toFormikValidator } from '@/utils/toFormikValidator';
import { STORAGE_KEYS } from '@/constants';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Email must be a valid email'),
});

const validate = toFormikValidator(schema);

type ForgotPasswordFormValues = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const forgotPasswordMutation = useForgotPassword();
  const { navigate } = useNavigation<NativeStackNavigationProp<WelcomeAuthTabParamList>>();

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const email = values.email.trim().toLowerCase();
      await forgotPasswordMutation.mutateAsync({ data: { email } });
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_EMAIL, email);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      showErrorToast(message);
    } finally {
      showSuccessToast('If you have an account, a reset code has been sent to your email.');
      navigate('Email Code');
    }
  };

  return (
    <Screen style={screen.withPadding}>
      <View style={form.container}>
        <AppForm<ForgotPasswordFormValues>
          initialValues={{ email: '' }}
          onSubmit={handleSubmit}
          validate={validate}
        >
          <AppFormField<ForgotPasswordFormValues>
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            icon="email"
            keyboardType="email-address"
            name="email"
            placeholder="Email"
            textContentType="emailAddress"
          />
          <SubmitButton<ForgotPasswordFormValues> title="Submit" style={form.submitButton} />
        </AppForm>
      </View>
    </Screen>
  );
}
