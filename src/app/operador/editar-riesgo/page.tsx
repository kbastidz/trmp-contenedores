'use client';

import { useState } from 'react';
import {
  Anchor, Badge, Box, Button, Checkbox, Group, Radio,
  Select, SimpleGrid, Stack, Tabs, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Gestión de Riesgos', href: PATH_OPERADOR.gestionRiesgos },
  { title: 'RISK-2026-001', href: PATH_OPERADOR.detalleRiesgo },
  { title: 'Editar', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

type EstadoRiesgo = 'Activo' | 'En mitigación' | 'Aceptado' | 'Cerrado';
const ESTADO_COLOR: Record<EstadoRiesgo, string> = {
  Activo: 'red', 'En mitigación': 'blue', Aceptado: 'yellow', Cerrado: 'green',
};

const MATRIX_DATA = [[1,2,3,4,5],[2,4,6,8,10],[3,6,9,12,15],[4,8,12,16,20],[5,10,15,20,25]];
function cellBg(v: number) {
  if (v <= 4) return '#EAF3DE';
  if (v <= 9) return '#FAEEDA';
  if (v <= 16) return '#FAECE7';
  return '#FCEBEB';
}
function nivelFromScore(s: number) {
  if (s >= 17) return { label: 'Crítico', color: 'red', hex: '#A32D2D' };
  if (s >= 10) return { label: 'Alto', color: 'orange', hex: '#993C1D' };
  if (s >= 5)  return { label: 'Medio', color: 'yellow', hex: '#854F0B' };
  return { label: 'Bajo', color: 'green', hex: '#3B6D11' };
}

const FACTORES = [
  'Fallo de equipo / maquinaria', 'Error humano / falta de atención',
  'Falta de capacitación', 'Procedimiento no seguido',
  'Condiciones climáticas adversas', 'Fatiga del operador',
  'Comunicación deficiente', 'EPP inadecuado',
];

const CONTROLES = [
  { n: 'Inspección preoperacional de RTGs (diaria)', t: 'Preventivo', ok: false },
  { n: 'Procedimiento operativo estándar — apilamiento', t: 'Preventivo', ok: true },
  { n: 'Capacitación operadores en manejo de RTG', t: 'Preventivo', ok: true },
  { n: 'Sensor de carga en gancho RTG', t: 'Detectivo', ok: false },
  { n: 'Ronda de supervisión por turno', t: 'Detectivo', ok: true },
  { n: 'Plan de emergencia ante caída de contenedor', t: 'Correctivo', ok: false },
];

export default function EditarRiesgo() {
  const [activeTab, setActiveTab] = useState<string | null>('info');
  const [prob, setProb] = useState(5);
  const [imp, setImp] = useState(4);
  const [estado, setEstado] = useState<EstadoRiesgo>('Activo');
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    nombre: 'Caída de contenedor durante operación de RTG',
    desc: "Riesgo de caída de contenedor de 20' o 40' durante operaciones de apilamiento o traslado con RTG-01 a RTG-04 en bloques A y B del patio norte y sur.",
    area: 'Patio de contenedores',
    tipo: 'Seguridad industrial',
    responsable: 'Jef. Mantenimiento · Carlos Loor',
    turno: 'Todos los turnos',
    norma: 'ISO 45001',
    trigger: 'Fallo del sistema hidráulico del RTG o sobrecarga sin detección de sensor',
    causaInmediata: 'RTG-03 y RTG-04 sin sensor de carga en gancho — sin detección de sobrecarga en tiempo real durante apilamiento.',
    causaRaiz: 'Mantenimiento preventivo vencido en 2 de 4 RTGs por escasez de repuestos importados y priorización operativa sobre mantenimiento.',
    observaciones: 'Plan PM-039 al 45%. Plan PM-042 pendiente de aprobación presupuestal. Próxima revisión programada con Gerencia Ops el 25/04.',
    justificacion: '',
    proxRevision: '2026-04-25',
    frecRevision: 'Mensual',
    respRevision: 'Gerencia de Operaciones',
  });

  const update = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setHasChanges(true); };
  const score = prob * imp;
  const nivel = nivelFromScore(score);

  if (saved) {
    return (
      <>
        <title>Riesgo Actualizado | Operador</title>
        <PageHeader title="Editar Riesgo" breadcrumbItems={breadcrumbs} />
        <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
          <Box style={{ width: 44, height: 44, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </Box>
          <Title order={4} mb={6}>Riesgo actualizado correctamente</Title>
          <Text size="sm" c="dimmed" mb="lg">Los cambios en RISK-2026-001 quedaron registrados en el log de auditoría con tu usuario y timestamp.</Text>
          <Group justify="center" gap="sm" wrap="wrap">
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.detalleRiesgo}>Ver ficha</Button>
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.gestionRiesgos}>Ver listado</Button>
            <Button size="xs" component="a" href={PATH_OPERADOR.seguimientoPlanes}>Ver planes</Button>
          </Group>
        </Surface>
      </>
    );
  }

  return (
    <>
      <title>Editar Riesgo | Operador</title>
      <PageHeader
        title="Editar Riesgo"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="xs">
            <Text size="xs" c="dimmed">RISK-2026-001</Text>
            <Badge color={nivel.color as any} variant="light" size="sm">{nivel.label} · {score}</Badge>
            <Badge color={ESTADO_COLOR[estado]} variant="light" size="sm">{estado}</Badge>
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
          <Text size="xs" c="blue">Cada cambio quedará registrado automáticamente en el log de auditoría con usuario, fecha y valores anterior/nuevo.</Text>
        </Box>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="info">Información general</Tabs.Tab>
            <Tabs.Tab value="evaluacion">Evaluación</Tabs.Tab>
            <Tabs.Tab value="causas">Causa raíz</Tabs.Tab>
            <Tabs.Tab value="controles">Controles</Tabs.Tab>
            <Tabs.Tab value="estado">Estado y revisiones</Tabs.Tab>
          </Tabs.List>

          {/* ── Información general ── */}
          <Tabs.Panel value="info" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Datos del riesgo</Text>
                <TextInput label="Nombre del riesgo *" value={form.nombre} onChange={e => update('nombre', e.target.value)} mb="sm" />
                <Textarea label="Descripción detallada" value={form.desc} onChange={e => update('desc', e.target.value)} minRows={3} mb="sm" />
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <Select label="Área operacional *" value={form.area} onChange={v => update('area', v || '')}
                    data={['Muelle / Operaciones de buque','Patio de contenedores','Gate / Portería','Taller y equipos','Seguridad ISPS / BASC','Carga peligrosa IMDG','Sistemas TOS / IT','Salud ocupacional / SSOMA']} />
                  <Select label="Tipo de riesgo *" value={form.tipo} onChange={v => update('tipo', v || '')}
                    data={['Seguridad industrial','Operacional / Proceso','Seguridad física','Ambiental','Tecnológico','Humano / Fatiga','Externo / Climático','Legal / Regulatorio']} />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 3 }} mb="sm">
                  <TextInput label="Responsable *" value={form.responsable} onChange={e => update('responsable', e.target.value)} />
                  <Select label="Turno afectado" value={form.turno} onChange={v => update('turno', v || '')}
                    data={['Turno día','Turno noche','Todos los turnos']} />
                  <Select label="Normativa aplicable" value={form.norma} onChange={v => update('norma', v || '')}
                    data={['Ninguna específica','ISO 45001','ISO 31000','Código ISPS','IMDG','BASC']} />
                </SimpleGrid>
                <TextInput label="Condición desencadenante" value={form.trigger} onChange={e => update('trigger', e.target.value)} />
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── Evaluación ── */}
          <Tabs.Panel value="evaluacion" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="xs">Probabilidad × Impacto</Text>
                <Text size="xs" c="dimmed" mb="sm">Haz clic en la celda de la matriz que representa la nueva evaluación del riesgo.</Text>
                <Group align="flex-start" gap="md">
                  <Box style={{ flex: 1 }}>
                    <Text size="xs" c="dimmed" ta="center" mb={4}>Impacto →</Text>
                    <SimpleGrid cols={5} spacing={3}>
                      {[...Array(5)].map((_, rowIdx) => {
                        const r = 4 - rowIdx;
                        return [...Array(5)].map((_, c) => {
                          const v = MATRIX_DATA[r][c];
                          const isActive = r === prob - 1 && c === imp - 1;
                          return (
                            <Box
                              key={`${r}-${c}`}
                              onClick={() => { setProb(r + 1); setImp(c + 1); setHasChanges(true); }}
                              style={{ height: 34, borderRadius: 4, background: cellBg(v), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, cursor: 'pointer', outline: isActive ? '3px solid var(--mantine-color-text)' : 'none' }}
                            >
                              {isActive ? '★' : ''}
                            </Box>
                          );
                        });
                      })}
                    </SimpleGrid>
                    <SimpleGrid cols={5} spacing={3} mt={4}>
                      {['1 Muy bajo','2 Bajo','3 Medio','4 Alto','5 Muy alto'].map(l => (
                        <Text key={l} size="xs" c="dimmed" ta="center" style={{ fontSize: 9 }}>{l}</Text>
                      ))}
                    </SimpleGrid>
                    <Text size="xs" c="dimmed" mt={4} style={{ fontSize: 10 }}>Probabilidad ↑ (filas de abajo a arriba: 1→5)</Text>
                  </Box>
                  <Stack gap="sm" style={{ minWidth: 110 }}>
                    <Box p="sm" style={{ background: 'var(--mantine-color-default-hover)', borderRadius: 8, textAlign: 'center' }}>
                      <Text size="xs" c="dimmed">Puntaje actual</Text>
                      <Title order={2} style={{ color: nivel.hex }}>{score}</Title>
                      <Badge color={nivel.color as any} variant="light" size="xs" mt={4}>{nivel.label}</Badge>
                    </Box>
                    <Box p="sm" style={{ background: 'var(--mantine-color-default-hover)', borderRadius: 8, textAlign: 'center' }}>
                      <Text size="xs" c="dimmed">Objetivo</Text>
                      <Title order={3} c="yellow">8</Title>
                      <Badge color="yellow" variant="light" size="xs" mt={4}>Medio</Badge>
                    </Box>
                  </Stack>
                </Group>
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Puntaje objetivo post-mitigación</Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <Select label="Probabilidad objetivo" defaultValue="3 — Posible"
                    data={['1 — Raro','2 — Improbable','3 — Posible','4 — Probable','5 — Casi seguro']}
                    onChange={() => setHasChanges(true)} />
                  <Select label="Impacto objetivo" defaultValue="2 — Menor"
                    data={['1 — Insignificante','2 — Menor','3 — Moderado','4 — Mayor','5 — Catastrófico']}
                    onChange={() => setHasChanges(true)} />
                </SimpleGrid>
                <Text size="xs" c="dimmed">Puntaje objetivo calculado: <Text span fw={500} c="yellow">6</Text> — Medio</Text>
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Antecedentes e historial</Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Select label="¿Ya ocurrió antes?" defaultValue="Sí, varias veces"
                    data={['No hay antecedentes','Sí, una vez','Sí, varias veces','Casi ocurrió (near miss)']}
                    onChange={() => setHasChanges(true)} />
                  <TextInput label="Consecuencias potenciales" defaultValue="Fatalidad, daño de contenedor, paralización de patio, sanción regulatoria" onChange={() => setHasChanges(true)} />
                </SimpleGrid>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── Causa raíz ── */}
          <Tabs.Panel value="causas" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Análisis de causa raíz</Text>
                <Textarea label="Causa inmediata" value={form.causaInmediata} onChange={e => update('causaInmediata', e.target.value)} minRows={2} mb="sm" />
                <Textarea label="Causa raíz" value={form.causaRaiz} onChange={e => update('causaRaiz', e.target.value)} minRows={2} mb="sm" />
                <Text size="xs" c="dimmed" mb="xs">Factores contribuyentes</Text>
                <Stack gap={4}>
                  {FACTORES.map((f, i) => (
                    <Checkbox key={f} label={f} size="xs" defaultChecked={i === 0} onChange={() => setHasChanges(true)} />
                  ))}
                </Stack>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── Controles ── */}
          <Tabs.Panel value="controles" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={500} size="sm">Controles existentes</Text>
                  <Text size="xs" c="dimmed">Marca los que están implementados</Text>
                </Group>
                <Stack gap={4}>
                  {CONTROLES.map((c) => (
                    <Group key={c.n} gap="sm" p="xs" style={{ border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 6 }}>
                      <Checkbox size="xs" defaultChecked={c.ok} onChange={() => setHasChanges(true)} />
                      <Text size="xs" style={{ flex: 1 }}>{c.n}</Text>
                      <Text size="xs" c="dimmed">{c.t}</Text>
                    </Group>
                  ))}
                </Stack>
              </Surface>
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Efectividad estimada</Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Select label="Efectividad global de controles" defaultValue="66–80%"
                    data={['Menor del 50%','50–65%','66–80%','81–90%','Mayor del 90%']}
                    onChange={() => setHasChanges(true)} />
                  <Select label="¿Requiere nuevos controles?" defaultValue="Sí, urgente"
                    data={['Sí, urgente','Sí, a mediano plazo','No por ahora']}
                    onChange={() => setHasChanges(true)} />
                </SimpleGrid>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── Estado y revisiones ── */}
          <Tabs.Panel value="estado" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Estado del riesgo</Text>
                <Group gap="sm" mb="md">
                  {(['Activo','En mitigación','Aceptado','Cerrado'] as EstadoRiesgo[]).map((e) => (
                    <Box key={e} onClick={() => { setEstado(e); setHasChanges(true); }}
                      style={{ border: `${estado === e ? `2px solid var(--mantine-color-${ESTADO_COLOR[e]}-6)` : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '6px 14px', cursor: 'pointer', background: estado === e ? `var(--mantine-color-${ESTADO_COLOR[e]}-0)` : 'transparent', textAlign: 'center' }}>
                      <Text size="xs" fw={estado === e ? 500 : 400} c={estado === e ? (ESTADO_COLOR[e] as any) : 'dimmed'}>{e}</Text>
                    </Box>
                  ))}
                </Group>
                {(estado === 'Cerrado' || estado === 'Aceptado') && (
                  <Textarea label="Justificación de cambio de estado *" placeholder="Explica por qué el riesgo cambia a este estado..." minRows={3} mb="sm" onChange={() => setHasChanges(true)} />
                )}
                <Textarea label="Observaciones internas" value={form.observaciones} onChange={e => update('observaciones', e.target.value)} minRows={2} />
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Configuración de revisiones</Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <TextInput label="Fecha de próxima revisión" type="date" value={form.proxRevision} onChange={e => update('proxRevision', e.target.value)} />
                  <Select label="Frecuencia de revisión" value={form.frecRevision} onChange={v => update('frecRevision', v || 'Mensual')}
                    data={['Semanal','Quincenal','Mensual','Trimestral']} />
                  <TextInput label="Responsable de revisión" value={form.respRevision} onChange={e => update('respRevision', e.target.value)} />
                </SimpleGrid>
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Vista previa de cambios</Text>
                {hasChanges ? (
                  <Stack gap={0}>
                    {[
                      ['Nombre / Área / Responsable', 'Valores originales', 'Modificados'],
                      ['Score de riesgo', '20 (Crítico)', `${score} (${nivel.label})`],
                      ['Causa raíz / Factores', 'Texto original', 'Actualizado'],
                      ['Estado / Revisión', 'Activo · 25/04', `${estado} · ${form.proxRevision}`],
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
              <Text size="xs" c="dimmed">RISK-2026-001 · Última edición: 10/04/2026 · 08:00h</Text>
              {hasChanges && <Badge color="yellow" variant="light" size="xs">Cambios sin guardar</Badge>}
            </Group>
            <Group gap="sm">
              <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.detalleRiesgo}>Cancelar</Button>
              <Button size="xs" onClick={() => setSaved(true)}>Guardar cambios</Button>
            </Group>
          </Group>
        </Surface>
      </Stack>
    </>
  );
}
