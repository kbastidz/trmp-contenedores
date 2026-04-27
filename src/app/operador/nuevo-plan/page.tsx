'use client';

import { useState } from 'react';
import {
  Anchor, Badge, Box, Button, Group, Select, SimpleGrid,
  Stack, Stepper, Text, Textarea, TextInput, Title, Checkbox,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Nuevo Plan de Mitigación', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const RISKS = [
  { id: 1, name: 'Caída de contenedor durante operación de RTG', area: 'Patio / Yard', score: 20, color: 'red', plan: 'Sin plan activo' },
  { id: 2, name: 'Falla de grúa STS durante operación de buque', area: 'Muelle / Buque', score: 20, color: 'red', plan: '1 plan vencido' },
  { id: 3, name: 'Incendio en área de carga peligrosa IMDG clase 3', area: 'Patio / Yard', score: 15, color: 'orange', plan: 'Sin plan activo' },
  { id: 4, name: 'Acceso no autorizado a zona restringida ISPS', area: 'Seg. ISPS / BASC', score: 12, color: 'orange', plan: 'Sin plan activo' },
  { id: 5, name: 'Falla del TOS — pérdida de trazabilidad de contenedores', area: 'Sistemas TOS / IT', score: 12, color: 'orange', plan: 'Sin plan activo' },
  { id: 6, name: 'Atropello por reach stacker en zona de patio', area: 'Patio / Yard', score: 10, color: 'yellow', plan: '1 plan en progreso' },
];

const TIPO_CONTROL = [
  { id: 1, label: 'Preventivo', sub: 'Evita que el riesgo ocurra', color: 'green' },
  { id: 2, label: 'Detectivo', sub: 'Identifica si el riesgo ocurre', color: 'blue' },
  { id: 3, label: 'Correctivo', sub: 'Reduce impacto después de ocurrir', color: 'yellow' },
  { id: 4, label: 'Mitigante', sub: 'Reduce la probabilidad', color: 'orange' },
  { id: 5, label: 'Transferencia', sub: 'Seguro o tercero asume el riesgo', color: 'violet' },
  { id: 6, label: 'Aceptación', sub: 'Riesgo asumido con monitoreo', color: 'gray' },
];

