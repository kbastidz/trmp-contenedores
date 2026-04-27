'use client';

import { useState } from 'react';
import {
  Anchor, Badge, Box, Button, Collapse, Group, Progress,
  Select, SimpleGrid, Stack, Tabs, Text, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Seguimiento de Planes', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const METRICS = [
  { label: 'Total acciones', value: '41', sub: 'en seguimiento activo' },
  { label: 'Completadas', value: '18', sub: '44% del total', color: 'green' },
  { label: 'En progreso', value: '15', sub: '37% del total', color: 'blue' },
  { label: 'Vencidas', value: '2', sub: 'requieren atención', color: 'red' },
  { label: 'Pendientes', value: '6', sub: 'no iniciadas', color: 'yellow' },
];

type Plan = { id: string; name: string; riskColor: string; riskLabel: string; area: string; resp: string; date: string; pct: number; dateColor: string; dateLabel: string; overdue?: boolean };

const PENDIENTES: Plan[] = [
  { id: 'PM-041', name: 'Simulacro de emergencia IMDG clase 3', riskColor: 'red', riskLabel: 'Crítico', area: 'Patio', resp: 'Seg. Industrial', date: '30/04/26', pct: 0, dateColor: 'yellow', dateLabel: 'Vence 30/04' },
  { id: 'PM-038', name: 'Instalar cámaras PTZ en zona de carga peligrosa', riskColor: 'orange', riskLabel: 'Alto', area: 'Patio', resp: 'Seg. Industrial', date: '15/05/26', pct: 0, dateColor: 'green', dateLabel: 'Vence 15/05' },
  { id: 'PM-035', name: 'Actualizar plan de emergencia portuaria', riskColor: 'orange', riskLabel: 'Alto', area: 'Muelle', resp: 'Gerencia Ops', date: '20/05/26', pct: 0, dateColor: 'green', dateLabel: 'Vence 20/05' },
  { id: 'PM-033', name: 'Contratar técnico especialista en grúas STS', riskColor: 'yellow', riskLabel: 'Medio', area: 'Muelle', resp: 'RRHH', date: '30/05/26', pct: 0, dateColor: 'green', dateLabel: 'Vence 30/05' },
];

const EN_PROGRESO: Plan[] = [
  { id: 'PM-039', name: 'Plan de recuperación mantenimiento preventivo RTG', riskColor: 'red', riskLabel: 'Crítico', area: 'Patio', resp: 'Jef. Mantenimiento', date: '20/04/26', pct: 45, dateColor: 'yellow', dateLabel: 'Vence 20/04', overdue: false },
  { id: 'PM-037', name: 'Capacitación operadores nocturnos — fatiga y ergonomía', riskColor: 'orange', riskLabel: 'Alto', area: 'Patio', resp: 'RRHH', date: '30/04/26', pct: 70, dateColor: 'green', dateLabel: 'Vence 30/04' },
  { id: 'PM-036', name: 'Capacitar operadores en IMDG clase 3', riskColor: 'orange', riskLabel: 'Alto', area: 'Patio', resp: 'RRHH', date: '05/05/26', pct: 60, dateColor: 'green', dateLabel: 'Vence 05/05' },
  { id: 'PM-034', name: 'Revisión y refuerzo de señalización en patio', riskColor: 'yellow', riskLabel: 'Medio', area: 'Patio', resp: 'Sup. Patio', date: '10/05/26', pct: 85, dateColor: 'green', dateLabel: 'Vence 10/05' },
];

const VENCIDAS: Plan[] = [
  { id: 'PM-029', name: 'Revisión integral del plan de emergencia portuaria', riskColor: 'red', riskLabel: 'Crítico', area: 'Muelle', resp: 'Seg. Industrial', date: '05/04', pct: 20, dateColor: 'red', dateLabel: 'Venció 05/04', overdue: true },
  { id: 'PM-027', name: 'Mantenimiento correctivo grúa STS-2', riskColor: 'red', riskLabel: 'Crítico', area: 'Muelle', resp: 'Jef. Mantenimiento', date: '01/04', pct: 10, dateColor: 'red', dateLabel: 'Venció 01/04', overdue: true },
];

