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
      name: isNotEmpty('Name is required'),
      email: isEmail('Invalid email'),
      password: (v) => (v.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await authService.signUp(values.name, values.email, values.password);
      notifications.show({ title: 'Success', message: 'User created successfully', color: 'green' });
      form.reset();
      drawerProps.onClose?.();
      onUserCreated?.();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to create user',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer {...drawerProps} title="Create New User" size="md">
      <LoadingOverlay visible={loading} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Title order={4}>User Information</Title>
          <TextInput
            label="Name"
            placeholder="Full name"
            required
            key={form.key('name')}
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Email"
            placeholder="user@email.com"
            required
            key={form.key('email')}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Min. 6 characters"
            required
            key={form.key('password')}
            {...form.getInputProps('password')}
          />
          <Button type="submit" mt="md" loading={loading}>
            Create User
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
};
