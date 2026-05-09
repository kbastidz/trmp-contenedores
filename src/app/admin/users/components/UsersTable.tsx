'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';

import {
  ActionIcon,
  Avatar,
  Group,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import sortBy from 'lodash/sortBy';
import { DataTable, DataTableProps, DataTableSortStatus } from 'mantine-datatable';

import { ErrorAlert } from '@/components';
import type { UserListItem } from '@/lib/auth';

const PAGE_SIZES = [5, 10, 20];

type UsersTableProps = {
  data: UserListItem[];
  error?: ReactNode;
  loading?: boolean;
  onEdit?: (user: UserListItem) => void;
  onDelete?: (user: UserListItem) => void;
};

const UsersTable = ({ data = [], loading, error, onEdit, onDelete }: UsersTableProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [selectedRecords, setSelectedRecords] = useState<UserListItem[]>([]);
  const [records, setRecords] = useState<UserListItem[]>(data.slice(0, pageSize));
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<UserListItem>>({
    columnAccessor: 'name',
    direction: 'asc',
  });
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);

  const columns: DataTableProps<UserListItem>['columns'] = [
    {
      accessor: 'name',
      title: 'Nombre',
      sortable: true,
      filter: (
        <TextInput
          label="Usuarios"
          description="Filtrar por nombre o correo"
          placeholder="Buscar usuarios..."
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
      ),
      filtering: query !== '',
      render: (item) => (
        <Group gap="sm">
          <Avatar
            src={item.image}
            alt={item.name}
            radius="xl"
            size="sm"
            color="blue"
          >
            {item.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Text size="sm" fw={500}>
            {item.name || 'N/A'}
          </Text>
        </Group>
      ),
    },
    {
      accessor: 'email',
      title: 'Correo electrónico',
      sortable: true,
    },
    {
      accessor: 'createdAt',
      title: 'Creado',
      sortable: true,
      render: (item) =>
        item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-EC') : '—',
    },
    {
      accessor: 'actions',
      title: 'Acciones',
      textAlign: 'right',
      render: (item) => (
        <Group gap="xs" justify="flex-end">
          {onEdit && (
            <Tooltip label="Editar">
              <ActionIcon variant="subtle" color="gray" onClick={() => onEdit(item)}>
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip label="Eliminar">
              <ActionIcon variant="subtle" color="red" onClick={() => onDelete(item)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      ),
    },
  ];

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const sorted = sortBy(data, sortStatus.columnAccessor) as UserListItem[];
    let sliced = sorted.slice(from, to);
    if (sortStatus.direction === 'desc') sliced = sliced.reverse();

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      const filtered = data.filter(
        ({ name, email }) =>
          name?.toLowerCase().includes(q) || email?.toLowerCase().includes(q),
      );
      setRecords(filtered.slice(from, to));
    } else {
      setRecords(sliced);
    }
  }, [sortStatus, data, page, pageSize, debouncedQuery]);

  return error ? (
    <ErrorAlert title="Error al cargar usuarios" message={error.toString()} />
  ) : (
    <DataTable
      minHeight={200}
      verticalSpacing="sm"
      striped
      columns={columns}
      records={records}
      selectedRecords={selectedRecords}
      onSelectedRecordsChange={setSelectedRecords}
      totalRecords={debouncedQuery ? records.length : data.length}
      recordsPerPage={pageSize}
      page={page}
      onPageChange={setPage}
      recordsPerPageOptions={PAGE_SIZES}
      onRecordsPerPageChange={setPageSize}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      fetching={loading}
    />
  );
};

export default UsersTable;