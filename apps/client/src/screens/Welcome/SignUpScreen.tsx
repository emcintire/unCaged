import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from '@uncaged/shared';
import { View } from 'react-native';
import { z } from 'zod';

import { AppForm, AppFormField, SubmitButton } from '@/components/forms';
import PasswordInput from '@/components/forms/PasswordInput';
import Screen from '@/components/Screen';
import { form, screen } from '@/config';
import { useAuth } from '@/hooks';
import { useCreateUser } from '@/services';
import { showErrorToast, toFormikValidator } from '@/utils';

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
  const createUserMutation = useCreateUser();

  const handleSubmit = async (values: RegisterFormValues) => {
    if (values.password !== values.confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }

    const email = values.email.toLowerCase().trim();
    const name = values.name?.trim();
    const { accessToken, refreshToken } = await createUserMutation.mutateAsync({
      data: {
        ...(name ? { name } : {}),
        email,
        password: values.password,
      },
    });
    await signIn(accessToken, refreshToken);
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
