'use client';
import Link from 'next/link';

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Anchor, Badge, Box, Button, Collapse, Group, Loader, Progress,
  Select, SimpleGrid, Stack, Tabs, Text, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';
import { usePlanes, usePlanHistorial } from '@/lib/hooks/useApi';
import type { PlanDto, EstadoPlan } from '@/types/trm';

const ESTADO_COLOR: Record<EstadoPlan, string> = {
  Pendiente: 'gray', 'En progreso': 'blue', Completado: 'green', Vencido: 'red', Cancelado: 'gray',
};

function progressColor(pct: number, vencido: boolean) {
  if (vencido) return 'red';
  if (pct === 100) return 'green';
  if (pct >= 50) return 'blue';
  return 'yellow';
}

function isOverdue(plan: PlanDto) {
  if (!plan.fecha_limite) return false;
  return plan.estado !== 'Completado' && plan.fecha_limite < new Date().toISOString().split('T')[0];
}

function PlanCard({ plan, onClick, selected }: { plan: PlanDto; onClick: () => void; selected: boolean }) {
  const overdue = isOverdue(plan);
  return (
    <Box onClick={onClick} style={{ background: 'var(--mantine-color-body)', border: `0.5px solid ${selected ? '#185FA5' : overdue ? '#F09595' : 'var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '10px 12px', marginBottom: 6, cursor: 'pointer', outline: selected ? '2px solid #185FA5' : 'none' }}>
      <Group justify="space-between" mb={4}>
        <Text size="xs" c={overdue ? 'red' : 'dimmed'}>{plan.codigo}</Text>
        {plan.fecha_limite && (
          <Badge color={overdue ? 'red' : 'green'} variant="light" size="xs">
            {overdue ? `Venció ${new Date(plan.fecha_limite).toLocaleDateString('es-PE')}` : `Vence ${new Date(plan.fecha_limite).toLocaleDateString('es-PE')}`}
          </Badge>
        )}
      </Group>
      <Text size="xs" fw={500} mb={6} lineClamp={2}>{plan.titulo}</Text>
      {plan.area && <Badge color="blue" variant="light" size="xs" mb={6}>{plan.area}</Badge>}
      {plan.progreso > 0 && (
        <Progress value={plan.progreso} color={progressColor(plan.progreso, overdue)} size="xs" mb={4} />
      )}
      <Group justify="space-between">
        <Text size="xs" c="dimmed">{plan.responsable_nombre ?? '—'}</Text>
        {plan.progreso > 0 && <Text size="xs" c={progressColor(plan.progreso, overdue)}>{plan.progreso}%</Text>}
      </Group>
    </Box>
  );
}

function DetailPanel({ plan, onClose }: { plan: PlanDto; onClose: () => void }) {
  const [tab, setTab] = useState<string | null>('info');
  const { data: historial } = usePlanHistorial(plan.id);
  const overdue = isOverdue(plan);

  return (
    <Surface p="md">
      <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
        <Box>
          <Text size="xs" c="dimmed">{plan.codigo}</Text>
          <Text fw={500}>{plan.titulo}</Text>
          <Group gap="xs" mt={6}>
            <Badge color={ESTADO_COLOR[plan.estado]} variant="light" size="xs">{plan.estado} · {plan.progreso}%</Badge>
            {overdue && <Badge color="red" variant="light" size="xs">Vencido</Badge>}
          </Group>
        </Box>
        <Group gap="sm" style={{ flexShrink: 0 }}>
          <Button size="xs" component={Link} href={`${PATH_OPERADOR.editarPlan}?id=${plan.id}`}>Editar</Button>
          <Button size="xs" variant="default" onClick={onClose}>✕</Button>
        </Group>
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="info">Información</Tabs.Tab>
          <Tabs.Tab value="historial">Historial</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="info" pt="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
            <Stack gap={8}>
              {plan.objetivo && <Box><Text size="xs" c="dimmed">Objetivo</Text><Text size="xs">{plan.objetivo}</Text></Box>}
              {plan.area && <Box><Text size="xs" c="dimmed">Área</Text><Text size="xs">{plan.area}</Text></Box>}
              {plan.responsable_nombre && <Box><Text size="xs" c="dimmed">Responsable</Text><Text size="xs">{plan.responsable_nombre}</Text></Box>}
              {plan.tipo_control && <Box><Text size="xs" c="dimmed">Tipo de control</Text><Text size="xs">{plan.tipo_control}</Text></Box>}
            </Stack>
            <Stack gap={8}>
              <Box><Text size="xs" c="dimmed">Estado</Text><Badge color={ESTADO_COLOR[plan.estado]} variant="light" size="xs">{plan.estado}</Badge></Box>
              {plan.fecha_inicio && <Box><Text size="xs" c="dimmed">Inicio</Text><Text size="xs">{new Date(plan.fecha_inicio).toLocaleDateString('es-PE')}</Text></Box>}
              {plan.fecha_limite && <Box><Text size="xs" c="dimmed">Fecha límite</Text><Text size="xs" c={overdue ? 'red' : undefined}>{new Date(plan.fecha_limite).toLocaleDateString('es-PE')}</Text></Box>}
              {plan.indicador && <Box><Text size="xs" c="dimmed">Indicador de éxito</Text><Text size="xs">{plan.indicador}</Text></Box>}
            </Stack>
          </SimpleGrid>
          {plan.observaciones && (
            <Box><Text size="xs" c="dimmed">Observaciones</Text><Text size="xs">{plan.observaciones}</Text></Box>
          )}
          {overdue && (
            <Box mt="sm" p="sm" style={{ background: '#FCEBEB', borderRadius: 8 }}>
              <Text size="xs" c="red" mb={6}>Plan vencido — vinculado a riesgo activo. Se recomienda escalar.</Text>
              <Button size="xs" color="red" variant="outline" component={Link} href={PATH_OPERADOR.escalamiento}>Escalar</Button>
            </Box>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="historial" pt="md">
          {historial.length === 0 ? (
            <Text size="xs" c="dimmed" fs="italic">Sin historial de avance registrado.</Text>
          ) : (
            <Stack gap={0}>
              {historial.map((h, i) => (
                <Group key={h.id ?? i} gap="sm" align="flex-start" pb="sm">
                  <Box style={{ width: 10, height: 10, borderRadius: '50%', background: '#185FA5', marginTop: 4, flexShrink: 0 }} />
                  <Box style={{ flex: 1 }}>
                    <Text size="xs" fw={500}>{h.progreso_anterior}% → {h.progreso_nuevo}% · {h.estado_anterior} → {h.estado_nuevo}</Text>
                    {h.nota && <Text size="xs" c="dimmed">{h.nota}</Text>}
                    <Text size="xs" c="dimmed">{h.nombre_usuario ? `${h.nombre_usuario} · ` : ''}{(() => { const d = h.creado_en ?? h.fecha; return d ? new Date(d).toLocaleString('es-PE') : '—'; })()}</Text>
                  </Box>
                </Group>
              ))}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>
    </Surface>
  );
}

export default function SeguimientoPlanes() {
  const { data: planes, loading, error, refetch } = usePlanes();
  const [selected, setSelected] = useState<PlanDto | null>(null);
  const [filtArea, setFiltArea] = useState('');
  const [filtResp, setFiltResp] = useState('');

  const handleExport = () => {
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Crear hoja de datos
    const headers = ['Código', 'Título', 'Área', 'Responsable', 'Progreso', 'Estado', 'Fecha límite'];
    const rows = filtered.map(p => [
      p.codigo,
      p.titulo,
      p.area || '—',
      (p as any).responsable || p.responsable_id || '—',
      `${p.progreso}%`,
      p.estado,
      p.fecha_limite ? new Date(p.fecha_limite).toLocaleDateString('es-PE') : '—',
    ]);

    // Crear hoja con cabecera y datos
    const wsData = [
      ['Reporte de Planes de Mitigación'],
      [`Fecha de generación: ${new Date().toLocaleString('es-PE')}`],
      [`Total de planes: ${filtered.length}`],
      [],
      headers,
      ...rows,
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Configurar anchos de columnas
    ws['!cols'] = [
      { wch: 15 }, // Código
      { wch: 40 }, // Título
      { wch: 20 }, // Área
      { wch: 25 }, // Responsable
      { wch: 12 }, // Progreso
      { wch: 15 }, // Estado
      { wch: 15 }, // Fecha límite
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Planes');

    // Generar y descargar archivo
    XLSX.writeFile(wb, `planes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const breadcrumbs = [
    { title: 'Dashboard', href: PATH_DASHBOARD.default },
    { title: 'Operador', href: PATH_OPERADOR.dashboard },
    { title: 'Seguimiento de Planes', href: '#' },
  ].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

  const filtered = useMemo(() => planes.filter(p => {
    if (filtArea && p.area !== filtArea) return false;
    if (filtResp && p.responsable_nombre !== filtResp) return false;
    return true;
  }), [planes, filtArea, filtResp]);

  const byEstado = (estado: EstadoPlan) => filtered.filter(p => p.estado === estado);
  const vencidos = filtered.filter(p => p.estado === 'Vencido' || (isOverdue(p) && p.estado !== 'Completado'));

  const areas = [...new Set(planes.map(p => p.area).filter(Boolean))] as string[];
  const responsables = [...new Set(planes.map(p => p.responsable_nombre).filter(Boolean))] as string[];

  const counts = useMemo(() => ({
    total: planes.length,
    completado: planes.filter(p => p.estado === 'Completado').length,
    enProgreso: planes.filter(p => p.estado === 'En progreso').length,
    vencido: planes.filter(p => p.estado === 'Vencido' || (isOverdue(p) && p.estado !== 'Completado')).length,
    pendiente: planes.filter(p => p.estado === 'Pendiente').length,
  }), [planes]);

  return (
    <>
      <title>Seguimiento de Planes | Operador</title>
      <PageHeader
        title="Planes de Mitigación"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            <Button size="xs" component={Link} href={PATH_OPERADOR.nuevoPlan}>+ Nuevo plan</Button>
            <Button size="xs" variant="default" onClick={handleExport}>Exportar</Button>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Métricas */}
        <SimpleGrid cols={{ base: 2, sm: 5 }}>
          {[
            { label: 'Total planes', value: counts.total, color: undefined },
            { label: 'Completados', value: counts.completado, color: 'green' },
            { label: 'En progreso', value: counts.enProgreso, color: 'blue' },
            { label: 'Vencidos', value: counts.vencido, color: 'red' },
            { label: 'Pendientes', value: counts.pendiente, color: 'yellow' },
          ].map((m) => (
            <Surface key={m.label} p="md">
              <Text size="xs" c="dimmed">{m.label}</Text>
              <Title order={3} c={m.color}>{loading ? '—' : m.value}</Title>
            </Surface>
          ))}
        </SimpleGrid>

        {/* Filtros */}
        <Group gap="sm">
          {areas.length > 0 && (
            <Select size="xs" placeholder="Todas las áreas" data={areas} value={filtArea} onChange={v => setFiltArea(v || '')} clearable style={{ width: 160 }} />
          )}
          {responsables.length > 0 && (
            <Select size="xs" placeholder="Todos los responsables" data={responsables} value={filtResp} onChange={v => setFiltResp(v || '')} clearable style={{ width: 180 }} />
          )}
        </Group>

        {/* Error */}
        {error && (
          <Surface p="md">
            <Text c="red" size="sm">Error al cargar planes: {error.message}</Text>
            <Button size="xs" mt="xs" onClick={refetch}>Reintentar</Button>
          </Surface>
        )}

        {loading ? (
          <Group justify="center" p="xl"><Loader size="sm" /></Group>
        ) : (
          /* Kanban */
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
            {([
              { estado: 'Pendiente' as EstadoPlan, label: 'Pendiente', color: undefined },
              { estado: 'En progreso' as EstadoPlan, label: 'En progreso', color: 'blue' },
              { estado: 'Vencido' as EstadoPlan, label: 'Vencidos', color: 'red', items: vencidos },
              { estado: 'Completado' as EstadoPlan, label: 'Completados', color: 'green' },
            ]).map(({ estado, label, color, items }) => {
              const list = items ?? byEstado(estado);
              return (
                <Surface key={estado} p="sm">
                  <Group justify="space-between" mb="sm">
                    <Text size="xs" fw={500}>{label}</Text>
                    <Badge color={color} variant="light" size="xs">{list.length}</Badge>
                  </Group>
                  {list.map(p => (
                    <PlanCard
                      key={p.id}
                      plan={p}
                      selected={selected?.id === p.id}
                      onClick={() => setSelected(prev => prev?.id === p.id ? null : p)}
                    />
                  ))}
                  {list.length === 0 && <Text size="xs" c="dimmed" fs="italic" ta="center" py="sm">Sin planes</Text>}
                  {estado === 'Vencido' && list.length > 0 && (
                    <Box p="sm" mt="xs" style={{ background: '#FCEBEB', borderRadius: 8 }}>
                      <Text size="xs" c="red" mb={6}>Planes vencidos vinculados a riesgos activos.</Text>
                      <Button size="xs" color="red" variant="outline" component={Link} href={PATH_OPERADOR.escalamiento}>Escalar</Button>
                    </Box>
                  )}
                </Surface>
              );
            })}
          </SimpleGrid>
        )}

        {/* Panel de detalle */}
        <Collapse in={!!selected}>
          {selected && <DetailPanel plan={selected} onClose={() => setSelected(null)} />}
        </Collapse>
      </Stack>
    </>
  );
}
