'use client';
import Link from 'next/link';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Anchor, Badge, Box, Button, Group, Loader, Progress, SimpleGrid,
  Stack, Tabs, Text, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';
import {
  useRiesgo, useRiesgoHistorial, usePlanesByRiesgo,
  useIncidentesByRiesgo, useKriByTerminal,
} from '@/lib/hooks/useApi';
import type { NivelRiesgo, EstadoRiesgo, RiesgoControlDto, IncidenteDto } from '@/types/trm';

const MATRIX_DATA = [[1,2,3,4,5],[2,4,6,8,10],[3,6,9,12,15],[4,8,12,16,20],[5,10,15,20,25]];
function getCellColor(v: number) {
  if (v <= 4) return '#EAF3DE';
  if (v <= 9) return '#FAEEDA';
  if (v <= 16) return '#FAECE7';
  return '#FCEBEB';
}
const NIVEL_COLOR: Record<NivelRiesgo, string> = { Crítico: 'red', Alto: 'orange', Medio: 'yellow', Bajo: 'green' };
const ESTADO_COLOR: Record<EstadoRiesgo, string> = { Activo: 'red', 'En revisión': 'orange', 'En mitigación': 'blue', Aceptado: 'yellow', Cerrado: 'green' };
const SEVERIDAD_COLOR: Record<string, { c: string; bg: string }> = {
  Crítico:  { c: '#A32D2D', bg: '#FCEBEB' },
  Grave:    { c: '#993C1D', bg: '#FAECE7' },
  Moderado: { c: '#854F0B', bg: '#FAEEDA' },
  Leve:     { c: '#3B6D11', bg: '#EAF3DE' },
};

