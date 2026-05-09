import { Avatar, Button, Group, PaperProps, Stack, Text, Title } from '@mantine/core';
import { IconEdit, IconMail, IconTrash } from '@tabler/icons-react';

import { Surface } from '@/components';
import type { UserListItem } from '@/lib/auth';

interface UserCardProps extends Omit<PaperProps, 'children'> {
  data: UserListItem;
  onEdit?: (user: UserListItem) => void;
  onDelete?: (user: UserListItem) => void;
}

export const UserCard = ({ data, onEdit, onDelete, ...paperProps }: UserCardProps) => (
  <Surface p="md" {...paperProps}>
    <Stack gap="sm">
      <Group gap="sm">
        <Avatar src={data.image} alt={data.name} radius="xl" size="lg" color="blue">
          {data.name?.charAt(0).toUpperCase()}
        </Avatar>
        <div>
          <Title order={5} mb={2}>
            {data.name || 'N/A'}
          </Title>
          <Text size="xs" c="dimmed">
            ID: ...{data.id.slice(-4)}
          </Text>
        </div>
      </Group>

      <Group gap={6}>
        <IconMail size={14} color="gray" />
        <Text size="xs" c="dimmed">
          {data.email}
        </Text>
      </Group>

      {data.createdAt && (
        <Text size="xs" c="dimmed">
          Creado: {new Date(data.createdAt).toLocaleDateString()}
        </Text>
      )}

      <Group justify="flex-end" mt="xs">
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconEdit size={14} />}
          onClick={() => onEdit?.(data)}
        >
          Edit
        </Button>
        <Button
          variant="subtle"
          size="xs"
          color="red"
          leftSection={<IconTrash size={14} />}
          onClick={() => onDelete?.(data)}
        >
          Delete
        </Button>
      </Group>
    </Stack>
  </Surface>
);
