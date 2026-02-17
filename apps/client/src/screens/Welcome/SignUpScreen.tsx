import { View } from 'react-native';
import { z } from 'zod';
import { useRegister } from '@/services';
import { useAuth } from '@/hooks';
import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from '@/constants';
import { form, screen, showErrorToast } from '@/config';
import Screen from '@/components/Screen';
import { AppForm, AppFormField, SubmitButton } from '@/components/forms';
import PasswordInput from '@/components/forms/PasswordInput';
import { toFormikValidator } from '@/utils/toFormikValidator';

const schema = z.object({
  name: z.string().optional(),
  email: z.string().min(1, 'Email is required').email('Email must be a valid email'),
  password: z.string().min(1, 'Password is required').regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
  confirmPassword: z.string().min(1, 'Password is required').regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
});

const validate = toFormikValidator(schema);

type RegisterFormValues = {
  name?: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpScreen() {
  const { signIn } = useAuth();
  const registerMutation = useRegister();

  const handleSubmit = async (values: RegisterFormValues) => {
    if (values.password !== values.confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }

    try {
      const email = values.email.toLowerCase().trim();
      const name = values.name?.trim();
      const token = await registerMutation.mutateAsync({
        ...(name ? { name } : {}),
        email,
        password: values.password,
      });
      await signIn(token);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      showErrorToast(message);
    }
  };

  return (
    <Screen style={screen.withPadding}>
      <View style={form.container}>
        <AppForm<RegisterFormValues>
          initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
          onSubmit={handleSubmit}
          validate={validate}
        >
          <AppFormField<RegisterFormValues>
            autoCapitalize="none"
            autoComplete="name"
            autoCorrect={false}
            icon="account"
            name="name"
            placeholder="Name"
            textContentType="name"
          />
          <AppFormField<RegisterFormValues>
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            icon="email"
            keyboardType="email-address"
            name="email"
            placeholder="Email"
            textContentType="emailAddress"
          />
          <PasswordInput<RegisterFormValues> autoComplete="new-password" name="password" placeholder="Password" />
          <PasswordInput<RegisterFormValues>
            autoComplete="new-password"
            name="confirmPassword"
            placeholder="Confirm Password"
          />
          <SubmitButton<RegisterFormValues> title="Sign Up" style={form.submitButton} />
        </AppForm>
      </View>
    </Screen>
  );
}
