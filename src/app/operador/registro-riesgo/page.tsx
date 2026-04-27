'use client';

import { useState } from 'react';
import {
  Anchor, Badge, Box, Button, Checkbox, Group, Radio, Select,
  SimpleGrid, Stack, Stepper, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Registrar Riesgo', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const CONTROLES = [
  { label: 'Procedimiento operativo estándar (POE) documentado', tipo: 'Preventivo' },
  { label: 'Capacitación y entrenamiento del personal', tipo: 'Preventivo' },
  { label: 'Inspección preoperacional de equipos', tipo: 'Preventivo' },
  { label: 'Sistema de bloqueo/etiquetado (LOTO)', tipo: 'Preventivo' },
  { label: 'Equipo de protección personal (EPP)', tipo: 'Preventivo' },
  { label: 'Señalización y demarcación de zonas', tipo: 'Preventivo' },
  { label: 'Alarmas y sensores de seguridad', tipo: 'Detectivo' },
  { label: 'Rondas de supervisión y auditorías', tipo: 'Detectivo' },
  { label: 'Plan de emergencia y evacuación', tipo: 'Correctivo' },
];

function getScoreInfo(score: number) {
  if (score <= 4) return { label: 'Bajo', color: 'green' };
  if (score <= 9) return { label: 'Medio', color: 'yellow' };
  if (score <= 16) return { label: 'Alto', color: 'orange' };
  return { label: 'Crítico', color: 'red' };
}