export default function DetalleRiesgo() {
  const params = useSearchParams();
  const id = params.get('id');
  const [activeTab, setActiveTab] = useState<string | null>('evaluacion');

  const { data: riesgo, loading, error } = useRiesgo(id);
  const { data: historial } = useRiesgoHistorial(id);
  const { data: planes } = usePlanesByRiesgo(id);
  const { data: allIncidentes } = useIncidentesByRiesgo(id);
  const { data: kris } = useKriByTerminal(riesgo?.terminal_id ?? null);
  const controles = riesgo?.controles ?? [];
  // Filtrar incidentes en frontend porque el backend no filtra correctamente por riesgo_id
  const incidentes = allIncidentes?.filter(inc => inc.riesgo_id === id) ?? [];

  const breadcrumbs = [
    { title: 'Dashboard', href: PATH_DASHBOARD.default },
    { title: 'Operador', href: PATH_OPERADOR.dashboard },
    { title: 'Gestión de Riesgos', href: PATH_OPERADOR.gestionRiesgos },
    { title: riesgo?.codigo ?? '…', href: '#' },
  ].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

  if (loading) return (
    <>
      <PageHeader title="Detalle de Riesgo" breadcrumbItems={breadcrumbs} />
      <Group justify="center" mt="xl"><Loader /></Group>
    </>
  );

  if (error || !riesgo) return (
    <>
      <PageHeader title="Detalle de Riesgo" breadcrumbItems={breadcrumbs} />
      <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
        <Text c="red">{error?.message ?? 'Riesgo no encontrado. Verifica el ID en la URL.'}</Text>
        <Button size="xs" mt="md" variant="default" component={Link} href={PATH_OPERADOR.gestionRiesgos}>← Volver al listado</Button>
      </Surface>
    </>
  );

  const score = riesgo.probabilidad * riesgo.impacto;
  const editHref = `${PATH_OPERADOR.editarRiesgo}?id=${riesgo.id}`;

  return (
    <>
      <title>Detalle de Riesgo | Operador</title>
      <PageHeader
        title="Detalle de Riesgo"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.gestionRiesgos}>← Volver</Button>
            <Button size="xs" variant="default" component={Link} href={editHref}>Editar</Button>
            <Button size="xs" component={Link} href={PATH_OPERADOR.nuevoPlan}>+ Plan</Button>
            <Button size="xs" component={Link} href={PATH_OPERADOR.registroIncidente}>+ Incidente</Button>
          </Group>
        }
      />
      <Stack gap="md" mt="md">
        {/* Hero */}
        <Surface p="md" style={{ border: '0.5px solid #F09595' }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md" pb="md" style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
            <Box style={{ flex: 1 }}>
              <Text size="xs" c="dimmed" mb={4}>{riesgo.codigo}</Text>
              <Title order={4} mb={6}>{riesgo.nombre}</Title>
              <Group gap="xs" mb={8}>
                <Badge color={NIVEL_COLOR[riesgo.nivel]} variant="light">{riesgo.nivel}</Badge>
                {riesgo.area && <Badge color="blue" variant="light">{riesgo.area}</Badge>}
                {riesgo.categoria && <Badge color="yellow" variant="light">{riesgo.categoria}</Badge>}
                <Badge color={ESTADO_COLOR[riesgo.estado]} variant="light">{riesgo.estado}</Badge>
              </Group>
              {riesgo.descripcion && <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>{riesgo.descripcion}</Text>}
            </Box>
            <SimpleGrid cols={2} spacing={6} style={{ minWidth: 200 }}>
              {[
                { label: 'Puntaje', value: String(score), color: score >= 17 ? 'red' : score >= 10 ? 'orange' : score >= 5 ? 'yellow' : 'green', sub: riesgo.nivel },
                { label: 'Probabilidad', value: `${riesgo.probabilidad}/5`, color: undefined, sub: '' },
                { label: 'Impacto', value: `${riesgo.impacto}/5`, color: undefined, sub: '' },
              ].map((m) => (
                <Box key={m.label} p="xs" style={{ background: 'var(--mantine-color-default-hover)', borderRadius: 8, textAlign: 'center' }}>
                  <Title order={3} c={m.color}>{m.value}</Title>
                  <Text size="xs" c="dimmed">{m.label}</Text>
                  {m.sub && <Text size="xs" c="dimmed">{m.sub}</Text>}
                </Box>
              ))}
            </SimpleGrid>
          </Group>
          <Group gap="xl" wrap="wrap">
            {riesgo.responsable_nombre && <Box><Text size="xs" c="dimmed">Responsable</Text><Text size="xs" fw={500}>{riesgo.responsable_nombre}</Text></Box>}
            {riesgo.createdAt && <Box><Text size="xs" c="dimmed">Registrado</Text><Text size="xs" fw={500}>{new Date(riesgo.createdAt).toLocaleDateString('es-PE')}</Text></Box>}
            {riesgo.ultima_revision && <Box><Text size="xs" c="dimmed">Última revisión</Text><Text size="xs" fw={500}>{new Date(riesgo.ultima_revision).toLocaleDateString('es-PE')}</Text></Box>}
          </Group>
        </Surface>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="evaluacion">Evaluación</Tabs.Tab>
            <Tabs.Tab value="controles">Controles {controles.length > 0 && `(${controles.length})`}</Tabs.Tab>
            <Tabs.Tab value="planes">Planes {planes.length > 0 && `(${planes.length})`}</Tabs.Tab>
            <Tabs.Tab value="incidentes">Incidentes {incidentes.length > 0 && `(${incidentes.length})`}</Tabs.Tab>
            <Tabs.Tab value="historial">Historial</Tabs.Tab>
          </Tabs.List>

          {/* Evaluación */}
          <Tabs.Panel value="evaluacion" pt="md">
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Surface p="md">
                  <Text fw={500} size="sm" mb="sm">Posición en matriz</Text>
                  <SimpleGrid cols={5} spacing={3}>
                    {[...Array(5)].map((_, rowIdx) => {
                      const r = 4 - rowIdx;
                      return [...Array(5)].map((_, c) => {
                        const v = MATRIX_DATA[r][c];
                        const active = r === riesgo.probabilidad - 1 && c === riesgo.impacto - 1;
                        return (
                          <Box key={`${r}-${c}`} style={{ height: 28, borderRadius: 4, background: getCellColor(v), display: 'flex', alignItems: 'center', justifyContent: 'center', outline: active ? '2.5px solid var(--mantine-color-text)' : 'none', fontSize: 10, fontWeight: 500 }}>
                            {active ? '★' : ''}
                          </Box>
                        );
                      });
                    })}
                  </SimpleGrid>
                  <Group gap="xs" mt="sm">
                    <Badge color="green" variant="light" size="xs">Bajo 1–4</Badge>
                    <Badge color="yellow" variant="light" size="xs">Medio 5–9</Badge>
                    <Badge color="orange" variant="light" size="xs">Alto 10–16</Badge>
                    <Badge color="red" variant="light" size="xs">Crítico 17–25</Badge>
                  </Group>
                </Surface>
                {kris.length > 0 && (
                  <Surface p="md">
                    <Text fw={500} size="sm" mb="sm">KRI de la terminal</Text>
                    <Stack gap={6}>
                      {kris.map((k) => {
                        const val = k.ultimo_valor ?? 0;
                        const max = k.umbral_critico ?? 100;
                        const pct = Math.min(Math.round((val / max) * 100), 100);
                        const color = k.ultimo_estado === 'Crítico' ? 'red' : k.ultimo_estado === 'Alerta' ? 'yellow' : 'green';
                        return (
                          <Group key={k.id} gap="xs" wrap="nowrap">
                            <Text size="xs" style={{ flex: 1 }} lineClamp={1}>{k.nombre}</Text>
                            <Progress value={pct} color={color} size="xs" style={{ width: 80 }} />
                            <Text size="xs" fw={500} style={{ minWidth: 36, textAlign: 'right' }}>{val}</Text>
                            {k.ultimo_estado && <Badge color={color} variant="light" size="xs">{k.ultimo_estado}</Badge>}
                          </Group>
                        );
                      })}
                    </Stack>
                  </Surface>
                )}
              </SimpleGrid>
              {riesgo.causa && (
                <Surface p="md">
                  <Text fw={500} size="sm" mb="sm">Causa raíz</Text>
                  <Text size="xs">{riesgo.causa}</Text>
                </Surface>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Controles */}
          <Tabs.Panel value="controles" pt="md">
            <Surface p="md">
              <Group justify="space-between" mb="sm">
                <Text fw={500} size="sm">Controles vinculados</Text>
                <Text size="xs" c="dimmed">{controles.filter(c => c.efectivo).length} de {controles.length} efectivos</Text>
              </Group>
              {controles.length === 0 ? (
                <Text size="xs" c="dimmed" fs="italic">Sin controles vinculados.</Text>
              ) : (
                <Stack gap={6}>
                  {controles.map((c: RiesgoControlDto) => (
                    <Group key={c.id} gap="sm" p="xs" style={{ border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 8 }}>
                      <Box style={{ width: 14, height: 14, borderRadius: '50%', border: `0.5px solid ${c.efectivo ? '#3B6D11' : '#F09595'}`, background: c.efectivo ? '#EAF3DE' : '#FCEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={c.efectivo ? '#3B6D11' : '#A32D2D'} strokeWidth="2.5">
                          {c.efectivo ? <polyline points="10 3 5 8 2 5" /> : <><line x1="2" y1="2" x2="10" y2="10" /><line x1="10" y1="2" x2="2" y2="10" /></>}
                        </svg>
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" fw={500}>{c.control_nombre || `Control ID: ${c.control_id}`}</Text>
                        {c.observaciones && <Text size="xs" c={c.efectivo ? 'dimmed' : 'red'}>{c.observaciones}</Text>}
                      </Box>
                      <Text size="xs" c="dimmed">{c.control_tipo || '—'}</Text>
                    </Group>
                  ))}
                </Stack>
              )}
            </Surface>
          </Tabs.Panel>

          {/* Planes */}
          <Tabs.Panel value="planes" pt="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Planes de mitigación vinculados</Text>
              {planes.length === 0 ? (
                <Text size="xs" c="dimmed" fs="italic">Sin planes vinculados.</Text>
              ) : (
                <Stack gap={6}>
                  {planes.map((p) => (
                    <Group key={p.id} justify="space-between" style={{ padding: '8px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed" mb={2}>{p.codigo}{p.fecha_limite ? ` · Vence: ${new Date(p.fecha_limite).toLocaleDateString('es-PE')}` : ''}</Text>
                        <Text size="xs" fw={500}>{p.titulo}</Text>
                        <Progress value={p.progreso} color={p.progreso === 0 ? 'gray' : p.progreso < 50 ? 'red' : 'blue'} size="xs" mt={4} style={{ maxWidth: 160 }} />
                      </Box>
                      <Box ta="right">
                        <Badge variant="light" size="xs">{p.estado}</Badge>
                        <Text size="xs" c="dimmed" mt={4}>{p.progreso}%</Text>
                      </Box>
                    </Group>
                  ))}
                </Stack>
              )}
              <Button size="xs" variant="default" mt="sm" component={Link} href={PATH_OPERADOR.nuevoPlan}>+ Nuevo plan</Button>
            </Surface>
          </Tabs.Panel>

          {/* Incidentes */}
          <Tabs.Panel value="incidentes" pt="md">
            <Surface p="md">
              <Group justify="space-between" mb="sm">
                <Text fw={500} size="sm">Incidentes vinculados</Text>
                <Text size="xs" c="dimmed">{incidentes.length} registros</Text>
              </Group>
              {incidentes.length === 0 ? (
                <Text size="xs" c="dimmed" fs="italic">Sin incidentes vinculados.</Text>
              ) : (
                <Stack gap={0}>
                  {incidentes.map((inc: IncidenteDto) => {
                    const sev = SEVERIDAD_COLOR[inc.severidad] ?? { c: '#185FA5', bg: '#E6F1FB' };
                    return (
                      <Group key={inc.id} gap="sm" style={{ padding: '8px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Box style={{ width: 7, height: 7, borderRadius: '50%', background: sev.c, flexShrink: 0 }} />
                        <Box style={{ flex: 1 }}>
                          <Text size="xs">{inc.titulo}</Text>
                          <Text size="xs" c="dimmed">{inc.codigo}{inc.fecha_ocurrencia ? ` · ${new Date(inc.fecha_ocurrencia).toLocaleDateString('es-PE')}` : ''}</Text>
                        </Box>
                        <Badge style={{ background: sev.bg, color: sev.c }} size="xs">{inc.severidad}</Badge>
                      </Group>
                    );
                  })}
                </Stack>
              )}
              <Button size="xs" variant="default" mt="sm" component={Link} href={PATH_OPERADOR.registroIncidente}>+ Vincular incidente</Button>
            </Surface>
          </Tabs.Panel>

          {/* Historial */}
          <Tabs.Panel value="historial" pt="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Historial de cambios de estado</Text>
              {historial.length === 0 ? (
                <Text size="xs" c="dimmed" fs="italic">Sin historial registrado.</Text>
              ) : (
                <Stack gap={0}>
                  {historial.map((h, i) => (
                    <Group key={h.id ?? i} gap="sm" align="flex-start" pb="sm">
                      <Box style={{ width: 9, height: 9, borderRadius: '50%', background: '#185FA5', marginTop: 4, flexShrink: 0 }} />
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" fw={500}>{h.estado_anterior} → {h.estado_nuevo}</Text>
                        {h.justificacion && <Text size="xs" c="dimmed">{h.justificacion}</Text>}
                        <Text size="xs" c="dimmed">{h.usuario ? `${h.usuario} · ` : ''}{(() => { const d = h.creado_en ?? h.fecha; return d ? new Date(d).toLocaleString('es-PE') : '—'; })()}</Text>
                      </Box>
                    </Group>
                  ))}
                </Stack>
              )}
            </Surface>
          </Tabs.Panel>
        </Tabs>

        {/* Footer */}
        <Group justify="space-between" pt="sm" style={{ borderTop: '0.5px solid var(--mantine-color-default-border)' }}>
          <Text size="xs" c="dimmed">{riesgo.codigo} · Terminal Risk Monitor</Text>
          <Group gap="sm">
            <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.seguimientoPlanes}>Planes</Button>
            <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.gestionIncidentes}>Incidentes</Button>
          </Group>
        </Group>
      </Stack>
    </>
  );
}
