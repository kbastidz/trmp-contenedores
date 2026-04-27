'use client';

import { useState, useMemo } from 'react';
import {
  Anchor, Badge, Box, Button, Collapse, Group, Loader, Progress,
  Select, SimpleGrid, Stack, Text, TextInput,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';
import { useRiesgos } from '@/lib/hooks/useApi';
import type { NivelRiesgo, EstadoRiesgo, RiesgoDto } from '@/types/trm';

const NIVEL_COLOR: Record<NivelRiesgo, string> = { Crítico: '#A32D2D', Alto: '#993C1D', Medio: '#854F0B', Bajo: '#3B6D11' };
const NIVEL_BADGE: Record<NivelRiesgo, string> = { Crítico: 'red', Alto: 'orange', Medio: 'yellow', Bajo: 'green' };
const ESTADO_BADGE: Record<EstadoRiesgo, string> = { Activo: 'red', 'En revisión': 'orange', 'En mitigación': 'blue', Aceptado: 'yellow', Cerrado: 'green' };
const MATRIX_DATA = [[1,2,3,4,5],[2,4,6,8,10],[3,6,9,12,15],[4,8,12,16,20],[5,10,15,20,25]];

function cellBg(v: number) {
  if (v <= 4) return '#EAF3DE';
  if (v <= 9) return '#FAEEDA';
  if (v <= 16) return '#FAECE7';
  return '#FCEBEB';
}

const PER_PAGE = 10;

export default function GestionRiesgos() {
  const { data: riesgos, loading, error, refetch } = useRiesgos();
  const [filtNivel, setFiltNivel] = useState('todos');
  const [filtArea, setFiltArea] = useState('');
  const [filtEstado, setFiltEstado] = useState('');
  const [query, setQuery] = useState('');
  const [sortCol, setSortCol] = useState('score');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<RiesgoDto | null>(null);

  const breadcrumbs = [
    { title: 'Dashboard', href: PATH_DASHBOARD.default },
    { title: 'Operador', href: PATH_OPERADOR.dashboard },
    { title: 'Gestión de Riesgos', href: '#' },
  ].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return riesgos
      .filter(r => {
        if (filtNivel !== 'todos' && filtNivel !== 'sin-plan' && r.nivel !== filtNivel) return false;
        if (filtNivel === 'sin-plan' && (r.planes ?? []).length > 0) return false;
        if (filtArea && r.area !== filtArea) return false;
        if (filtEstado && r.estado !== filtEstado) return false;
        if (q && !r.nombre.toLowerCase().includes(q) && !r.codigo.toLowerCase().includes(q) && !(r.area ?? '').toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        let av: string | number = sortCol === 'score' ? a.probabilidad * a.impacto : (a as any)[sortCol] ?? '';
        let bv: string | number = sortCol === 'score' ? b.probabilidad * b.impacto : (b as any)[sortCol] ?? '';
        if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv as string).toLowerCase(); }
        return av < bv ? -sortDir : av > bv ? sortDir : 0;
      });
  }, [riesgos, filtNivel, filtArea, filtEstado, query, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 1 ? -1 : 1);
    else { setSortCol(col); setSortDir(-1); }
  };

  const areas = [...new Set(riesgos.map(r => r.area).filter(Boolean))] as string[];

  const counts = useMemo(() => ({
    total: riesgos.length,
    critico: riesgos.filter(r => r.nivel === 'Crítico').length,
    alto: riesgos.filter(r => r.nivel === 'Alto').length,
    medio: riesgos.filter(r => r.nivel === 'Medio').length,
    bajo: riesgos.filter(r => r.nivel === 'Bajo').length,
  }), [riesgos]);

  return (
    <>
      <title>Gestión de Riesgos | Operador</title>
      <PageHeader
        title="Gestión de Riesgos"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            <Button size="xs" component="a" href={PATH_OPERADOR.registroRiesgo}>+ Nuevo riesgo</Button>
            <Button size="xs" variant="default">Exportar</Button>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Métricas */}
        <SimpleGrid cols={{ base: 2, sm: 5 }}>
          {([
            { label: 'Total activos', value: counts.total, color: undefined, badge: undefined },
            { label: 'Críticos', value: counts.critico, color: 'red', badge: 'Score ≥ 17' },
            { label: 'Altos', value: counts.alto, color: 'orange', badge: 'Score 10–16' },
            { label: 'Medios', value: counts.medio, color: 'yellow', badge: 'Score 5–9' },
            { label: 'Bajos', value: counts.bajo, color: 'green', badge: 'Score 1–4' },
          ] as const).map((m) => (
            <Surface key={m.label} p="md">
              <Text size="xl" fw={500} c={m.color}>{loading ? '—' : m.value}</Text>
              <Text size="xs" c="dimmed">{m.label}</Text>
              {m.badge && <Badge color={m.color} variant="light" size="xs" mt={4}>{m.badge}</Badge>}
            </Surface>
          ))}
        </SimpleGrid>

        {/* Error */}
        {error && (
          <Surface p="md">
            <Text c="red" size="sm">Error al cargar riesgos: {error.message}</Text>
            <Button size="xs" mt="xs" onClick={refetch}>Reintentar</Button>
          </Surface>
        )}

        {/* Filtros */}
        <Group gap="sm" wrap="wrap">
          {[
            { key: 'todos', label: `Todos (${counts.total})` },
            { key: 'Crítico', label: `Críticos (${counts.critico})` },
            { key: 'Alto', label: `Altos (${counts.alto})` },
            { key: 'Medio', label: `Medios (${counts.medio})` },
            { key: 'Bajo', label: `Bajos (${counts.bajo})` },
            { key: 'sin-plan', label: 'Sin plan' },
          ].map((f) => (
            <Button
              key={f.key}
              size="xs"
              variant={filtNivel === f.key ? 'filled' : 'default'}
              onClick={() => { setFiltNivel(f.key); setPage(1); setSelected(null); }}
            >
              {f.label}
            </Button>
          ))}
          <Box style={{ width: 1, height: 20, background: 'var(--mantine-color-default-border)' }} />
          <Select size="xs" placeholder="Todas las áreas" data={areas} value={filtArea} onChange={v => { setFiltArea(v || ''); setPage(1); }} clearable style={{ width: 180 }} />
          <Select size="xs" placeholder="Todos los estados" data={['Activo','En revisión','En mitigación','Aceptado','Cerrado']} value={filtEstado} onChange={v => { setFiltEstado(v || ''); setPage(1); }} clearable style={{ width: 160 }} />
          <TextInput size="xs" placeholder="Buscar riesgo..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} style={{ width: 180 }} />
        </Group>

        {/* Tabla */}
        <Surface style={{ overflow: 'hidden' }}>
          {loading ? (
            <Group justify="center" p="xl"><Loader size="sm" /></Group>
          ) : (
            <Box style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: 110 }} /><col style={{ width: 36 }} /><col />
                  <col style={{ width: 130 }} /><col style={{ width: 68 }} /><col style={{ width: 68 }} />
                  <col style={{ width: 96 }} /><col style={{ width: 110 }} /><col style={{ width: 96 }} />
                  <col style={{ width: 72 }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)', background: 'var(--mantine-color-default-hover)' }}>
                    {[
                      { col: 'codigo', label: 'ID ↕' }, { col: '', label: 'Niv.' },
                      { col: 'nombre', label: 'Riesgo ↕' }, { col: 'area', label: 'Área ↕' },
                      { col: 'probabilidad', label: 'Prob.' }, { col: 'impacto', label: 'Imp.' },
                      { col: 'score', label: 'Score ↕' }, { col: '', label: 'Plan activo' },
                      { col: 'estado', label: 'Estado ↕' }, { col: '', label: 'Acción' },
                    ].map(({ col, label }) => (
                      <th key={label} onClick={col ? () => handleSort(col) : undefined}
                        style={{ fontSize: 11, color: 'var(--mantine-color-dimmed)', fontWeight: 500, textAlign: 'left', padding: '8px 10px', cursor: col ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slice.map((r, i) => {
                    const score = r.probabilidad * r.impacto;
                    const isSelected = selected?.id === r.id;
                    return (
                      <tr key={r.id} onClick={() => setSelected(prev => prev?.id === r.id ? null : r)}
                        style={{ cursor: 'pointer', background: isSelected ? '#E6F1FB' : i % 2 === 1 ? 'var(--mantine-color-default-hover)' : 'transparent', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <td style={{ padding: '8px 10px', fontSize: 11, color: '#185FA5', fontWeight: 500 }}>{r.codigo}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <Box style={{ width: 10, height: 10, borderRadius: '50%', background: NIVEL_COLOR[r.nivel], margin: '0 auto' }} />
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: 12, wordBreak: 'break-word' }}>{r.nombre}</td>
                        <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--mantine-color-dimmed)' }}>{r.area ?? '—'}</td>
                        <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 500, textAlign: 'center' }}>{r.probabilidad}/5</td>
                        <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 500, textAlign: 'center' }}>{r.impacto}/5</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <Box style={{ width: 28, height: 28, borderRadius: '50%', background: cellBg(score), color: NIVEL_COLOR[r.nivel], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, margin: '0 auto' }}>{score}</Box>
                          <Text size="xs" style={{ color: NIVEL_COLOR[r.nivel], marginTop: 2 }}>{r.nivel}</Text>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          {(r.planes ?? []).length === 0
                            ? <Text size="xs" c="dimmed">Sin plan</Text>
                            : (r.planes ?? []).map(p => (
                              <Box key={p.id} mb={2}>
                                <Text size="xs" c="dimmed">{p.codigo}</Text>
                                <Box style={{ height: 3, background: 'var(--mantine-color-default-border)', borderRadius: 2, overflow: 'hidden' }}>
                                  <Box style={{ height: '100%', width: `${p.progreso}%`, background: p.estado === 'Vencido' ? '#E24B4A' : p.progreso === 0 ? '#B4B2A9' : '#378ADD', borderRadius: 2 }} />
                                </Box>
                              </Box>
                            ))
                          }
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <Badge color={ESTADO_BADGE[r.estado]} variant="light" size="xs">{r.estado}</Badge>
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                          <Button size="xs" variant="subtle" component="a" href={PATH_OPERADOR.editarRiesgo}>Editar</Button>
                        </td>
                      </tr>
                    );
                  })}
                  {slice.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: 'var(--mantine-color-dimmed)', fontSize: 13 }}>
                        No se encontraron riesgos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          )}

          {/* Paginación */}
          <Group justify="space-between" p="sm" style={{ borderTop: '0.5px solid var(--mantine-color-default-border)' }}>
            <Text size="xs" c="dimmed">
              Mostrando {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length} riesgos
            </Text>
            <Group gap={4}>
              {page > 1 && <Button size="xs" variant="default" onClick={() => setPage(p => p - 1)}>←</Button>}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} size="xs" variant={p === page ? 'filled' : 'default'} onClick={() => setPage(p)}>{p}</Button>
              ))}
              {page < totalPages && <Button size="xs" variant="default" onClick={() => setPage(p => p + 1)}>→</Button>}
            </Group>
          </Group>
        </Surface>

        {/* Panel de detalle rápido */}
        <Collapse in={!!selected}>
          {selected && (
            <Surface p="md">
              <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                <Box>
                  <Text size="xs" c="dimmed" mb={2}>{selected.codigo}</Text>
                  <Text fw={500}>{selected.nombre}</Text>
                  <Group gap="xs" mt={6}>
                    <Badge color={NIVEL_BADGE[selected.nivel]} variant="light" size="xs">{selected.nivel} · {selected.probabilidad * selected.impacto}</Badge>
                    <Badge color="blue" variant="light" size="xs">{selected.area ?? '—'}</Badge>
                    <Badge color={ESTADO_BADGE[selected.estado]} variant="light" size="xs">{selected.estado}</Badge>
                  </Group>
                </Box>
                <Group gap="sm" style={{ flexShrink: 0 }}>
                  <Button size="xs" component="a" href={PATH_OPERADOR.detalleRiesgo}>Ver ficha completa</Button>
                  <Button size="xs" variant="default" onClick={() => setSelected(null)}>✕</Button>
                </Group>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Stack gap={8}>
                  <Box><Text size="xs" c="dimmed">Descripción</Text><Text size="xs">{selected.descripcion ?? '—'}</Text></Box>
                  <Box><Text size="xs" c="dimmed">Causa raíz</Text><Text size="xs">{selected.causa ?? '—'}</Text></Box>
                  <Box><Text size="xs" c="dimmed">Responsable</Text><Text size="xs">{selected.responsable ?? '—'}</Text></Box>
                  <Box><Text size="xs" c="dimmed">Última revisión</Text><Text size="xs">{selected.ultima_revision ?? '—'}</Text></Box>
                </Stack>

                <Stack gap="sm">
                  <Box>
                    <Text size="xs" c="dimmed" mb={6}>Posición en matriz</Text>
                    <SimpleGrid cols={5} spacing={2}>
                      {[...Array(5)].map((_, rowIdx) => {
                        const row = 4 - rowIdx;
                        return [...Array(5)].map((_, col) => {
                          const v = MATRIX_DATA[row][col];
                          const isActive = row === selected.probabilidad - 1 && col === selected.impacto - 1;
                          return (
                            <Box key={`${row}-${col}`} style={{ height: 24, borderRadius: 3, background: cellBg(v), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500, outline: isActive ? '2.5px solid var(--mantine-color-text)' : 'none' }}>
                              {isActive ? '★' : ''}
                            </Box>
                          );
                        });
                      })}
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Text size="xs" c="dimmed" mb={6}>Planes de mitigación</Text>
                    {(selected.planes ?? []).length === 0
                      ? <Text size="xs" c="dimmed">Sin planes asignados</Text>
                      : (selected.planes ?? []).map(p => (
                        <Group key={p.id} gap="xs" mb={4}>
                          <Text size="xs" c="blue" fw={500} style={{ minWidth: 56 }}>{p.codigo}</Text>
                          <Progress value={p.progreso} color={p.estado === 'Vencido' ? 'red' : p.progreso === 0 ? 'gray' : 'blue'} size="xs" style={{ flex: 1 }} />
                          <Text size="xs" fw={500} style={{ minWidth: 28, textAlign: 'right' }}>{p.progreso}%</Text>
                          <Badge color={p.estado === 'Vencido' ? 'red' : p.estado === 'Pendiente' ? 'gray' : 'blue'} variant="light" size="xs">{p.estado}</Badge>
                        </Group>
                      ))
                    }
                  </Box>
                </Stack>
              </SimpleGrid>
            </Surface>
          )}
        </Collapse>

        {/* Footer */}
        <Group justify="space-between" pt="xs" style={{ borderTop: '0.5px solid var(--mantine-color-default-border)' }}>
          <Text size="xs" c="dimmed">Terminal Risk Monitor v2.1 · Última actualización: hoy</Text>
          <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.reporteEjecutivo}>Reporte ejecutivo</Button>
        </Group>
      </Stack>
    </>
  );
}
