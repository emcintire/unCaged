import { View } from 'react-native';
import { z } from 'zod';
import { form, screen } from '@/config';
import { useLogin } from '@/services';
import type { LoginBody } from '@/services';
import { useAuth } from '@/hooks';
import { AppForm, AppFormField, PasswordInput, SubmitButton } from '@/components/forms';
import Screen from '@/components/Screen';
import { showErrorToast, toFormikValidator } from '@/utils';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Email must be a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const validate = toFormikValidator(schema);

export default function SignInScreen() {
  const { signIn } = useAuth();
  const loginMutation = useLogin();

  const handleSubmit = async (values: LoginBody): Promise<void> => {
    const email = values.email.toLowerCase().trim();
    try {
      const { accessToken, refreshToken } = await loginMutation.mutateAsync({ data: { email, password: values.password }});
      await signIn(accessToken, refreshToken);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      showErrorToast(message);
    }
  };

  return (
    <Screen style={screen.withPadding}>
      <View style={form.container}>
        <AppForm<LoginBody>
          initialValues={{ email: '', password: '' }}
          onSubmit={handleSubmit}
          validate={validate}
        >
          <AppFormField<LoginBody>
            autoComplete="email"
            icon="email"
            keyboardType="email-address"
            name="email"
            placeholder="Email"
            textContentType="emailAddress"
          />
          <PasswordInput<LoginBody> autoComplete="password" name="password" placeholder="Password" />
          <SubmitButton<LoginBody> title="Sign In" style={form.submitButton} />
        </AppForm>
      </View>
    </Screen>
  );
}