export default function RegistroRiesgo() {
  const [active, setActive] = useState(0);
  const [prob, setProb] = useState('');
  const [imp, setImp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ nombre: '', desc: '', area: '', tipo: '', resp: '', turno: '', norma: '', prev: '', trigger: '', conseq: '', accion: '', resp2: '', fecha: '', prio: '', recursos: '' });
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const score = prob && imp ? parseInt(prob) * parseInt(imp) : null;
  const scoreInfo = score ? getScoreInfo(score) : null;

  if (submitted) {
    return (
      <>
        <title>Riesgo Registrado | Operador</title>
        <PageHeader title="Registrar Riesgo" breadcrumbItems={breadcrumbs} />
        <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
          <Box style={{ width: 48, height: 48, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </Box>
          <Title order={4} mb={6}>Riesgo registrado exitosamente</Title>
          <Text size="sm" c="dimmed" mb="lg">ID asignado: <strong>RISK-2026-025</strong> · El responsable será notificado por correo</Text>
          <Group justify="center" gap="sm">
            <Button size="xs" variant="default" onClick={() => { setSubmitted(false); setActive(0); }}>Registrar otro</Button>
            <Button size="xs" component="a" href={PATH_OPERADOR.dashboard}>Ir al dashboard</Button>
          </Group>
        </Surface>
      </>
    );
  }

  return (
    <>
      <title>Registrar Riesgo | Operador</title>
      <PageHeader title="Registrar Riesgo Operacional" breadcrumbItems={breadcrumbs} />

      <Stack gap="md" mt="md">
        <Stepper active={active} onStepClick={setActive} size="sm">
          <Stepper.Step label="Identificación" />
          <Stepper.Step label="Evaluación" />
          <Stepper.Step label="Controles" />
          <Stepper.Step label="Revisión" />
        </Stepper>

        {/* Paso 1 */}
        {active === 0 && (
          <Surface p="md">
            <Text fw={500} size="sm" mb="md">Información general del riesgo</Text>
            <Stack gap="sm">
              <TextInput label="Nombre del riesgo *" placeholder="Ej: Caída de contenedor durante operación de RTG en patio" value={form.nombre} onChange={e => update('nombre', e.target.value)} />
              <Textarea label="Descripción detallada" placeholder="Describa el escenario de riesgo, condiciones que lo generan y posibles consecuencias..." value={form.desc} onChange={e => update('desc', e.target.value)} minRows={3} />
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select label="Área operacional *" placeholder="Seleccionar..." value={form.area} onChange={v => update('area', v || '')}
                  data={['Muelle / Operaciones de buque','Patio de contenedores (Yard)','Gate / Portería','Taller y equipos','Seguridad ISPS / BASC','Carga peligrosa IMDG','Sistemas TOS / IT','Salud ocupacional','Medio ambiente']} />
                <Select label="Tipo de riesgo *" placeholder="Seleccionar..." value={form.tipo} onChange={v => update('tipo', v || '')}
                  data={['Seguridad industrial','Operacional / Proceso','Seguridad física','Ambiental','Tecnológico','Humano / Fatiga','Externo / Climático','Legal / Regulatorio']} />
              </SimpleGrid>
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <TextInput label="Responsable *" placeholder="Nombre o cargo" value={form.resp} onChange={e => update('resp', e.target.value)} />
                <Select label="Turno afectado" placeholder="Todos" value={form.turno} onChange={v => update('turno', v || '')} data={['Turno día','Turno noche','Todos los turnos']} clearable />
                <Select label="Normativa aplicable" placeholder="Ninguna específica" value={form.norma} onChange={v => update('norma', v || '')} data={['ISO 45001','Código ISPS','IMDG','BASC','ISO 31000']} clearable />
              </SimpleGrid>
            </Stack>
          </Surface>
        )}

        {/* Paso 2 */}
        {active === 1 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Matriz de evaluación — probabilidad × impacto</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Radio.Group label="Probabilidad de ocurrencia *" value={prob} onChange={setProb}>
                  <Stack gap={4} mt={4}>
                    {[['1','1 — Raro (menos de 1 vez al año)'],['2','2 — Improbable (1 vez al año)'],['3','3 — Posible (mensual)'],['4','4 — Probable (semanal)'],['5','5 — Casi seguro (diario)']].map(([v,l]) => (
                      <Radio key={v} value={v} label={l} size="xs" styles={{ root: { padding: '6px 8px', border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 6 } }} />
                    ))}
                  </Stack>
                </Radio.Group>
                <Radio.Group label="Nivel de impacto *" value={imp} onChange={setImp}>
                  <Stack gap={4} mt={4}>
                    {[['1','1 — Insignificante (sin lesiones)'],['2','2 — Menor (primeros auxilios)'],['3','3 — Moderado (lesión con baja)'],['4','4 — Mayor (lesión grave / pérdida)'],['5','5 — Catastrófico (fatalidad)']].map(([v,l]) => (
                      <Radio key={v} value={v} label={l} size="xs" styles={{ root: { padding: '6px 8px', border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 6 } }} />
                    ))}
                  </Stack>
                </Radio.Group>
              </SimpleGrid>
              {score && scoreInfo && (
                <Group mt="md" p="sm" style={{ border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 8 }}>
                  <Box>
                    <Text size="xs" c="dimmed">Puntaje calculado</Text>
                    <Title order={3} c={scoreInfo.color}>{score}</Title>
                  </Box>
                  <Badge color={scoreInfo.color} variant="light">{scoreInfo.label}</Badge>
                </Group>
              )}
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Contexto adicional</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select label="¿Ya ocurrió antes?" data={['No hay antecedentes','Sí, una vez','Sí, varias veces','Casi ocurrió (near miss)']} />
                <TextInput label="Condición que lo desencadena" placeholder="Ej: viento > 45 km/h, fallo de sensor..." />
              </SimpleGrid>
              <Textarea label="Consecuencias potenciales" placeholder="Personas, equipos, medio ambiente, reputación, operación..." mt="sm" minRows={2} />
            </Surface>
          </Stack>
        )}

        {/* Paso 3 */}
        {active === 2 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="xs">Controles existentes</Text>
              <Text size="xs" c="dimmed" mb="sm">Marca los controles que ya están implementados para este riesgo</Text>
              <Stack gap={4}>
                {CONTROLES.map((c) => (
                  <Group key={c.label} gap="sm" style={{ padding: '6px 10px', border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 6 }}>
                    <Checkbox size="xs" />
                    <Text size="xs" style={{ flex: 1 }}>{c.label}</Text>
                    <Text size="xs" c="dimmed">{c.tipo}</Text>
                  </Group>
                ))}
              </Stack>
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Plan de mitigación</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput label="Acción de mitigación propuesta *" placeholder="Ej: Instalar sensor de carga en gancho de RTG" value={form.accion} onChange={e => update('accion', e.target.value)} />
                <TextInput label="Responsable de la acción" placeholder="Cargo o nombre" value={form.resp2} onChange={e => update('resp2', e.target.value)} />
              </SimpleGrid>
              <SimpleGrid cols={{ base: 1, sm: 2 }} mt="sm">
                <TextInput label="Fecha límite" type="date" value={form.fecha} onChange={e => update('fecha', e.target.value)} />
                <Select label="Prioridad" data={['Inmediata (24h)','Alta (1 semana)','Media (1 mes)','Baja (trimestral)']} />
              </SimpleGrid>
              <TextInput label="Recursos necesarios" placeholder="Ej: Presupuesto $3,000, coordinación con proveedor..." mt="sm" value={form.recursos} onChange={e => update('recursos', e.target.value)} />
            </Surface>
          </Stack>
        )}

        {/* Paso 4 - Revisión */}
        {active === 3 && (
          <Surface p="md">
            <Text fw={500} size="sm" mb="md">Resumen del riesgo — revisión final</Text>
            <Stack gap={0}>
              {[
                ['Nombre del riesgo', form.nombre || '—'],
                ['Área operacional', form.area || '—'],
                ['Tipo de riesgo', form.tipo || '—'],
                ['Responsable', form.resp || '—'],
                ['Probabilidad', prob ? `${prob}/5` : '—'],
                ['Impacto', imp ? `${imp}/5` : '—'],
                ['Puntaje / Nivel', score ? `${score} — ${scoreInfo?.label}` : '—'],
                ['Acción de mitigación', form.accion || '—'],
                ['Prioridad', form.prio || '—'],
                ['Fecha límite', form.fecha || '—'],
              ].map(([k, v]) => (
                <Group key={k} justify="space-between" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                  <Text size="xs" c="dimmed" style={{ minWidth: 160 }}>{k}</Text>
                  <Text size="xs" fw={500} ta="right">{v}</Text>
                </Group>
              ))}
            </Stack>
          </Surface>
        )}

        <Group justify="space-between">
          <Button variant="default" size="sm" disabled={active === 0} onClick={() => setActive(a => a - 1)}>← Anterior</Button>
          <Text size="xs" c="dimmed">Paso {active + 1} de 4</Text>
          {active < 3
            ? <Button size="sm" onClick={() => setActive(a => a + 1)}>Siguiente →</Button>
            : <Button size="sm" style={{ background: '#185FA5', color: 'white' }} onClick={() => setSubmitted(true)}>Registrar riesgo</Button>
          }
        </Group>
      </Stack>
    </>
  );
}
