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
  { title: 'Usuarios', href: '#' },
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
      notifications.show({ title: 'Eliminado', message: `${deleteTarget.name} fue eliminado`, color: 'green' });
      closeDelete();
      refetch();
    } catch (err) {
      console.error('Error al eliminar:', err);
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'No se pudo eliminar el usuario',
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
      return <ErrorAlert title="Error al cargar usuarios" message={error?.message ?? 'Error desconocido'} />;
    }

    if (!users.length) {
      return (
        <Surface p="md">
          <Stack align="center">
            <IconMoodEmpty size={24} />
            <Title order={4}>No se encontraron usuarios</Title>
            <Text>Aún no hay usuarios registrados.</Text>
            <Button leftSection={<IconPlus size={18} />} onClick={openNew}>
              Nuevo usuario
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
      <title>Usuarios | Admin</title>

      <PageHeader
        title="Usuarios"
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
              Nuevo usuario
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
        title="Eliminar usuario"
        centered
      >
        <Text>
          ¿Estás seguro de que deseas eliminar a <strong>{deleteTarget?.name}</strong>? Esta acción no se puede deshacer.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={closeDelete}>Cancelar</Button>
          <Button color="red" loading={deleting} onClick={handleDeleteConfirm}>
            Eliminar
          </Button>
        </Group>
      </Modal>
    </>
  );
}