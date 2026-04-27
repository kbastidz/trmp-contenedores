'use client';

import { useState } from 'react';
import {
  Anchor, Badge, Box, Button, Checkbox, Group, Select,
  SimpleGrid, Stack, Tabs, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Planes de Mitigación', href: PATH_OPERADOR.seguimientoPlanes },
  { title: 'PM-039', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

type EstadoPlan = 'Pendiente' | 'En progreso' | 'Completado' | 'Vencido' | 'Cancelado';
const ESTADO_COLOR: Record<EstadoPlan, string> = {
  Pendiente: 'gray', 'En progreso': 'blue', Completado: 'green', Vencido: 'red', Cancelado: 'gray',
};

const TAREAS_INICIALES = [
  { desc: 'Auditoría de estado actual flota RTG', resp: 'Jef. Mantenimiento', fecha: '2026-04-03', done: true },
  { desc: 'Mantenimiento RTG-01 completado', resp: 'Técnico externo', fecha: '2026-04-07', done: true },
  { desc: 'Mantenimiento RTG-02 completado', resp: 'Técnico externo', fecha: '2026-04-11', done: true },
  { desc: 'Mantenimiento RTG-03 — en ejecución', resp: 'Técnico externo', fecha: '2026-04-17', done: false },
  { desc: 'Mantenimiento RTG-04 — pendiente repuestos', resp: 'Jef. Mantenimiento', fecha: '2026-04-20', done: false },
  { desc: 'Validación final y cierre de cumplimiento', resp: 'Gerencia Ops', fecha: '2026-04-22', done: false },
];

export default function EditarPlan() {
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [estado, setEstado] = useState<EstadoPlan>('En progreso');
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avance, setAvance] = useState(45);
  const [tareas, setTareas] = useState(TAREAS_INICIALES.map(t => ({ ...t })));

  const [form, setForm] = useState({
    titulo: 'Plan de recuperación del mantenimiento preventivo de flota RTG',
    objetivo: 'Recuperar el cumplimiento del mantenimiento preventivo al 90% en los 4 RTGs activos antes del cierre de abril 2026, reduciendo el riesgo de falla durante operación de patio.',
    tipoControl: 'Preventivo',
    estrategia: 'Reducir probabilidad e impacto',
    norma: 'ISO 45001',
    indicador: 'Cumplimiento de mantenimiento preventivo RTG ≥ 90%. Cero incidentes por falla hidráulica en 60 días post-cierre del plan.',
    fechaInicio: '2026-04-01',
    fechaLimite: '2026-04-20',
    frecuencia: 'Semanal',
    fechaRevision: '2026-05-20',
    respPlan: 'Jefatura de Mantenimiento · Carlos Loor',
    aprobador: 'Gerencia de Operaciones',
    areaResp: 'Jefatura de Mantenimiento',
    nivelAprov: 'Gerencia de Operaciones',
    presupuesto: 'Significativo ($10K–$50K)',
    fuente: 'Presupuesto de mantenimiento',
    prioridad: 'Inmediata (24–48h)',
    recursos: '2 técnicos externos especializados en RTG · Repuestos hidráulicos (cotización pendiente con Konecranes) · $8,500 presupuesto aprobado.',
    observaciones: 'RTG-03 en mantenimiento activo. RTG-04 pendiente de llegada de repuestos el 18/04. Se proyecta cerrar el plan el 22/04 como máximo.',
    notaAvance: '',
    justificacion: '',
    evidenciaCierre: '',
  });

  const update = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setHasChanges(true); };

  const toggleTarea = (i: number) => {
    const next = tareas.map((t, j) => j === i ? { ...t, done: !t.done } : t);
    setTareas(next);
    const done = next.filter(t => t.done).length;
    setAvance(Math.round((done / next.length) * 100));
    setHasChanges(true);
  };

  const updateTarea = (i: number, k: string, v: string) => {
    setTareas(prev => prev.map((t, j) => j === i ? { ...t, [k]: v } : t));
    setHasChanges(true);
  };

  const addTarea = () => { setTareas(prev => [...prev, { desc: '', resp: '', fecha: '', done: false }]); setHasChanges(true); };
  const delTarea = (i: number) => { setTareas(prev => prev.filter((_, j) => j !== i)); setHasChanges(true); };

  const doneTareas = tareas.filter(t => t.done).length;
  const isVencida = form.fechaLimite < new Date().toISOString().split('T')[0];

  const avanceColor = avance >= 80 ? 'green' : avance >= 40 ? 'blue' : 'red';

  if (saved) {
    return (
      <>
        <title>Plan Actualizado | Operador</title>
        <PageHeader title="Editar Plan" breadcrumbItems={breadcrumbs} />
        <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
          <Box style={{ width: 44, height: 44, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </Box>
          <Title order={4} mb={6}>Plan actualizado correctamente</Title>
          <Text size="sm" c="dimmed" mb="lg">Los cambios en PM-039 quedaron registrados en el log de auditoría. El tablero Kanban se actualizó.</Text>
          <Group justify="center" gap="sm">
            <Button size="xs" component="a" href={PATH_OPERADOR.seguimientoPlanes}>Ver tablero Kanban</Button>
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.detalleRiesgo}>Ver riesgo vinculado</Button>
          </Group>
        </Surface>
      </>
    );
  }

  return (
    <>
      <title>Editar Plan | Operador</title>
      <PageHeader
        title="Editar Plan de Mitigación"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="xs">
            <Text size="xs" c="dimmed">PM-039</Text>
            <Badge color={ESTADO_COLOR[estado]} variant="light" size="sm">{estado}</Badge>
            <Badge color="red" variant="light" size="sm">RISK-2026-001</Badge>
            <Text size="xs" c="dimmed">Editando</Text>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Alertas */}
        {hasChanges && (
          <Box p="sm" style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <Text size="xs" c="yellow">Tienes cambios sin guardar — revisa todas las pestañas antes de guardar.</Text>
          </Box>
        )}
        <Box p="sm" style={{ background: '#E6F1FB', border: '0.5px solid #B5D4F4', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <Text size="xs" c="blue">Los cambios quedarán registrados en el log de auditoría. Actualizar el avance también actualizará la tarjeta en el tablero Kanban.</Text>
        </Box>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="general">General</Tabs.Tab>
            <Tabs.Tab value="avance">Avance y tareas</Tabs.Tab>
            <Tabs.Tab value="recursos">Recursos</Tabs.Tab>
            <Tabs.Tab value="estado">Estado</Tabs.Tab>
          </Tabs.List>

          {/* ── General ── */}
          <Tabs.Panel value="general" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Información del plan</Text>
                <TextInput label="Título del plan *" value={form.titulo} onChange={e => update('titulo', e.target.value)} mb="sm" />
                <Textarea label="Objetivo del plan" value={form.objetivo} onChange={e => update('objetivo', e.target.value)} minRows={3} mb="sm" />
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <TextInput label="Riesgo vinculado" value="RISK-2026-001 — Caída de contenedor RTG" readOnly styles={{ input: { opacity: 0.6, cursor: 'not-allowed' } }} />
                  <Select label="Tipo de control *" value={form.tipoControl} onChange={v => update('tipoControl', v || '')}
                    data={['Preventivo','Detectivo','Correctivo','Mitigante','Transferencia','Aceptación']} />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <Select label="Estrategia de reducción" value={form.estrategia} onChange={v => update('estrategia', v || '')}
                    data={['Reducir probabilidad e impacto','Reducir probabilidad','Reducir impacto','Eliminar el riesgo']} />
                  <Select label="Normativa de referencia" value={form.norma} onChange={v => update('norma', v || '')}
                    data={['ISO 45001','ISO 31000','Código ISPS','IMDG','BASC']} />
                </SimpleGrid>
                <Textarea label="Indicador de éxito" value={form.indicador} onChange={e => update('indicador', e.target.value)} minRows={2} />
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Cronograma</Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }} mb="sm">
                  <TextInput label="Fecha de inicio" type="date" value={form.fechaInicio} onChange={e => update('fechaInicio', e.target.value)} />
                  <Box>
                    <TextInput label="Fecha límite *" type="date" value={form.fechaLimite} onChange={e => update('fechaLimite', e.target.value)} />
                    {isVencida && <Badge color="red" variant="light" size="xs" mt={4}>Vencida</Badge>}
                  </Box>
                  <Select label="Frecuencia de seguimiento" value={form.frecuencia} onChange={v => update('frecuencia', v || '')}
                    data={['Diaria','Semanal','Quincenal','Mensual']} />
                </SimpleGrid>
                <TextInput label="Fecha de revisión de efectividad" type="date" value={form.fechaRevision} onChange={e => update('fechaRevision', e.target.value)} />
                {isVencida && (
                  <Box mt="sm" p="sm" style={{ background: '#FCEBEB', borderRadius: 8 }}>
                    <Text size="xs" c="red">⚠ La fecha límite ya venció. Si vas a extenderla, justifícalo en la pestaña Estado.</Text>
                  </Box>
                )}
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── Avance y tareas ── */}
          <Tabs.Panel value="avance" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={500} size="sm">Avance general del plan</Text>
                  <Text fw={500} size="sm" c={avanceColor}>{avance}%</Text>
                </Group>
                <Box style={{ height: 8, background: 'var(--mantine-color-default-border)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <Box style={{ height: '100%', width: `${avance}%`, background: avanceColor === 'green' ? '#3B6D11' : avanceColor === 'blue' ? '#378ADD' : '#E24B4A', borderRadius: 4, transition: 'width 0.3s' }} />
                </Box>
                <input
                  type="range" min={0} max={100} value={avance}
                  onChange={e => { setAvance(Number(e.target.value)); setHasChanges(true); }}
                  style={{ width: '100%', marginBottom: 4 }}
                />
                <Group justify="space-between">
                  {['0%','25%','50%','75%','100%'].map(l => <Text key={l} size="xs" c="dimmed">{l}</Text>)}
                </Group>
                <Box mt="sm" p="sm" style={{ background: 'var(--mantine-color-default-hover)', borderRadius: 8 }}>
                  <Text size="xs" c="dimmed" mb={4}>Nota de avance (se mostrará en el historial)</Text>
                  <Textarea
                    placeholder="Ej: RTG-01 y RTG-02 completados. RTG-03 en mantenimiento, finalización estimada 17/04."
                    value={form.notaAvance}
                    onChange={e => update('notaAvance', e.target.value)}
                    minRows={2}
                    styles={{ input: { border: '0.5px solid var(--mantine-color-default-border)' } }}
                  />
                </Box>
              </Surface>

              <Surface p="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={500} size="sm">Tareas del plan</Text>
                  <Text size="xs" c="dimmed">{doneTareas} de {tareas.length} completadas</Text>
                </Group>
                <Stack gap="sm">
                  {tareas.map((t, i) => (
                    <Box key={i} p="sm" style={{ border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 8, position: 'relative', opacity: t.done ? 0.75 : 1 }}>
                      <Button size="xs" variant="subtle" color="red" style={{ position: 'absolute', top: 6, right: 8 }} onClick={() => delTarea(i)}>✕</Button>
                      <Group gap="sm" mb="xs">
                        <Checkbox
                          checked={t.done}
                          onChange={() => toggleTarea(i)}
                          size="xs"
                        />
                        <TextInput
                          value={t.desc}
                          onChange={e => updateTarea(i, 'desc', e.target.value)}
                          placeholder="Descripción de la tarea"
                          size="xs"
                          style={{ flex: 1 }}
                          styles={{ input: { textDecoration: t.done ? 'line-through' : 'none' } }}
                        />
                      </Group>
                      <SimpleGrid cols={{ base: 1, sm: 3 }}>
                        <TextInput label="Responsable" size="xs" value={t.resp} onChange={e => updateTarea(i, 'resp', e.target.value)} />
                        <TextInput label="Fecha límite" type="date" size="xs" value={t.fecha} onChange={e => updateTarea(i, 'fecha', e.target.value)} />
                        <Select label="Estado" size="xs"
                          defaultValue={t.done ? 'Completada' : 'Pendiente'}
                          data={['Pendiente','En ejecución','Completada']}
                          onChange={() => setHasChanges(true)} />
                      </SimpleGrid>
                    </Box>
                  ))}
                </Stack>
                <Button size="xs" variant="default" mt="sm" onClick={addTarea}>+ Agregar tarea</Button>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── Recursos ── */}
          <Tabs.Panel value="recursos" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Responsables</Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <TextInput label="Responsable del plan *" value={form.respPlan} onChange={e => update('respPlan', e.target.value)} />
                  <TextInput label="Aprobador" value={form.aprobador} onChange={e => update('aprobador', e.target.value)} />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Select label="Área responsable" value={form.areaResp} onChange={v => update('areaResp', v || '')}
                    data={['Jefatura de Mantenimiento','Supervisión de Patio','Seguridad Industrial','Gerencia de Operaciones','RRHH']} />
                  <Select label="Nivel de aprobación requerido" value={form.nivelAprov} onChange={v => update('nivelAprov', v || '')}
                    data={['Supervisor de turno','Jefe de área','Gerencia de Operaciones','Gerencia General']} />
                </SimpleGrid>
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Presupuesto y recursos</Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }} mb="sm">
                  <Select label="Presupuesto estimado" value={form.presupuesto} onChange={v => update('presupuesto', v || '')}
                    data={['Sin costo','Menor ($0–$1,000)','Moderado ($1K–$10K)','Significativo ($10K–$50K)','Mayor (más de $50K)']} />
                  <Select label="Fuente de financiamiento" value={form.fuente} onChange={v => update('fuente', v || '')}
                    data={['Presupuesto de mantenimiento','Presupuesto operativo','Fondo de emergencia','CAPEX']} />
                  <Select label="Prioridad" value={form.prioridad} onChange={v => update('prioridad', v || '')}
                    data={['Inmediata (24–48h)','Alta (esta semana)','Media (este mes)']} />
                </SimpleGrid>
                <Textarea label="Recursos adicionales necesarios" value={form.recursos} onChange={e => update('recursos', e.target.value)} minRows={2} />
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── Estado ── */}
          <Tabs.Panel value="estado" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Estado del plan</Text>
                <Group gap="sm" mb="md">
                  {(['Pendiente','En progreso','Completado','Vencido','Cancelado'] as EstadoPlan[]).map((e) => (
                    <Box key={e} onClick={() => { setEstado(e); setHasChanges(true); }}
                      style={{ border: `${estado === e ? `2px solid var(--mantine-color-${ESTADO_COLOR[e]}-6)` : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', background: estado === e ? `var(--mantine-color-${ESTADO_COLOR[e]}-0)` : 'transparent' }}>
                      <Text size="xs" fw={estado === e ? 500 : 400} c={estado === e ? (ESTADO_COLOR[e] as any) : 'dimmed'}>{e}</Text>
                    </Box>
                  ))}
                </Group>

                {(estado === 'Vencido' || estado === 'Cancelado') && (
                  <Textarea label="Justificación del cambio de estado *" placeholder="Explica el motivo del cambio de estado..." minRows={3} mb="sm" value={form.justificacion} onChange={e => update('justificacion', e.target.value)} />
                )}
                {estado === 'Completado' && (
                  <Textarea label="Evidencia de cierre" placeholder="Describe las evidencias que demuestran que el plan fue completado exitosamente..." minRows={3} mb="sm" value={form.evidenciaCierre} onChange={e => update('evidenciaCierre', e.target.value)} />
                )}
                <Textarea label="Observaciones del responsable" value={form.observaciones} onChange={e => update('observaciones', e.target.value)} minRows={2} />
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Vista previa de cambios</Text>
                {hasChanges ? (
                  <Stack gap={0}>
                    {[
                      ['Título / Fechas / Objetivo', 'Valores originales', 'Modificados'],
                      ['Avance del plan', '45%', `${avance}%`],
                      ['Responsable / Presupuesto', 'Valores originales', 'Actualizados'],
                      ['Estado', 'En progreso', estado],
                    ].map(([k, old, nuevo]) => (
                      <Group key={k} gap="xs" wrap="wrap" style={{ padding: '5px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Text size="xs" c="dimmed" style={{ minWidth: 130 }}>{k}</Text>
                        <Text size="xs" c="red" style={{ textDecoration: 'line-through' }}>{old}</Text>
                        <Text size="xs" c="dimmed">→</Text>
                        <Text size="xs" c="green" fw={500}>{nuevo}</Text>
                      </Group>
                    ))}
                  </Stack>
                ) : (
                  <Text size="xs" c="dimmed" fs="italic">Sin cambios registrados aún.</Text>
                )}
              </Surface>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Footer */}
        <Surface p="sm">
          <Group justify="space-between">
            <Group gap="sm">
              <Text size="xs" c="dimmed">PM-039 · Creado: 01/04/2026 · Última edición: 16/04/2026</Text>
              {hasChanges && <Badge color="yellow" variant="light" size="xs">Cambios sin guardar</Badge>}
            </Group>
            <Group gap="sm">
              <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.seguimientoPlanes}>Cancelar</Button>
              <Button size="xs" onClick={() => setSaved(true)}>Guardar cambios</Button>
            </Group>
          </Group>
        </Surface>
      </Stack>
    </>
  );
}