const COMPLETADAS: Plan[] = [
  { id: 'PM-032', name: 'Instalar sensor de carga en gancho RTG-03', riskColor: 'orange', riskLabel: 'Alto', area: 'Patio', resp: 'Jef. Mantenimiento', date: '15/04', pct: 100, dateColor: 'green', dateLabel: 'Cerrado 15/04' },
  { id: 'PM-031', name: 'Actualizar POE de operaciones nocturnas', riskColor: 'yellow', riskLabel: 'Medio', area: 'Patio', resp: 'Sup. Patio', date: '10/04', pct: 100, dateColor: 'green', dateLabel: 'Cerrado 10/04' },
  { id: 'PM-028', name: 'Demarcación de zonas de tránsito peatonal en patio', riskColor: 'yellow', riskLabel: 'Medio', area: 'Patio', resp: 'Sup. Patio', date: '08/04', pct: 100, dateColor: 'green', dateLabel: 'Cerrado 08/04' },
];

const TIMELINE = [
  { action: 'Acción escalada a Jefatura de Mantenimiento', detail: 'Se asignó presupuesto de emergencia de $8,500 para contratación de técnicos externos', time: '01/04/2026 · 08:30', color: '#185FA5' },
  { action: 'Inicio de auditoría de estado de la flota', detail: 'Se identificaron 4 RTG con mantenimiento vencido. RTG-01 y RTG-02 priorizados', time: '02/04/2026 · 10:15', color: '#185FA5' },
  { action: 'Mantenimiento RTG-01 completado', detail: 'Verificado por supervisor de turno. Equipo operativo al 100%', time: '07/04/2026 · 16:00', color: '#639922' },
  { action: 'Mantenimiento RTG-02 completado', detail: 'Reemplazo de sistema hidráulico y revisión eléctrica', time: '11/04/2026 · 14:30', color: '#639922' },
  { action: 'Alerta: retraso en llegada de repuestos RTG-04', detail: 'Proveedor confirmó entrega para el 18/04. Se notificó a Gerencia', time: '14/04/2026 · 09:00', color: '#EF9F27' },
];

const TASKS = [
  { name: 'Auditoría de estado actual flota RTG', done: true },
  { name: 'Mantenimiento RTG-01 completado', done: true },
  { name: 'Mantenimiento RTG-02 completado', done: true },
  { name: 'Mantenimiento RTG-03 — en ejecución', done: false },
  { name: 'Mantenimiento RTG-04 — pendiente repuestos', done: false },
  { name: 'Validación final y cierre de cumplimiento', done: false },
];

