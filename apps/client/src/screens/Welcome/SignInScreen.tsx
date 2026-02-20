import { View } from 'react-native';
import { z } from 'zod';
import { form, screen, showErrorToast, showSuccessToast } from '@/config';
import { useLogin } from '@/services';
import { useAuth } from '@/hooks';
import { AppForm, AppFormField, PasswordInput, SubmitButton } from '@/components/forms';
import Screen from '@/components/Screen';
import { toFormikValidator } from '@/utils/toFormikValidator';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Email must be a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const validate = toFormikValidator(schema);

type LoginFormValues = {
  email: string;
  password: string;
};

export default function SignInScreen() {
  const { signIn } = useAuth();
  const loginMutation = useLogin();

  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    const email = values.email.toLowerCase().trim();
    try {
      const token = await loginMutation.mutateAsync({ data: { email, password: values.password }});
      console.log(token);
      await signIn(token);
      showSuccessToast('Sign in successful!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      showErrorToast(message);
    }
  };

  return (
    <Screen style={screen.withPadding}>
      <View style={form.container}>
        <AppForm<LoginFormValues>
          initialValues={{ email: '', password: '' }}
          onSubmit={handleSubmit}
          validate={validate}
        >
          <AppFormField<LoginFormValues>
            autoComplete="email"
            icon="email"
            keyboardType="email-address"
            name="email"
            placeholder="Email"
            textContentType="emailAddress"
          />
          <PasswordInput<LoginFormValues> autoComplete="password" name="password" placeholder="Password" />
          <SubmitButton<LoginFormValues> title="Sign In" style={form.submitButton} />
        </AppForm>
      </View>
    </Screen>
  );
}