export default function NuevoPlan() {
  const [active, setActive] = useState(0);
  const [selRisk, setSelRisk] = useState<number | null>(null);
  const [selTipo, setSelTipo] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [search, setSearch] = useState('');
  const [tareas, setTareas] = useState([{ desc: '', resp: '', fecha: '', prio: 'Alta' }]);

  const [form, setForm] = useState({ titulo: '', objetivo: '', estrategia: '', nivelObj: '', norma: '', indicador: '', rev: '', frecuencia: 'Mensual', respPlan: '', areaResp: '', aprobador: '', nivelAprov: '', presupuesto: '', fuente: '', prioridad: '', recursos: '', inicio: '', cierre: '' });
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const filteredRisks = RISKS.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.area.toLowerCase().includes(search.toLowerCase()));

  if (submitted) {
    return (
      <>
        <title>Plan Creado | Operador</title>
        <PageHeader title="Nuevo Plan de Mitigación" breadcrumbItems={breadcrumbs} />
        <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
          <Box style={{ width: 48, height: 48, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </Box>
          <Title order={4} mb={6}>Plan de mitigación creado</Title>
          <Text size="sm" c="dimmed" mb={4}>ID asignado: <strong>PM-042</strong></Text>
          <Text size="xs" c="dimmed" mb="lg">El responsable y aprobador fueron notificados. El plan aparece activo en el tablero.</Text>
          <Group justify="center" gap="sm" wrap="wrap">
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.seguimientoPlanes}>Tablero Kanban</Button>
            <Button size="xs" component="a" href={PATH_OPERADOR.dashboard}>Dashboard</Button>
          </Group>
        </Surface>
      </>
    );
  }

  return (
    <>
      <title>Nuevo Plan de Mitigación | Operador</title>
      <PageHeader title="Nuevo Plan de Mitigación" breadcrumbItems={breadcrumbs} />

      <Stack gap="md" mt="md">
        <Stepper active={active} onStepClick={setActive} size="sm">
          <Stepper.Step label="Riesgo" />
          <Stepper.Step label="Estrategia" />
          <Stepper.Step label="Tareas" />
          <Stepper.Step label="Recursos" />
          <Stepper.Step label="Revisión" />
        </Stepper>

        {/* Paso 1 - Selección de riesgo */}
        {active === 0 && (
          <Surface p="md">
            <Text fw={500} size="sm" mb="sm">¿A qué riesgo vinculamos este plan? *</Text>
            <TextInput placeholder="Buscar riesgo por nombre o área..." mb="sm" value={search} onChange={e => setSearch(e.target.value)} />
            <Stack gap={6}>
              {filteredRisks.map((r) => (
                <Box key={r.id} onClick={() => setSelRisk(r.id)} style={{ border: `${selRisk === r.id ? '2px solid #185FA5' : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer', background: selRisk === r.id ? '#E6F1FB' : 'transparent' }}>
                  <Group justify="space-between" wrap="nowrap">
                    <Box>
                      <Text size="sm" fw={500}>{r.name}</Text>
                      <Group gap="xs" mt={2}>
                        <Text size="xs" c="dimmed">{r.area}</Text>
                        <Badge color={r.color} variant="light" size="xs">{r.score}</Badge>
                        <Text size="xs" c="dimmed">· {r.plan}</Text>
                      </Group>
                    </Box>
                  </Group>
                </Box>
              ))}
            </Stack>
          </Surface>
        )}

        {/* Paso 2 - Estrategia */}
        {active === 1 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Nombre y objetivo del plan</Text>
              <TextInput label="Título del plan de mitigación *" placeholder="Ej: Instalación de sistema anti-colisión en RTG del patio norte" value={form.titulo} onChange={e => update('titulo', e.target.value)} mb="sm" />
              <Textarea label="Objetivo del plan" placeholder="¿Qué resultado espera lograr con este plan? ¿Cómo reducirá el riesgo?" value={form.objetivo} onChange={e => update('objetivo', e.target.value)} minRows={3} />
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Tipo de control *</Text>
              <SimpleGrid cols={{ base: 2, sm: 3 }}>
                {TIPO_CONTROL.map((t) => (
                  <Box key={t.id} onClick={() => setSelTipo(t.id)} style={{ border: `${selTipo === t.id ? '2px solid #185FA5' : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '10px 8px', textAlign: 'center', cursor: 'pointer', background: selTipo === t.id ? '#E6F1FB' : 'transparent' }}>
                    <Badge color={t.color} variant="light" size="sm">{t.label}</Badge>
                    <Text size="xs" c="dimmed" mt={4}>{t.sub}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Alcance del plan</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select label="Estrategia de reducción" data={['Reducir probabilidad','Reducir impacto','Reducir probabilidad e impacto','Eliminar el riesgo completamente']} value={form.estrategia} onChange={v => update('estrategia', v || '')} />
                <Select label="Nivel de riesgo objetivo (post-mitigación)" data={['Bajo (1–4)','Medio (5–9)','Alto (10–16)']} value={form.nivelObj} onChange={v => update('nivelObj', v || '')} />
              </SimpleGrid>
              <Select label="Normativa o estándar de referencia" mt="sm" data={['Ninguna específica','ISO 45001','ISO 31000','Código ISPS','IMDG','BASC','OHSAS 18001']} value={form.norma} onChange={v => update('norma', v || '')} />
            </Surface>
          </Stack>
        )}

        {/* Paso 3 - Tareas */}
        {active === 2 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="xs">Tareas del plan de mitigación</Text>
              <Text size="xs" c="dimmed" mb="sm">Define las acciones específicas para ejecutar este plan.</Text>
              <Stack gap="sm">
                {tareas.map((t, i) => (
                  <Box key={i} p="sm" style={{ border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 8 }}>
                    <Group justify="space-between" mb="xs">
                      <Text size="xs" c="dimmed" fw={500}>Tarea {i + 1}</Text>
                      {tareas.length > 1 && <Button size="xs" variant="subtle" color="red" onClick={() => setTareas(ts => ts.filter((_, j) => j !== i))}>✕ Eliminar</Button>}
                    </Group>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} mb="xs">
                      <TextInput label="Descripción *" placeholder="Ej: Adquirir e instalar sensor XR-200" size="xs" value={t.desc} onChange={e => setTareas(ts => ts.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
                      <TextInput label="Responsable" placeholder="Nombre o cargo" size="xs" value={t.resp} onChange={e => setTareas(ts => ts.map((x, j) => j === i ? { ...x, resp: e.target.value } : x))} />
                    </SimpleGrid>
                    <SimpleGrid cols={{ base: 1, sm: 3 }}>
                      <TextInput label="Fecha límite" type="date" size="xs" value={t.fecha} onChange={e => setTareas(ts => ts.map((x, j) => j === i ? { ...x, fecha: e.target.value } : x))} />
                      <Select label="Prioridad" size="xs" data={['Alta','Media','Baja']} value={t.prio} onChange={v => setTareas(ts => ts.map((x, j) => j === i ? { ...x, prio: v || 'Alta' } : x))} />
                    </SimpleGrid>
                  </Box>
                ))}
              </Stack>
              <Button size="xs" variant="default" mt="sm" onClick={() => setTareas(ts => [...ts, { desc: '', resp: '', fecha: '', prio: 'Alta' }])}>+ Agregar tarea</Button>
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Indicador de éxito</Text>
              <Textarea label="¿Cómo sabremos que el plan fue exitoso? *" placeholder="Ej: Reducir puntaje del riesgo de 20 a máximo 8. Cero incidentes en 90 días." minRows={2} value={form.indicador} onChange={e => update('indicador', e.target.value)} />
              <SimpleGrid cols={{ base: 1, sm: 2 }} mt="sm">
                <TextInput label="Fecha de revisión de efectividad" type="date" value={form.rev} onChange={e => update('rev', e.target.value)} />
                <Select label="Frecuencia de seguimiento" data={['Diaria','Semanal','Quincenal','Mensual','Trimestral']} value={form.frecuencia} onChange={v => update('frecuencia', v || 'Mensual')} />
              </SimpleGrid>
            </Surface>
          </Stack>
        )}

        {/* Paso 4 - Recursos */}
        {active === 3 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Responsables</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput label="Responsable del plan *" placeholder="Nombre o cargo" value={form.respPlan} onChange={e => update('respPlan', e.target.value)} />
                <Select label="Área responsable" data={['Jefatura de Mantenimiento','Supervisión de Patio','Seguridad Industrial','Gerencia de Operaciones','RRHH','Sistemas / TI','Seguridad ISPS']} value={form.areaResp} onChange={v => update('areaResp', v || '')} />
              </SimpleGrid>
              <SimpleGrid cols={{ base: 1, sm: 2 }} mt="sm">
                <TextInput label="Aprobador del plan" placeholder="Cargo o nombre del aprobador" value={form.aprobador} onChange={e => update('aprobador', e.target.value)} />
                <Select label="Nivel de aprobación requerido" data={['Supervisor de turno','Jefe de área','Gerencia de Operaciones','Gerencia General']} value={form.nivelAprov} onChange={v => update('nivelAprov', v || '')} />
              </SimpleGrid>
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Presupuesto y recursos</Text>
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <Select label="Presupuesto estimado" data={['Sin costo','Menor ($0–$1,000)','Moderado ($1,000–$10,000)','Significativo ($10,000–$50,000)','Mayor (más de $50,000)']} value={form.presupuesto} onChange={v => update('presupuesto', v || '')} />
                <Select label="Fuente de financiamiento" data={['Presupuesto operativo','Presupuesto de mantenimiento','Fondo de emergencia','Inversión de capital (CAPEX)','Seguro / tercero']} value={form.fuente} onChange={v => update('fuente', v || '')} />
                <Select label="Prioridad de ejecución *" data={['Inmediata (24–48h)','Alta (esta semana)','Media (este mes)','Baja (próximo trimestre)']} value={form.prioridad} onChange={v => update('prioridad', v || '')} />
              </SimpleGrid>
              <Textarea label="Recursos adicionales necesarios" placeholder="Ej: 2 técnicos especializados, sensor modelo XR-200..." mt="sm" minRows={2} value={form.recursos} onChange={e => update('recursos', e.target.value)} />
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Cronograma</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput label="Fecha de inicio *" type="date" value={form.inicio} onChange={e => update('inicio', e.target.value)} />
                <TextInput label="Fecha límite de cierre *" type="date" value={form.cierre} onChange={e => update('cierre', e.target.value)} />
              </SimpleGrid>
            </Surface>
          </Stack>
        )}

        {/* Paso 5 - Revisión */}
        {active === 4 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Resumen del plan de mitigación</Text>
              <Stack gap={0}>
                {[
                  ['Riesgo vinculado', selRisk ? RISKS.find(r => r.id === selRisk)?.name || '—' : '—'],
                  ['Título del plan', form.titulo || '—'],
                  ['Tipo de control', selTipo ? TIPO_CONTROL.find(t => t.id === selTipo)?.label || '—' : '—'],
                  ['Estrategia', form.estrategia || '—'],
                  ['Nivel objetivo post-mitigación', form.nivelObj || '—'],
                  ['Responsable del plan', form.respPlan || '—'],
                  ['Prioridad de ejecución', form.prioridad || '—'],
                  ['Fecha de inicio', form.inicio || '—'],
                  ['Fecha límite', form.cierre || '—'],
                  ['Presupuesto estimado', form.presupuesto || '—'],
                  ['Número de tareas', String(tareas.length)],
                ].map(([k, v]) => (
                  <Group key={k} justify="space-between" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                    <Text size="xs" c="dimmed" style={{ minWidth: 180 }}>{k}</Text>
                    <Text size="xs" fw={500} ta="right">{v}</Text>
                  </Group>
                ))}
              </Stack>
            </Surface>
            <Surface p="md">
              <Checkbox
                label="Confirmo que el plan es viable, los recursos están disponibles y el responsable fue notificado."
                size="xs"
                checked={confirmed}
                onChange={e => setConfirmed(e.currentTarget.checked)}
              />
            </Surface>
          </Stack>
        )}

        <Group justify="space-between">
          <Button variant="default" size="sm" disabled={active === 0} onClick={() => setActive(a => a - 1)}>← Anterior</Button>
          <Text size="xs" c="dimmed">Paso {active + 1} de 5</Text>
          {active < 4
            ? <Button size="sm" onClick={() => setActive(a => a + 1)}>Siguiente →</Button>
            : <Button size="sm" disabled={!confirmed} onClick={() => setSubmitted(true)}>Crear plan</Button>
          }
        </Group>
      </Stack>
    </>
  );
}