function PlanCard({ plan, onClick }: { plan: Plan; onClick: () => void }) {
  return (
    <Box onClick={onClick} style={{ background: 'var(--mantine-color-body)', border: `0.5px solid ${plan.overdue ? '#F09595' : 'var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '10px 12px', marginBottom: 6, cursor: 'pointer' }}>
      <Group justify="space-between" mb={4}>
        <Text size="xs" c={plan.overdue ? 'red' : 'dimmed'}>{plan.id}</Text>
        <Badge color={plan.dateColor} variant="light" size="xs">{plan.dateLabel}</Badge>
      </Group>
      <Text size="xs" fw={500} mb={6} lineClamp={2}>{plan.name}</Text>
      <Group gap={4} mb={6}>
        <Badge color={plan.riskColor} variant="light" size="xs">{plan.riskLabel}</Badge>
        <Badge color="blue" variant="light" size="xs">{plan.area}</Badge>
      </Group>
      {plan.pct > 0 && <Progress value={plan.pct} color={plan.pct === 100 ? 'green' : plan.overdue ? 'red' : 'blue'} size="xs" mb={4} />}
      <Group justify="space-between">
        <Text size="xs" c="dimmed">{plan.resp}</Text>
        {plan.pct > 0 && <Text size="xs" c={plan.pct === 100 ? 'green' : plan.overdue ? 'red' : 'blue'}>{plan.pct}%</Text>}
      </Group>
    </Box>
  );
}

export default function SeguimientoPlanes() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('info');

  return (
    <>
      <title>Seguimiento de Planes | Operador</title>
      <PageHeader
        title="Planes de Mitigación"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            <Button size="xs" component="a" href={PATH_OPERADOR.nuevoPlan}>+ Nuevo plan</Button>
            <Button size="xs" variant="default">Exportar</Button>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Métricas */}
        <SimpleGrid cols={{ base: 2, sm: 5 }}>
          {METRICS.map((m) => (
            <Surface key={m.label} p="md">
              <Text size="xs" c="dimmed">{m.label}</Text>
              <Title order={3} c={m.color}>{m.value}</Title>
              <Text size="xs" c="dimmed">{m.sub}</Text>
            </Surface>
          ))}
        </SimpleGrid>

        {/* Filtros */}
        <Group gap="sm">
          <Select size="xs" placeholder="Todas las áreas" data={['Muelle / Buque','Patio / Yard','Taller / Equipos','Gate / Portería','Seg. ISPS / BASC']} clearable style={{ width: 160 }} />
          <Select size="xs" placeholder="Todos los responsables" data={['Jef. Mantenimiento','Sup. Patio','Seguridad Industrial','RRHH','Gerencia Ops']} clearable style={{ width: 180 }} />
        </Group>

        {/* Kanban */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          {/* Pendiente */}
          <Surface p="sm">
            <Group justify="space-between" mb="sm">
              <Text size="xs" fw={500}>Pendiente</Text>
              <Badge variant="light" size="xs">6</Badge>
            </Group>
            {PENDIENTES.map(p => <PlanCard key={p.id} plan={p} onClick={() => setSelectedPlan(p)} />)}
          </Surface>

          {/* En progreso */}
          <Surface p="sm">
            <Group justify="space-between" mb="sm">
              <Text size="xs" fw={500}>En progreso</Text>
              <Badge color="blue" variant="light" size="xs">15</Badge>
            </Group>
            {EN_PROGRESO.map(p => <PlanCard key={p.id} plan={p} onClick={() => setSelectedPlan(p)} />)}
          </Surface>

          {/* Vencidas */}
          <Surface p="sm">
            <Group justify="space-between" mb="sm">
              <Text size="xs" fw={500}>Vencidas</Text>
              <Badge color="red" variant="light" size="xs">2</Badge>
            </Group>
            {VENCIDAS.map(p => <PlanCard key={p.id} plan={p} onClick={() => setSelectedPlan(p)} />)}
            <Box p="sm" mt="xs" style={{ background: '#FCEBEB', borderRadius: 8 }}>
              <Text size="xs" c="red" mb={6}>Estas acciones están vinculadas a riesgos críticos. Se recomienda escalar a Gerencia de Operaciones.</Text>
              <Button size="xs" color="red" variant="outline" component="a" href={PATH_OPERADOR.escalamiento}>Escalar</Button>
            </Box>
          </Surface>

          {/* Completadas */}
          <Surface p="sm">
            <Group justify="space-between" mb="sm">
              <Text size="xs" fw={500}>Completadas</Text>
              <Badge color="green" variant="light" size="xs">18</Badge>
            </Group>
            {COMPLETADAS.map(p => <PlanCard key={p.id} plan={p} onClick={() => setSelectedPlan(p)} />)}
          </Surface>
        </SimpleGrid>

        {/* Panel de detalle */}
        <Collapse in={!!selectedPlan}>
          {selectedPlan && (
            <Surface p="md">
              <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                <Box>
                  <Text size="xs" c="dimmed">{selectedPlan.id}</Text>
                  <Text fw={500}>{selectedPlan.name}</Text>
                </Box>
                <Group gap="sm">
                  <Badge color={selectedPlan.riskColor} variant="light">{selectedPlan.riskLabel}</Badge>
                  <Button size="xs" variant="default" onClick={() => setSelectedPlan(null)}>Cerrar</Button>
                </Group>
              </Group>

              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab value="info">Información</Tabs.Tab>
                  <Tabs.Tab value="timeline">Historial</Tabs.Tab>
                  <Tabs.Tab value="riesgo">Riesgo vinculado</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="info" pt="md">
                  <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
                    <Stack gap={8}>
                      <Box><Text size="xs" c="dimmed">Descripción</Text><Text size="sm">Ejecutar plan de choque para recuperar el 90% de cumplimiento de mantenimiento preventivo en flota RTG antes del cierre de abril.</Text></Box>
                      <Box><Text size="xs" c="dimmed">Área operacional</Text><Text size="sm">Patio de contenedores</Text></Box>
                      <Box><Text size="xs" c="dimmed">Responsable principal</Text><Text size="sm">{selectedPlan.resp}</Text></Box>
                    </Stack>
                    <Stack gap={8}>
                      <Box><Text size="xs" c="dimmed">Estado actual</Text><Badge color={selectedPlan.riskColor} variant="light">En progreso — {selectedPlan.pct}%</Badge></Box>
                      <Box><Text size="xs" c="dimmed">Fecha límite</Text><Text size="sm" c={selectedPlan.overdue ? 'red' : undefined}>{selectedPlan.date}</Text></Box>
                    </Stack>
                  </SimpleGrid>
                  <Text size="xs" c="dimmed" mb={6}>Avance de tareas</Text>
                  <Stack gap={4}>
                    {TASKS.map((t) => (
                      <Group key={t.name} gap="sm" p="xs" style={{ background: 'var(--mantine-color-default-hover)', borderRadius: 6 }}>
                        <Box style={{ width: 14, height: 14, borderRadius: '50%', border: `0.5px solid ${t.done ? '#3B6D11' : 'var(--mantine-color-default-border)'}`, background: t.done ? '#EAF3DE' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {t.done && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#3B6D11" strokeWidth="2.5"><polyline points="10 3 5 8 2 5" /></svg>}
                        </Box>
                        <Text size="xs" c={t.done ? 'dimmed' : undefined} style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.name}</Text>
                      </Group>
                    ))}
                  </Stack>
                  <Group gap="sm" mt="md" pt="sm" style={{ borderTop: '0.5px solid var(--mantine-color-default-border)' }}>
                    <Button size="xs" variant="default">Actualizar avance</Button>
                    <Button size="xs" variant="default">Marcar completado</Button>
                    <Button size="xs" variant="default">Escalar</Button>
                    <Button size="xs" component="a" href={PATH_OPERADOR.editarPlan}>Editar</Button>
                  </Group>
                </Tabs.Panel>

                <Tabs.Panel value="timeline" pt="md">
                  <Stack gap={0}>
                    {TIMELINE.map((t, i) => (
                      <Group key={i} gap="sm" align="flex-start" pb="sm">
                        <Box style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, marginTop: 4, flexShrink: 0 }} />
                        <Box style={{ flex: 1 }}>
                          <Text size="xs" fw={500}>{t.action}</Text>
                          <Text size="xs" c="dimmed">{t.detail}</Text>
                          <Text size="xs" c="dimmed">{t.time}</Text>
                        </Box>
                      </Group>
                    ))}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="riesgo" pt="md">
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Stack gap={8}>
                      <Box><Text size="xs" c="dimmed">Riesgo vinculado</Text><Text size="sm">Incumplimiento de mantenimiento preventivo en flota RTG</Text></Box>
                      <Box><Text size="xs" c="dimmed">ID del riesgo</Text><Text size="sm" c="blue" style={{ cursor: 'pointer' }}>RISK-2026-012 ↗</Text></Box>
                      <Box><Text size="xs" c="dimmed">Área</Text><Text size="sm">Patio de contenedores</Text></Box>
                    </Stack>
                    <Stack gap={8}>
                      <Box><Text size="xs" c="dimmed">Puntaje de riesgo</Text><Badge color="red" variant="light">20 — Crítico</Badge></Box>
                      <Box><Text size="xs" c="dimmed">Probabilidad</Text><Text size="sm">5 / 5 — Casi seguro</Text></Box>
                      <Box><Text size="xs" c="dimmed">Impacto</Text><Text size="sm">4 / 5 — Mayor</Text></Box>
                    </Stack>
                  </SimpleGrid>
                </Tabs.Panel>
              </Tabs>
            </Surface>
          )}
        </Collapse>
      </Stack>
    </>
  );
}
