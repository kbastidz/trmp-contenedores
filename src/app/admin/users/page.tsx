'use client';

import { useCallback, useState } from 'react';

import {
  Anchor,
  Button,
  Group,
  Modal,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconLayoutGrid,
  IconList,
  IconMoodEmpty,
  IconPlus,
} from '@tabler/icons-react';

import { ErrorAlert, PageHeader, Surface } from '@/components';
import type { UserListItem } from '@/lib/auth';
import { usersService } from '@/lib/auth';
import { useAdminUsers } from '@/lib/hooks/useApi';
import { PATH_DASHBOARD } from '@/routes';

import { EditUserDrawer } from './components/EditUserDrawer';
import { NewUserDrawer } from './components/NewUserDrawer';
import { UserCard } from './components/UserCard';
import UsersTable from './components/UsersTable';

type ViewMode = 'grid' | 'table';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Admin', href: '#' },
  { title: 'Users', href: '#' },
].map((item, i) => (
  <Anchor href={item.href} key={i}>
    {item.title}
  </Anchor>
));

export default function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, loading, error, refetch } = useAdminUsers();
  const users: UserListItem[] = data ?? [];

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [newOpened, { open: openNew, close: closeNew }] = useDisclosure(false);

  const handleEdit = useCallback((user: UserListItem) => {
    setSelectedUser(user);
    openEdit();
  }, [openEdit]);

  const handleDeletePrompt = useCallback((user: UserListItem) => {
    setDeleteTarget(user);
    openDelete();
  }, [openDelete]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usersService.delete(deleteTarget.id);
      notifications.show({ title: 'Deleted', message: `${deleteTarget.name} was removed`, color: 'green' });
      closeDelete();
      refetch();
    } catch (err) {
      console.error('Delete error:', err);
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to delete user',
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return viewMode === 'grid' ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="xl" verticalSpacing="xl">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} visible height={180} />
          ))}
        </SimpleGrid>
      ) : (
        <Surface>
          <UsersTable data={[]} loading />
        </Surface>
      );
    }

    if (error) {
      return <ErrorAlert title="Error loading users" message={error?.message ?? 'Unknown error'} />;
    }

    if (!users.length) {
      return (
        <Surface p="md">
          <Stack align="center">
            <IconMoodEmpty size={24} />
            <Title order={4}>No users found</Title>
            <Text>No users are registered yet.</Text>
            <Button leftSection={<IconPlus size={18} />} onClick={openNew}>
              New User
            </Button>
          </Stack>
        </Surface>
      );
    }

    return viewMode === 'grid' ? (
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
        spacing="xl"
        verticalSpacing="xl"
        mt="md"
      >
        {users.map((u) => (
          <UserCard key={u.id} data={u} onEdit={handleEdit} onDelete={handleDeletePrompt} />
        ))}
      </SimpleGrid>
    ) : (
      <Surface mt="md">
        <UsersTable data={users} onEdit={handleEdit} onDelete={handleDeletePrompt} />
      </Surface>
    );
  };

  return (
    <>
      <title>Users | Admin</title>

      <PageHeader
        title="Users"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            {users.length > 0 && (
              <SegmentedControl
                value={viewMode}
                onChange={(v) => setViewMode(v as ViewMode)}
                data={[
                  { value: 'table', label: <IconList size={16} /> },
                  { value: 'grid', label: <IconLayoutGrid size={16} /> },
                ]}
              />
            )}
            <Button leftSection={<IconPlus size={18} />} onClick={openNew}>
              New User
            </Button>
          </Group>
        }
      />

      {renderContent()}

      <NewUserDrawer
        opened={newOpened}
        onClose={closeNew}
        position="right"
        onUserCreated={() => { closeNew(); refetch(); }}
      />

      <EditUserDrawer
        opened={editOpened}
        onClose={closeEdit}
        position="right"
        user={selectedUser}
        onUserUpdated={() => { closeEdit(); refetch(); }}
      />

      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Delete User"
        centered
      >
        <Text>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={closeDelete}>Cancel</Button>
          <Button color="red" loading={deleting} onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}
