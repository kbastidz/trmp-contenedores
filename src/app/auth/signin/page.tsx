'use client';

import { useState } from 'react';

import {
  Alert,
  Button,
  Center,
  Checkbox,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  TextProps,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Surface } from '@/components';
import { authService } from '@/lib/auth';
import { PATH_AUTH, PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

import classes from './page.module.css';

const LINK_PROPS: TextProps = {
  className: classes.link,
};

function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || PATH_OPERADOR.dashboard;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: { email: 'kevin-10b2011@hotmail.com', password: 'Password123!' },
    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : 'Invalid email',
      password: (value: string | undefined) =>
        value && value?.length < 6
          ? 'Password must include at least 6 characters'
          : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.signIn(values.email, values.password);
      router.push(callbackUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <title>Sign in | DesignSparx</title>
      <meta
        name="description"
        content="Sign in to your account to access the dashboard."
      />

      <Title ta="center">Bienvenido!</Title>
      <Text ta="center">Iniciar Sesión para continuar</Text>

      <Surface component={Paper} className={classes.card}>
        {error && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Authentication Error"
            color="red"
            mb="md"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="kevin-10b2011@hotmail.com"
            required
            classNames={{ label: classes.label }}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Password123!"
            required
            mt="md"
            classNames={{ label: classes.label }}
            {...form.getInputProps('password')}
          />
          <Group justify="space-between" mt="lg">
            <Checkbox
              label="Recordarme"
              classNames={{ label: classes.label }}
            />
            <Text
              component={Link}
              href={PATH_AUTH.passwordReset}
              size="sm"
              {...LINK_PROPS}
            >
              Olvidaste tu contraseña?
            </Text>
          </Group>
          <Button fullWidth mt="xl" type="submit" loading={isLoading}>
            Ingresar
          </Button>
        </form>
        <Center mt="md">
          <Text
            fz="sm"
            ta="center"
            component={Link}
            href={PATH_AUTH.signup}
            {...LINK_PROPS}
          >
            Aún no tienes una cuenta? Crea una cuenta.
          </Text>
        </Center>
      </Surface>
    </>
  );
}

export default Page;
