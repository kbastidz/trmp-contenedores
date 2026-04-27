'use client';

import { useEffect, useState } from 'react';

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Divider,
  Drawer,
  DrawerProps,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconUserPlus } from '@tabler/icons-react';

import type { RoleDto, UserListItem } from '@/lib/auth';
import { rolesService, usersService } from '@/lib/auth';

type EditUserDrawerProps = Omit<DrawerProps, 'title' | 'children'> & {
  user: UserListItem | null;
  onUserUpdated?: () => void;
};

export const EditUserDrawer = ({ user, onUserUpdated, ...drawerProps }: EditUserDrawerProps) => {
  const [loading, setLoading] = useState(false);
  const [allRoles, setAllRoles] = useState<RoleDto[]>([]);
  const [userRoles, setUserRoles] = useState<{ id: string; name: string }[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [rolesLoading, setRolesLoading] = useState(false);

  const form = useForm({
    initialValues: { name: '', email: '', image: '' },
    validate: {
      name: isNotEmpty('Name is required'),
      email: isEmail('Invalid email'),
    },
  });

  // Load available roles and user detail when user changes
  useEffect(() => {
    if (!user) return;
    form.setValues({ name: user.name ?? '', email: user.email ?? '', image: user.image ?? '' });
    setUserRoles(user.roles ?? []);

    rolesService.list().then(setAllRoles).catch(() => setAllRoles([]));

    // fetch full user detail to get current roles
    usersService.getById(user.id)
      .then((u) => setUserRoles(u.roles ?? []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await usersService.update(user.id, { name: values.name, image: values.image || undefined });
      notifications.show({ title: 'Success', message: 'User updated successfully', color: 'green' });
      drawerProps.onClose?.();
      onUserUpdated?.();
    } catch (err) {
      console.error('Update error:', err);
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to update user',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!user?.id || !selectedRoleId) return;
    setRolesLoading(true);
    try {
      await usersService.assignRole(user.id, [selectedRoleId]);
      const role = allRoles.find((r) => r.id === selectedRoleId);
      if (role) setUserRoles((prev) => [...prev, { id: role.id, name: role.name }]);
      setSelectedRoleId(null);
      notifications.show({ title: 'Role assigned', message: `Role "${role?.name}" added`, color: 'green' });
      onUserUpdated?.();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to assign role',
        color: 'red',
      });
    } finally {
      setRolesLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string, roleName: string) => {
    if (!user?.id) return;
    setRolesLoading(true);
    try {
      await usersService.removeRole(user.id, roleId);
      setUserRoles((prev) => prev.filter((r) => r.id !== roleId));
      notifications.show({ title: 'Role removed', message: `Role "${roleName}" removed`, color: 'orange' });
      onUserUpdated?.();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to remove role',
        color: 'red',
      });
    } finally {
      setRolesLoading(false);
    }
  };

  const availableRoles = allRoles
    .filter((r) => !userRoles.some((ur) => ur.id === r.id))
    .map((r) => ({ value: r.id, label: r.name }));

  return (
    <Drawer {...drawerProps} title="Edit User" size="md">
      <LoadingOverlay visible={loading} />
      {user && (
        <Stack>
          <Group gap="sm">
            <Avatar src={user.image} alt={user.name} radius="xl" size="lg" color="blue">
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Title order={4}>{user.name}</Title>
              <Text size="sm" c="dimmed">{user.email}</Text>
            </div>
          </Group>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Name"
                placeholder="Full name"
                required
                key={form.key('name')}
                {...form.getInputProps('name')}
              />
              <TextInput
                label="Email"
                disabled
                key={form.key('email')}
                {...form.getInputProps('email')}
              />
              <TextInput
                label="Image URL"
                placeholder="https://..."
                key={form.key('image')}
                {...form.getInputProps('image')}
              />
              <Button type="submit" mt="xs" loading={loading}>
                Save Changes
              </Button>
            </Stack>
          </form>

          <Divider label="Roles" labelPosition="left" mt="md" />

          {/* Current roles */}
          <Stack gap="xs">
            {userRoles.length === 0 ? (
              <Text size="sm" c="dimmed">No roles assigned</Text>
            ) : (
              userRoles.map((role) => (
                <Group key={role.id} justify="space-between">
                  <Badge variant="light" color="blue" size="md">
                    {role.name}
                  </Badge>
                  <Tooltip label="Remove role">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      loading={rolesLoading}
                      onClick={() => handleRemoveRole(role.id, role.name)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              ))
            )}
          </Stack>

          {/* Assign new role */}
          {availableRoles.length > 0 && (
            <Group align="flex-end" mt="xs">
              <Select
                label="Assign role"
                placeholder="Select a role"
                data={availableRoles}
                value={selectedRoleId}
                onChange={setSelectedRoleId}
                style={{ flex: 1 }}
                clearable
              />
              <Button
                leftSection={<IconUserPlus size={16} />}
                disabled={!selectedRoleId}
                loading={rolesLoading}
                onClick={handleAssignRole}
              >
                Assign
              </Button>
            </Group>
          )}
        </Stack>
      )}
    </Drawer>
  );
};
