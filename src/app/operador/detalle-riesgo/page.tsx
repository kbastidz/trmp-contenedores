'use client';

import { useState } from 'react';
import {
  Anchor, Badge, Box, Button, Group, Progress, SimpleGrid,
  Stack, Tabs, Text, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Gestión de Riesgos', href: PATH_OPERADOR.gestionRiesgos },
  { title: 'RISK-2026-001', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const MATRIX_DATA = [[1,2,3,4,5],[2,4,6,8,10],[3,6,9,12,15],[4,8,12,16,20],[5,10,15,20,25]];
function getCellColor(v: number) {
  if (v <= 4) return '#EAF3DE';
  if (v <= 9) return '#FAEEDA';
  if (v <= 16) return '#FAECE7';
  return '#FCEBEB';
}

const CONTROLES = [
  { n: 'Inspección preoperacional RTGs (diaria)', t: 'Preventivo', ok: false, nota: 'Incumplida en 3 turnos recientes' },
  { n: 'POE de apilamiento de contenedores', t: 'Preventivo', ok: true, nota: 'Vigente y actualizado' },
  { n: 'Capacitación operadores manejo RTG', t: 'Preventivo', ok: true, nota: '88% del equipo certificado' },
  { n: 'Sensor de carga en gancho RTG', t: 'Detectivo', ok: false, nota: 'Ausente en RTG-03 y RTG-04' },
  { n: 'Ronda de supervisión por turno', t: 'Detectivo', ok: true, nota: 'Ejecutada en turnos diurnos' },
  { n: 'Plan de emergencia ante caída', t: 'Correctivo', ok: false, nota: 'Plan vencido — revisión pendiente PM-029' },
];

const PLANES = [
  { id: 'PM-039', n: 'Recuperación mantenimiento preventivo RTG', p: 45, estado: 'En progreso', color: 'yellow' },
  { id: 'PM-042', n: 'Instalación sensor de carga RTG-03 y RTG-04', p: 0, estado: 'Pendiente', color: 'blue' },
];

const INCIDENTES = [
  { id: 'INC-2026-017', d: "Fallo hidráulico RTG-03 durante apilamiento 40'", f: '15/04/2026', s: 'Grave', c: '#993C1D', bg: '#FAECE7' },
  { id: 'INC-2026-012', d: 'Near miss — reach stacker zona patio sur', f: '10/04/2026', s: 'Crítico', c: '#A32D2D', bg: '#FCEBEB' },
  { id: 'INC-2026-004', d: 'Interrupción energía eléctrica zona RTG norte', f: '02/04/2026', s: 'Moderado', c: '#854F0B', bg: '#FAEEDA' },
];

const HISTORIAL = [
  { a: 'Riesgo creado y evaluado', d: 'Registrado por Jef. Seguridad Industrial. Puntaje inicial: 20 — Crítico', t: '08/01/2026 · 09:00h', c: '#185FA5' },
  { a: 'Plan PM-039 asignado', d: 'Plan de recuperación de mantenimiento preventivo RTG vinculado', t: '01/04/2026 · 08:30h', c: '#185FA5' },
  { a: 'Incidente INC-2026-004 vinculado', d: 'Interrupción energética confirmó vulnerabilidad del riesgo', t: '02/04/2026 · 22:15h', c: '#EF9F27' },
  { a: 'Incidente INC-2026-012 vinculado', d: 'Near miss eleva urgencia — escalamiento solicitado', t: '10/04/2026 · 02:34h', c: '#E24B4A' },
  { a: 'Revisión periódica ejecutada', d: 'Puntaje confirmado en 20. Sin reducción por planes en progreso.', t: '10/04/2026 · 08:00h', c: '#185FA5' },
  { a: 'Plan PM-042 creado', d: 'Instalación de sensores de carga en RTG-03 y RTG-04', t: '16/04/2026 · 11:20h', c: '#639922' },
];

const KRIS = [
  { n: 'Cumplimiento mtto. preventivo RTG', v: 74, c: '#E24B4A', s: 'Crítico', b: 'red' },
  { n: 'Disponibilidad equipos RTG', v: 78, c: '#EF9F27', s: 'Alerta', b: 'yellow' },
  { n: 'Inspecciones preoperacionales', v: 61, c: '#E24B4A', s: 'Crítico', b: 'red' },
  { n: 'Operadores certificados', v: 92, c: '#639922', s: 'OK', b: 'green' },
];

const SCORE_HISTORY = [
  { m: 'Ene', s: 20, c: '#E24B4A' },
  { m: 'Feb', s: 20, c: '#E24B4A' },
  { m: 'Mar', s: 20, c: '#E24B4A' },
  { m: 'Abr', s: 20, c: '#E24B4A' },
  { m: 'Meta', s: 8, c: '#639922' },
];

export default function DetalleRiesgo() {
  const [activeTab, setActiveTab] = useState<string | null>('evaluacion');

  return (
    <>
      <title>Detalle de Riesgo | Operador</title>
      <PageHeader
        title="Detalle de Riesgo"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.gestionRiesgos}>← Volver</Button>
            <Button size="xs" component="a" href={PATH_OPERADOR.nuevoPlan}>+ Plan</Button>
            <Button size="xs" component="a" href={PATH_OPERADOR.registroIncidente}>+ Incidente</Button>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Hero */}
        <Surface p="md" style={{ border: '0.5px solid #F09595' }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md" pb="md" style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
            <Box style={{ flex: 1 }}>
              <Text size="xs" c="dimmed" mb={4}>RISK-2026-001</Text>
              <Title order={4} mb={6}>Caída de contenedor durante operación de RTG</Title>
              <Group gap="xs" mb={8}>
                <Badge color="red" variant="light">Crítico</Badge>
                <Badge color="blue" variant="light">Patio de contenedores</Badge>
                <Badge color="yellow" variant="light">Seguridad industrial</Badge>
                <Badge variant="light" color="violet">ISO 45001</Badge>
              </Group>
              <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                Riesgo de caída de contenedor 20'/40' durante apilamiento o traslado con RTG-01 a RTG-04 en bloques A y B. Agravado por ausencia de sensor de carga y mantenimiento vencido en 2 de 4 equipos.
              </Text>
            </Box>
            <SimpleGrid cols={2} spacing={6} style={{ minWidth: 200 }}>
              {[
                { label: 'Puntaje actual', value: '20', color: 'red', sub: 'Crítico' },
                { label: 'Puntaje objetivo', value: '8', color: 'yellow', sub: 'Medio' },
                { label: 'Probabilidad', value: '5/5', color: undefined, sub: 'Casi seguro' },
                { label: 'Impacto', value: '4/5', color: undefined, sub: 'Mayor' },
              ].map((m) => (
                <Box key={m.label} p="xs" style={{ background: 'var(--mantine-color-default-hover)', borderRadius: 8, textAlign: 'center' }}>
                  <Title order={3} c={m.color}>{m.value}</Title>
                  <Text size="xs" c="dimmed">{m.label}</Text>
                  <Text size="xs" c="dimmed">{m.sub}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Group>
          <Group gap="xl" wrap="wrap">
            {[
              ['Responsable', 'Jef. Mantenimiento · C. Loor'],
              ['Registrado', '08/01/2026'],
              ['Última revisión', '10/04/2026'],
              ['Próxima revisión', '25/04/2026'],
            ].map(([k, v]) => (
              <Box key={k}>
                <Text size="xs" c="dimmed">{k}</Text>
                <Text size="xs" fw={500} c={k === 'Próxima revisión' ? 'yellow' : undefined}>{v}</Text>
              </Box>
            ))}
          </Group>
        </Surface>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="evaluacion">Evaluación</Tabs.Tab>
            <Tabs.Tab value="controles">Controles</Tabs.Tab>
            <Tabs.Tab value="planes">Planes</Tabs.Tab>
            <Tabs.Tab value="incidentes">Incidentes</Tabs.Tab>
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
                        const isActive = r === 4 && c === 3;
                        return (
                          <Box key={`${r}-${c}`} style={{ height: 28, borderRadius: 4, background: getCellColor(v), display: 'flex', alignItems: 'center', justifyContent: 'center', outline: isActive ? '2.5px solid var(--mantine-color-text)' : 'none', fontSize: 10, fontWeight: 500 }}>
                            {isActive ? '★' : ''}
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

                <Surface p="md">
                  <Text fw={500} size="sm" mb="sm">Evolución del puntaje</Text>
                  <Group align="flex-end" gap={6} style={{ height: 60 }} mb="xs">
                    {SCORE_HISTORY.map((s) => (
                      <Box key={s.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Text size="xs" fw={500} c={s.c === '#639922' ? 'green' : 'red'} mb={2}>{s.s}</Text>
                        <Box style={{ height: Math.round((s.s / 25) * 48) + 4, width: '100%', background: s.c, borderRadius: '3px 3px 0 0', opacity: s.m === 'Meta' ? 0.5 : 1, border: s.m === 'Meta' ? '1.5px dashed #3B6D11' : 'none' }} />
                      </Box>
                    ))}
                  </Group>
                  <Group gap={4} justify="space-around">
                    {SCORE_HISTORY.map((s) => <Text key={s.m} size="xs" c="dimmed">{s.m}</Text>)}
                  </Group>
                  <Box mt="sm" p="xs" style={{ background: '#EAF3DE', borderRadius: 8 }}>
                    <Text size="xs" c="green" fw={500}>Reducción proyectada al cerrar PM-039</Text>
                    <Text size="xs" c="green">Puntaje estimado post-mitigación: 8</Text>
                  </Box>
                </Surface>
              </SimpleGrid>

              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Causa raíz</Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Stack gap={8}>
                    <Box><Text size="xs" c="dimmed">Causa inmediata</Text><Text size="xs">RTG-03 y RTG-04 sin sensor de carga — sin detección de sobrecarga en tiempo real durante apilamiento.</Text></Box>
                    <Box><Text size="xs" c="dimmed">Causa raíz</Text><Text size="xs">Mantenimiento preventivo vencido en 2 de 4 RTGs por escasez de repuestos y priorización operativa.</Text></Box>
                  </Stack>
                  <Stack gap={8}>
                    <Box><Text size="xs" c="dimmed">Factores contribuyentes</Text><Text size="xs">Turno nocturno con menor supervisión · Alta demanda Q1 · Fatiga acumulada · Preoperacional no ejecutado en 3 turnos.</Text></Box>
                    <Box><Text size="xs" c="dimmed">Consecuencias potenciales</Text><Text size="xs">Fatalidad de operador · Daño total de contenedor · Paralización de patio · Sanción regulatoria.</Text></Box>
                  </Stack>
                </SimpleGrid>
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">KRI vinculados</Text>
                <Stack gap={6}>
                  {KRIS.map((k) => (
                    <Group key={k.n} gap="xs" wrap="nowrap">
                      <Text size="xs" style={{ flex: 1 }} lineClamp={1}>{k.n}</Text>
                      <Progress value={k.v} color={k.b} size="xs" style={{ width: 80 }} />
                      <Text size="xs" fw={500} style={{ minWidth: 36, textAlign: 'right', color: k.c }}>{k.v}%</Text>
                      <Badge color={k.b} variant="light" size="xs">{k.s}</Badge>
                    </Group>
                  ))}
                </Stack>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* Controles */}
          <Tabs.Panel value="controles" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={500} size="sm">Controles existentes</Text>
                  <Text size="xs" c="dimmed">4 de 6 efectivos</Text>
                </Group>
                <Stack gap={6}>
                  {CONTROLES.map((c) => (
                    <Group key={c.n} gap="sm" p="xs" style={{ border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 8 }}>
                      <Box style={{ width: 14, height: 14, borderRadius: '50%', border: `0.5px solid ${c.ok ? '#3B6D11' : '#F09595'}`, background: c.ok ? '#EAF3DE' : '#FCEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={c.ok ? '#3B6D11' : '#A32D2D'} strokeWidth="2.5">
                          {c.ok ? <polyline points="10 3 5 8 2 5" /> : <><line x1="2" y1="2" x2="10" y2="10" /><line x1="10" y1="2" x2="2" y2="10" /></>}
                        </svg>
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" fw={500}>{c.n}</Text>
                        <Text size="xs" c={c.ok ? 'dimmed' : 'red'}>{c.nota}</Text>
                      </Box>
                      <Text size="xs" c="dimmed">{c.t}</Text>
                    </Group>
                  ))}
                </Stack>
              </Surface>
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Efectividad global de controles</Text>
                <Group gap="md" mb="sm">
                  <Box style={{ flex: 1 }}>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Efectividad actual</Text>
                      <Text size="xs" fw={500} c="yellow">67%</Text>
                    </Group>
                    <Progress value={67} color="yellow" size="xs" />
                  </Box>
                  <Badge color="yellow" variant="light">Insuficiente para nivel crítico</Badge>
                </Group>
                <Text size="xs" c="dimmed">Para riesgo crítico se requiere al menos 85%. Los controles de detección (sensores) y corrección (plan de emergencia) están deficientes.</Text>
                <Button size="xs" variant="default" mt="sm">+ Agregar control</Button>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* Planes */}
          <Tabs.Panel value="planes" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Planes de mitigación vinculados</Text>
                <Stack gap={6}>
                  {PLANES.map((p) => (
                    <Group key={p.id} justify="space-between" style={{ padding: '8px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)', cursor: 'pointer' }}>
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed" mb={2}>{p.id} · Vence: 20/04/2026</Text>
                        <Text size="xs" fw={500}>{p.n}</Text>
                        <Progress value={p.p} color={p.p === 0 ? 'gray' : p.p < 50 ? 'red' : 'blue'} size="xs" mt={4} style={{ maxWidth: 160 }} />
                      </Box>
                      <Box ta="right">
                        <Badge color={p.color} variant="light" size="xs">{p.estado}</Badge>
                        <Text size="xs" c="dimmed" mt={4}>{p.p}%</Text>
                      </Box>
                    </Group>
                  ))}
                </Stack>
                <Button size="xs" variant="default" mt="sm" component="a" href={PATH_OPERADOR.nuevoPlan}>+ Nuevo plan</Button>
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Reducción de riesgo proyectada</Text>
                <Text size="xs" c="dimmed" mb="sm">Al ejecutar los planes activos, el puntaje baja de 20 a 8.</Text>
                <Group gap="sm" wrap="wrap">
                  {[
                    { label: 'Actual', value: 20, bg: '#FCEBEB', c: '#A32D2D' },
                    { label: 'Con PM-039', value: 12, bg: '#FAEEDA', c: '#854F0B' },
                    { label: 'PM-039+042', value: 8, bg: '#FAEEDA', c: '#854F0B' },
                    { label: 'Objetivo', value: 4, bg: '#EAF3DE', c: '#3B6D11' },
                  ].map((s, i, arr) => (
                    <Group key={s.label} gap="xs">
                      <Box p="xs" style={{ background: s.bg, borderRadius: 8, textAlign: 'center', minWidth: 70 }}>
                        <Title order={4} style={{ color: s.c }}>{s.value}</Title>
                        <Text size="xs" style={{ color: s.c }}>{s.label}</Text>
                      </Box>
                      {i < arr.length - 1 && <Text c="dimmed">→</Text>}
                    </Group>
                  ))}
                </Group>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* Incidentes */}
          <Tabs.Panel value="incidentes" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={500} size="sm">Incidentes vinculados</Text>
                  <Text size="xs" c="dimmed">3 registros</Text>
                </Group>
                <Stack gap={0}>
                  {INCIDENTES.map((inc) => (
                    <Group key={inc.id} gap="sm" style={{ padding: '8px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)', cursor: 'pointer' }}>
                      <Box style={{ width: 7, height: 7, borderRadius: '50%', background: inc.c, flexShrink: 0 }} />
                      <Box style={{ flex: 1 }}>
                        <Text size="xs">{inc.d}</Text>
                        <Text size="xs" c="dimmed">{inc.id} · {inc.f}</Text>
                      </Box>
                      <Badge style={{ background: inc.bg, color: inc.c }} size="xs">{inc.s}</Badge>
                    </Group>
                  ))}
                </Stack>
                <Button size="xs" variant="default" mt="sm" component="a" href={PATH_OPERADOR.registroIncidente}>+ Vincular incidente</Button>
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Tendencia de ocurrencia</Text>
                <SimpleGrid cols={4}>
                  {[['Enero','0',undefined],['Febrero','1',undefined],['Marzo','1',undefined],['Abril','2','orange']].map(([m,v,c]) => (
                    <Box key={m} p="sm" style={{ background: c ? '#FAECE7' : 'var(--mantine-color-default-hover)', borderRadius: 8, textAlign: 'center' }}>
                      <Title order={3} c={c}>{v}</Title>
                      <Text size="xs" c="dimmed">{m}</Text>
                      {c && <Text size="xs" c="orange">▲ en aumento</Text>}
                    </Box>
                  ))}
                </SimpleGrid>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* Historial */}
          <Tabs.Panel value="historial" pt="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Historial de cambios y eventos</Text>
              <Stack gap={0}>
                {HISTORIAL.map((h, i) => (
                  <Group key={i} gap="sm" align="flex-start" pb="sm">
                    <Box style={{ width: 9, height: 9, borderRadius: '50%', background: h.c, marginTop: 4, flexShrink: 0 }} />
                    <Box style={{ flex: 1 }}>
                      <Text size="xs" fw={500}>{h.a}</Text>
                      <Text size="xs" c="dimmed">{h.d}</Text>
                      <Text size="xs" c="dimmed">{h.t}</Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            </Surface>
          </Tabs.Panel>
        </Tabs>

        {/* Footer */}
        <Group justify="space-between" pt="sm" style={{ borderTop: '0.5px solid var(--mantine-color-default-border)' }}>
          <Text size="xs" c="dimmed">RISK-2026-001 · Terminal Risk Monitor v2.1</Text>
          <Group gap="sm">
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.seguimientoPlanes}>Planes</Button>
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.gestionIncidentes}>Incidentes</Button>
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.reporteEjecutivo}>Reporte</Button>
          </Group>
        </Group>
      </Stack>
    </>
  );
}
