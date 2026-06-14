'use client';
import Link from 'next/link';

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Anchor, Badge, Box, Button, Collapse, Grid, Group, Loader,
  Progress, Select, SimpleGrid, Stack, Tabs, Text, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';
import { useIncidentes, useIncidenteHistorial, useRiesgos, useAreas } from '@/lib/hooks/useApi';
import { TERMINAL_ID } from '@/lib/constants';
import type { IncidenteDto, SeveridadIncidente, EstadoIncidente } from '@/types/trm';

const SEV_COLOR: Record<SeveridadIncidente, string> = { Crítico: 'red', Grave: 'orange', Moderado: 'yellow', Leve: 'green' };
const SEV_HEX: Record<SeveridadIncidente, string> = { Crítico: '#A32D2D', Grave: '#993C1D', Moderado: '#EF9F27', Leve: '#639922' };
const EST_COLOR: Record<EstadoIncidente, string> = { Abierto: 'red', 'En análisis': 'yellow', 'Con plan': 'blue', Cerrado: 'green' };

function DetailPanel({ inc, areaNombre, onClose }: { inc: IncidenteDto; areaNombre: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<string | null>('resumen');
  const { data: historial } = useIncidenteHistorial(inc.id);
  const HIST_COLOR = ['#378ADD', '#E24B4A', '#639922', '#EF9F27'];

  return (
    <Surface p="md">
      <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
        <Box>
          <Text size="xs" c="dimmed">{inc.codigo}</Text>
          <Text fw={500}>{inc.titulo}</Text>
          <Group gap="xs" mt={6}>
            <Badge color={SEV_COLOR[inc.severidad]} variant="light" size="xs">{inc.severidad}</Badge>
            <Badge color={EST_COLOR[inc.estado]} variant="light" size="xs">{inc.estado}</Badge>
            {areaNombre && <Badge color="blue" variant="light" size="xs">{areaNombre}</Badge>}
          </Group>
        </Box>
        <Group gap="sm" style={{ flexShrink: 0 }}>
          <Button size="xs" component={Link} href={`${PATH_OPERADOR.editarIncidente}?id=${inc.id}`}>Editar</Button>
          <Button size="xs" variant="default" onClick={onClose}>✕</Button>
        </Group>
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="resumen">Resumen</Tabs.Tab>
          <Tabs.Tab value="analisis">Análisis</Tabs.Tab>
          <Tabs.Tab value="historial">Historial</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="resumen" pt="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Stack gap={8}>
              {areaNombre && <Box><Text size="xs" c="dimmed">Área</Text><Text size="xs">{areaNombre}</Text></Box>}
              {inc.turno && <Box><Text size="xs" c="dimmed">Turno</Text><Text size="xs">{inc.turno}</Text></Box>}
              {inc.fecha_ocurrencia && <Box><Text size="xs" c="dimmed">Fecha</Text><Text size="xs">{new Date(inc.fecha_ocurrencia).toLocaleDateString('es-PE')}{inc.hora_ocurrencia ? ` · ${inc.hora_ocurrencia}` : ''}</Text></Box>}
              {inc.equipo_involucrado && <Box><Text size="xs" c="dimmed">Equipo</Text><Text size="xs">{inc.equipo_involucrado}</Text></Box>}
              {inc.responsable_nombre && <Box><Text size="xs" c="dimmed">Responsable</Text><Text size="xs">{inc.responsable_nombre}</Text></Box>}
            </Stack>
            <Stack gap={8}>
              {inc.descripcion && <Box><Text size="xs" c="dimmed">Descripción</Text><Text size="xs">{inc.descripcion}</Text></Box>}
              {inc.acciones_inmediatas && <Box><Text size="xs" c="dimmed">Acciones inmediatas</Text><Text size="xs">{inc.acciones_inmediatas}</Text></Box>}
              {inc.observaciones_internas && <Box><Text size="xs" c="dimmed">Observaciones</Text><Text size="xs">{inc.observaciones_internas}</Text></Box>}
            </Stack>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="analisis" pt="md">
          <Stack gap={6}>
            {[
              ['Causa inmediata', inc.causa_inmediata],
              ['Causa raíz', inc.causa_raiz],
              ['Lecciones aprendidas', inc.lecciones_aprendidas],
              ['Motivo de cierre', inc.motivo_cierre],
            ].filter(([, v]) => v).map(([k, v]) => (
              <Group key={k as string} gap="md" align="flex-start" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                <Text size="xs" c="dimmed" style={{ minWidth: 160 }}>{k}</Text>
                <Text size="xs" style={{ flex: 1 }}>{v}</Text>
              </Group>
            ))}
            {!inc.causa_inmediata && !inc.causa_raiz && <Text size="xs" c="dimmed" fs="italic">Sin análisis registrado.</Text>}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="historial" pt="md">
          {historial.length === 0 ? (
            <Text size="xs" c="dimmed" fs="italic">Sin historial registrado.</Text>
          ) : (
            <Stack gap={0}>
              {historial.map((h, i) => (
                <Group key={h.id ?? i} gap="sm" align="flex-start" pb="sm">
                  <Box style={{ width: 10, height: 10, borderRadius: '50%', background: HIST_COLOR[i % HIST_COLOR.length], marginTop: 4, flexShrink: 0 }} />
                  <Box style={{ flex: 1 }}>
                    <Text size="xs" fw={500}>{h.estado_anterior} → {h.estado_nuevo}</Text>
                    {h.justificacion && <Text size="xs" c="dimmed">{h.justificacion}</Text>}
                    <Text size="xs" c="dimmed">{h.usuario ? `${h.usuario} · ` : ''}{(() => { const d = h.creado_en ?? h.fecha; return d ? new Date(d).toLocaleString('es-PE') : '—'; })()}</Text>
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

export default function GestionIncidentes() {
  const { data: incidentes, loading, error, refetch } = useIncidentes();
  const { data: riesgos } = useRiesgos(TERMINAL_ID);
  const { data: areas } = useAreas(TERMINAL_ID);
  const [selected, setSelected] = useState<IncidenteDto | null>(null);
  const [search, setSearch] = useState('');
  const [filtSev, setFiltSev] = useState('');
  const [filtEst, setFiltEst] = useState('');
  const [filtArea, setFiltArea] = useState('');

  const handleExport = () => {
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Crear hoja de datos
    const headers = ['ID', 'Severidad', 'Descripción', 'Área', 'Riesgo', 'Fecha', 'Turno', 'Estado'];
    const rows = filtered.map(inc => [
      inc.codigo,
      inc.severidad,
      inc.titulo,
      getAreaNombre(inc) || '—',
      getRiesgoCodigo(inc) || '—',
      inc.fecha_ocurrencia ? new Date(inc.fecha_ocurrencia).toLocaleDateString('es-PE') : '—',
      inc.turno || '—',
      inc.estado,
    ]);

    // Crear hoja con cabecera y datos
    const wsData = [
      ['Reporte de Incidentes'],
      [`Fecha de generación: ${new Date().toLocaleString('es-PE')}`],
      [`Total de incidentes: ${filtered.length}`],
      [],
      headers,
      ...rows,
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Configurar anchos de columnas
    ws['!cols'] = [
      { wch: 15 }, // ID
      { wch: 12 }, // Severidad
      { wch: 40 }, // Descripción
      { wch: 20 }, // Área
      { wch: 15 }, // Riesgo
      { wch: 15 }, // Fecha
      { wch: 12 }, // Turno
      { wch: 15 }, // Estado
    ];

    // Aplicar estilos a la cabecera
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 4, c: C }); // Fila 5 (índice 4) es la cabecera de datos
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E6F1FB' } },
        alignment: { horizontal: 'center' },
      };
    }

    // Aplicar estilos al título
    ws['A1'].s = {
      font: { bold: true, sz: 16 },
    };

    // Aplicar estilos a la fecha
    ws['A2'].s = {
      font: { italic: true },
    };

    XLSX.utils.book_append_sheet(wb, ws, 'Incidentes');

    // Generar y descargar archivo
    XLSX.writeFile(wb, `incidentes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const breadcrumbs = [
    { title: 'Dashboard', href: PATH_DASHBOARD.default },
    { title: 'Operador', href: PATH_OPERADOR.dashboard },
    { title: 'Gestión de Incidentes', href: '#' },
  ].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return incidentes.filter(inc => {
      if (filtSev && inc.severidad !== filtSev) return false;
      if (filtEst && inc.estado !== filtEst) return false;
      if (filtArea && getAreaNombre(inc) !== filtArea) return false;
      if (q && !inc.titulo.toLowerCase().includes(q) && !inc.codigo.toLowerCase().includes(q) && !(getAreaNombre(inc) ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [incidentes, search, filtSev, filtEst, filtArea]);

  const areaOptions = [...new Set(areas.map(a => a.nombre))];

  // Resuelve el código del riesgo: usa riesgo_codigo si el backend lo popula, si no busca por riesgo_id
  const getRiesgoCodigo = (inc: IncidenteDto) =>
    inc.riesgo_codigo ?? riesgos.find(r => r.id === inc.riesgo_id)?.codigo ?? null;

  // Resuelve el nombre del área: usa inc.area si el backend lo popula, si no busca por area_id
  const getAreaNombre = (inc: IncidenteDto) =>
    inc.area ?? inc.area_nombre ?? areas.find(a => a.id === inc.area_id)?.nombre ?? null;

  const counts = useMemo(() => ({
    total: incidentes.length,
    critico: incidentes.filter(i => i.severidad === 'Crítico').length,
    grave: incidentes.filter(i => i.severidad === 'Grave').length,
    abierto: incidentes.filter(i => i.estado === 'Abierto').length,
    cerrado: incidentes.filter(i => i.estado === 'Cerrado').length,
  }), [incidentes]);

  const areaCounts = useMemo(() => {
    const map: Record<string, number> = {};
    incidentes.forEach(i => { if (i.area) map[i.area] = (map[i.area] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [incidentes]);

  const maxArea = areaCounts[0]?.[1] ?? 1;

  return (
    <>
      <title>Gestión de Incidentes | Operador</title>
      <PageHeader
        title="Gestión de Incidentes"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            <Button size="xs" component={Link} href={PATH_OPERADOR.registroIncidente}>+ Nuevo incidente</Button>
            <Button size="xs" variant="default" onClick={handleExport}>Exportar</Button>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Métricas */}
        <SimpleGrid cols={{ base: 2, sm: 5 }}>
          {[
            { label: 'Total incidentes', value: counts.total, color: undefined },
            { label: 'Críticos', value: counts.critico, color: 'red' },
            { label: 'Graves', value: counts.grave, color: 'orange' },
            { label: 'Abiertos', value: counts.abierto, color: 'yellow' },
            { label: 'Cerrados', value: counts.cerrado, color: 'green' },
          ].map((m) => (
            <Surface key={m.label} p="md">
              <Text size="xs" c="dimmed">{m.label}</Text>
              <Title order={3} c={m.color}>{loading ? '—' : m.value}</Title>
            </Surface>
          ))}
        </SimpleGrid>

        {/* Estadísticas */}
        {areaCounts.length > 0 && (
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Incidentes por área</Text>
                <Stack gap={6}>
                  {areaCounts.map(([area, count]) => (
                    <Group key={area} gap="xs" wrap="nowrap">
                      <Text size="xs" style={{ minWidth: 140 }} lineClamp={1}>{area}</Text>
                      <Progress value={(count / maxArea) * 100} color="blue" size="xs" style={{ flex: 1 }} />
                      <Text size="xs" fw={500} style={{ minWidth: 20, textAlign: 'right' }}>{count}</Text>
                    </Group>
                  ))}
                </Stack>
              </Surface>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Surface p="md" h="100%">
                <Text fw={500} size="sm" mb="sm">Por severidad &amp; estado</Text>
                <Group align="flex-start" gap="xl">
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" mb={4}>Severidad</Text>
                    {(['Crítico','Grave','Moderado','Leve'] as SeveridadIncidente[]).map(s => (
                      <Group key={s} justify="space-between" gap="xs">
                        <Text size="xs">{s}</Text>
                        <Badge color={SEV_COLOR[s]} variant="light" size="xs">{incidentes.filter(i => i.severidad === s).length}</Badge>
                      </Group>
                    ))}
                  </Stack>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" mb={4}>Estado</Text>
                    {(['Abierto','En análisis','Con plan','Cerrado'] as EstadoIncidente[]).map(e => (
                      <Group key={e} justify="space-between" gap="xs">
                        <Text size="xs">{e}</Text>
                        <Badge color={EST_COLOR[e]} variant="light" size="xs">{incidentes.filter(i => i.estado === e).length}</Badge>
                      </Group>
                    ))}
                  </Stack>
                </Group>
              </Surface>
            </Grid.Col>
          </Grid>
        )}

        {/* Error */}
        {error && (
          <Surface p="md">
            <Text c="red" size="sm">Error al cargar incidentes: {error.message}</Text>
            <Button size="xs" mt="xs" onClick={refetch}>Reintentar</Button>
          </Surface>
        )}

        {/* Filtros y tabla */}
        <Surface p="md">
          <Group mb="sm" gap="sm" wrap="wrap">
            <TextInput placeholder="Buscar incidente..." size="xs" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
            <Select size="xs" placeholder="Severidad" data={['Crítico','Grave','Moderado','Leve']} value={filtSev} onChange={v => setFiltSev(v || '')} clearable style={{ width: 130 }} />
            <Select size="xs" placeholder="Estado" data={['Abierto','En análisis','Con plan','Cerrado']} value={filtEst} onChange={v => setFiltEst(v || '')} clearable style={{ width: 130 }} />
            {areaOptions.length > 0 && (
              <Select size="xs" placeholder="Área" data={areaOptions} value={filtArea} onChange={v => setFiltArea(v || '')} clearable style={{ width: 160 }} />
            )}
          </Group>

          {loading ? (
            <Group justify="center" p="xl"><Loader size="sm" /></Group>
          ) : (
            <Box style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)', background: 'var(--mantine-color-default-hover)' }}>
                    {['INC','Sev.','Descripción','Área','Riesgo','Fecha','Turno','Estado',''].map(h => (
                      <th key={h} style={{ fontSize: 11, color: 'var(--mantine-color-dimmed)', fontWeight: 500, textAlign: 'left', padding: '8px 10px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inc, i) => (
                    <tr key={inc.id} onClick={() => setSelected(prev => prev?.id === inc.id ? null : inc)}
                      style={{ cursor: 'pointer', background: selected?.id === inc.id ? '#E6F1FB' : i % 2 === 1 ? 'var(--mantine-color-default-hover)' : 'transparent', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: '#185FA5', fontWeight: 500, whiteSpace: 'nowrap' }}>{inc.codigo}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: SEV_HEX[inc.severidad] }} />
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: 12, maxWidth: 280 }}>
                        <Text size="xs" lineClamp={1}>{inc.titulo}</Text>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--mantine-color-dimmed)' }}>{getAreaNombre(inc) ?? '—'}</td>
                      <td style={{ padding: '8px 10px', fontSize: 11, whiteSpace: 'nowrap' }}>
                        {getRiesgoCodigo(inc)
                          ? <Text size="xs" c="blue" fw={500}>{getRiesgoCodigo(inc)}</Text>
                          : <Text size="xs" c="dimmed">—</Text>}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: 11, whiteSpace: 'nowrap' }}>
                        {inc.fecha_ocurrencia ? new Date(inc.fecha_ocurrencia).toLocaleDateString('es-PE') : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--mantine-color-dimmed)' }}>{inc.turno ?? '—'}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <Badge color={EST_COLOR[inc.estado]} variant="light" size="xs">{inc.estado}</Badge>
                      </td>
                      <td style={{ padding: '6px 10px' }} onClick={e => e.stopPropagation()}>
                        <Button size="xs" variant="subtle" component={Link} href={`${PATH_OPERADOR.editarIncidente}?id=${inc.id}`}>Editar</Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ padding: 24, textAlign: 'center', color: 'var(--mantine-color-dimmed)', fontSize: 13 }}>
                        No se encontraron incidentes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          )}
        </Surface>

        {/* Panel de detalle */}
        <Collapse in={!!selected}>
          {selected && <DetailPanel inc={selected} areaNombre={getAreaNombre(selected)} onClose={() => setSelected(null)} />}
        </Collapse>
      </Stack>
    </>
  );
}
