'use client';

import { useEffect, useRef } from 'react';
import { Anchor, Badge, Box, Grid, Group, Paper, Progress, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: '#' },
  { title: 'Dashboard Riesgos', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const METRICS = [
  { label: 'Riesgos activos', value: '24', badge: '6 críticos', badgeColor: 'red' },
  { label: 'Incidentes (30d)', value: '17', badge: '+3 vs mes ant.', badgeColor: 'yellow' },
  { label: 'Controles vigentes', value: '41', badge: '87% efectivos', badgeColor: 'green' },
  { label: 'Acciones pendientes', value: '9', badge: '2 vencidas', badgeColor: 'blue' },
];

const RISKS = [
  { name: 'Caída de contenedor en operación RTG', area: 'Patio', score: 20, color: 'red' },
  { name: 'Falla de grúa STS en operación de buque', area: 'Muelle', score: 20, color: 'red' },
  { name: 'Incendio en carga IMDG clase 3', area: 'Patio', score: 15, color: 'orange' },
  { name: 'Acceso no autorizado a zona restringida', area: 'Seg. ISPS', score: 12, color: 'orange' },
  { name: 'Falla del TOS — pérdida de trazabilidad', area: 'Sistemas', score: 12, color: 'orange' },
  { name: 'Atropello por reach stacker en patio', area: 'Patio', score: 10, color: 'yellow' },
];

const INCIDENTS = [
  { desc: 'Operador de RTG reporta fallo hidráulico', area: 'Patio', nivel: 'Alto', estado: 'En análisis', color: 'yellow' },
  { desc: 'Contenedor con daño estructural detectado en gate', area: 'Gate', nivel: 'Medio', estado: 'Cerrado', color: 'green' },
  { desc: 'Derrame menor de lubricante en taller', area: 'Taller', nivel: 'Bajo', estado: 'Cerrado', color: 'green' },
  { desc: 'Acceso intento de persona no autorizada', area: 'ISPS', nivel: 'Crítico', estado: 'Escalado', color: 'red' },
  { desc: 'Retraso operacional por viento > 45 km/h', area: 'Muelle', nivel: 'Medio', estado: 'Monitoreando', color: 'blue' },
];

const KRIS = [
  { name: 'Movimientos/hora (grúas)', val: 78, color: 'blue', text: '78%' },
  { name: 'Tasa de incidentes (MTD)', val: 62, color: 'yellow', text: '62%' },
  { name: 'Disponib. de equipos', val: 91, color: 'green', text: '91%' },
  { name: 'Tiempo resp. emergencia', val: 45, color: 'red', text: '4.5 min' },
];

const ACTIVITIES = [
  { text: 'Plan de mitigación actualizado — Riesgo RTG-04', time: 'Hace 12 min', color: 'blue' },
  { text: 'Nuevo incidente registrado en área ISPS', time: 'Hace 43 min', color: 'red' },
  { text: 'Control preventivo validado — Grúa STS-2', time: 'Hace 1h 20min', color: 'green' },
  { text: 'Alerta: KRI de respuesta a emergencia supera umbral', time: 'Hace 2h', color: 'yellow' },
];

const AREAS = [
  { label: 'Muelle / Buque', riesgos: 5, pct: 80, color: 'red' },
  { label: 'Patio / Yard', riesgos: 7, pct: 70, color: 'orange' },
  { label: 'Gate / Portería', riesgos: 4, pct: 40, color: 'blue' },
  { label: 'Taller / Equipos', riesgos: 5, pct: 55, color: 'yellow' },
  { label: 'Seg. ISPS / BASC', riesgos: 3, pct: 30, color: 'green' },
];

const MATRIX_DATA = [
  [1,2,3,4,5],
  [2,4,6,8,10],
  [3,6,9,12,15],
  [4,8,12,16,20],
  [5,10,15,20,25],
];

const MATRIX_DOTS: Record<string, number> = { '4-3': 2, '3-4': 1, '4-4': 1, '3-2': 1, '1-4': 1, '2-3': 2 };

function getCellColor(v: number) {
  if (v <= 4) return '#EAF3DE';
  if (v <= 9) return '#FAEEDA';
  if (v <= 16) return '#FAECE7';
  return '#FCEBEB';
}

function getScoreBadge(score: number): 'red' | 'orange' | 'yellow' | 'green' {
  if (score >= 20) return 'red';
  if (score >= 15) return 'orange';
  if (score >= 10) return 'yellow';
  return 'green';
}

export default function DashboardRiesgos() {
  const clockRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const update = () => {
      if (clockRef.current) {
        clockRef.current.textContent = new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
      }
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <title>Dashboard Riesgos | Operador</title>
      <PageHeader title="Dashboard de Riesgos" breadcrumbItems={breadcrumbs} />

      <Stack gap="md" mt="md">
        {/* Métricas */}
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          {METRICS.map((m) => (
            <Surface key={m.label} p="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={500}>{m.label}</Text>
              <Title order={2} mt={4}>{m.value}</Title>
              <Badge color={m.badgeColor} variant="light" size="sm" mt={4}>{m.badge}</Badge>
            </Surface>
          ))}
        </SimpleGrid>

        {/* Matriz + Riesgos principales */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Surface p="md" h="100%">
              <Group justify="space-between" mb="sm">
                <Text fw={500} size="sm">Matriz de riesgo</Text>
                <Text size="xs" c="dimmed">probabilidad × impacto</Text>
              </Group>
              <Box>
                <SimpleGrid cols={5} spacing={4}>
                  {[...Array(5)].map((_, rowIdx) => {
                    const r = 4 - rowIdx;
                    return [...Array(5)].map((_, c) => {
                      const v = MATRIX_DATA[r][c];
                      const key = `${r}-${c}`;
                      const count = MATRIX_DOTS[key] || 0;
                      return (
                        <Box
                          key={key}
                          style={{
                            height: 44,
                            borderRadius: 6,
                            background: getCellColor(v),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {count > 0 && <Text size="sm" fw={500}>{count}</Text>}
                        </Box>
                      );
                    });
                  })}
                </SimpleGrid>
                <SimpleGrid cols={5} spacing={4} mt={4}>
                  {['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto'].map((l) => (
                    <Text key={l} size="xs" c="dimmed" ta="center">{l}</Text>
                  ))}
                </SimpleGrid>
                <Text size="xs" c="dimmed" ta="center" mt={2}>Impacto →</Text>
              </Box>
              <Group gap="xs" mt="sm">
                <Badge color="green" variant="light" size="xs">Bajo (1-4)</Badge>
                <Badge color="yellow" variant="light" size="xs">Medio (5-9)</Badge>
                <Badge color="orange" variant="light" size="xs">Alto (10-16)</Badge>
                <Badge color="red" variant="light" size="xs">Crítico (17-25)</Badge>
              </Group>
            </Surface>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Surface p="md" h="100%">
              <Group justify="space-between" mb="sm">
                <Text fw={500} size="sm">Riesgos principales</Text>
                <Text size="xs" c="dimmed">por nivel</Text>
              </Group>
              <Stack gap={6}>
                {RISKS.map((r) => (
                  <Group key={r.name} gap="xs" wrap="nowrap" style={{ padding: '6px 8px', borderRadius: 6, border: '0.5px solid var(--mantine-color-default-border)', cursor: 'pointer' }}>
                    <Box style={{ width: 10, height: 10, borderRadius: '50%', background: r.color === 'red' ? '#A32D2D' : r.color === 'orange' ? '#993C1D' : '#BA7517', flexShrink: 0 }} />
                    <Text size="xs" style={{ flex: 1 }} lineClamp={1}>{r.name}</Text>
                    <Text size="xs" c="dimmed">{r.area}</Text>
                    <Badge color={getScoreBadge(r.score)} variant="light" size="xs">{r.score}</Badge>
                  </Group>
                ))}
              </Stack>
            </Surface>
          </Grid.Col>
        </Grid>

        {/* Incidentes + KRI + Actividad */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Surface p="md">
              <Group justify="space-between" mb="sm">
                <Text fw={500} size="sm">Incidentes recientes</Text>
                <Text size="xs" c="dimmed">últimas 48h</Text>
              </Group>
              <Table striped highlightOnHover withTableBorder={false} fz="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Descripción</Table.Th>
                    <Table.Th>Área</Table.Th>
                    <Table.Th>Nivel</Table.Th>
                    <Table.Th>Estado</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {INCIDENTS.map((inc) => (
                    <Table.Tr key={inc.desc} style={{ cursor: 'pointer' }}>
                      <Table.Td>{inc.desc}</Table.Td>
                      <Table.Td>{inc.area}</Table.Td>
                      <Table.Td><Badge color={inc.color} variant="light" size="xs">{inc.nivel}</Badge></Table.Td>
                      <Table.Td><Text size="xs" c="dimmed">{inc.estado}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Surface>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">KRI — Indicadores clave</Text>
                <Stack gap={8}>
                  {KRIS.map((k) => (
                    <Group key={k.name} gap="xs" wrap="nowrap">
                      <Text size="xs" style={{ minWidth: 160 }} lineClamp={1}>{k.name}</Text>
                      <Progress value={k.val} color={k.color} size="xs" style={{ flex: 1 }} />
                      <Text size="xs" fw={500} style={{ minWidth: 40, textAlign: 'right' }}>{k.text}</Text>
                    </Group>
                  ))}
                </Stack>
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Actividad reciente</Text>
                <Stack gap={6}>
                  {ACTIVITIES.map((a) => (
                    <Group key={a.text} gap="xs" align="flex-start" wrap="nowrap">
                      <Box style={{ width: 6, height: 6, borderRadius: '50%', background: a.color === 'blue' ? '#378ADD' : a.color === 'red' ? '#E24B4A' : a.color === 'green' ? '#639922' : '#EF9F27', marginTop: 5, flexShrink: 0 }} />
                      <Box>
                        <Text size="xs">{a.text}</Text>
                        <Text size="xs" c="dimmed">{a.time}</Text>
                      </Box>
                    </Group>
                  ))}
                </Stack>
              </Surface>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Áreas */}
        <SimpleGrid cols={{ base: 2, sm: 5 }}>
          {AREAS.map((a) => (
            <Surface key={a.label} p="sm" style={{ cursor: 'pointer' }}>
              <Text size="xs" c="dimmed">{a.label}</Text>
              <Text fw={500} mt={2}>{a.riesgos} riesgos</Text>
              <Progress value={a.pct} color={a.color} size="xs" mt={6} />
            </Surface>
          ))}
        </SimpleGrid>
      </Stack>
    </>
  );
}
