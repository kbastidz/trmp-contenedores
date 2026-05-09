'use client';

import { useState } from 'react';

import {
  Button,
  Drawer,
  DrawerProps,
  LoadingOverlay,
  Stack,
  TextInput,
  PasswordInput,
  Title,
} from '@mantine/core';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { authService } from '@/lib/auth';

type NewUserDrawerProps = Omit<DrawerProps, 'title' | 'children'> & {
  onUserCreated?: () => void;
};

export const NewUserDrawer = ({ onUserCreated, ...drawerProps }: NewUserDrawerProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { name: '', email: '', password: '' },
    validate: {
      name: isNotEmpty('El nombre es obligatorio'),
      email: isEmail('Correo electrónico inválido'),
      password: (v) => (v.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await authService.signUp(values.name, values.email, values.password);
      notifications.show({ title: 'Éxito', message: 'Usuario creado correctamente', color: 'green' });
      form.reset();
      drawerProps.onClose?.();
      onUserCreated?.();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'No se pudo crear el usuario',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer {...drawerProps} title="Crear nuevo usuario" size="md">
      <LoadingOverlay visible={loading} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Title order={4}>Información del usuario</Title>
          <TextInput
            label="Nombre"
            placeholder="Nombre completo"
            required
            key={form.key('name')}
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Correo electrónico"
            placeholder="usuario@correo.com"
            required
            key={form.key('email')}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Mín. 6 caracteres"
            required
            key={form.key('password')}
            {...form.getInputProps('password')}
          />
          <Button type="submit" mt="md" loading={loading}>
            Crear usuario
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
};