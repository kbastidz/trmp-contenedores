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
  { title: 'Gestión de Incidentes', href: PATH_OPERADOR.gestionIncidentes },
  { title: 'INC-2026-018', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const SEV_OPTIONS = [
  { id: 1, label: 'Leve', sub: 'Sin lesiones', color: 'green', cls: 'green' },
  { id: 2, label: 'Moderado', sub: 'Primeros auxilios', color: 'yellow', cls: 'yellow' },
  { id: 3, label: 'Grave', sub: 'Lesión con baja', color: 'orange', cls: 'orange' },
  { id: 4, label: 'Crítico', sub: 'Fatalidad / emergencia', color: 'red', cls: 'red' },
];

const ESTADOS = ['Abierto', 'En análisis', 'Con plan', 'Cerrado'] as const;
type EstadoType = typeof ESTADOS[number];
const ESTADO_COLOR: Record<EstadoType, string> = { Abierto: 'red', 'En análisis': 'yellow', 'Con plan': 'blue', Cerrado: 'green' };

const AFECTADOS = ['Contenedor(es)', 'Equipo pesado', 'Vehículo liviano', 'Infraestructura del terminal', 'Sistema TOS / Software', 'Carga del cliente'];
const FACTORES = ['Fallo de equipo / maquinaria', 'Error humano', 'Falta de capacitación', 'Procedimiento no seguido', 'Condiciones climáticas adversas', 'Fatiga del operador', 'Comunicación deficiente'];

const ACCIONES_INICIALES = [
  { desc: 'Auditoría completa cobertura sensores perimetrales', resp: 'Jef. Seg. ISPS', fecha: '2026-04-20', estado: 'En progreso' },
  { desc: 'Programar rondas nocturnas 01:00–03:00h sector norte', resp: 'Sup. Turno', fecha: '2026-04-18', estado: 'Completada' },
  { desc: 'Solicitud presupuesto actualización sensores Q2', resp: 'Gerencia Ops', fecha: '2026-04-30', estado: 'Pendiente' },
];

export default function EditarIncidente() {
  const [activeTab, setActiveTab] = useState<string | null>('ocurrencia');
  const [sev, setSev] = useState(4);
  const [estado, setEstado] = useState<EstadoType>('En análisis');
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [acciones, setAcciones] = useState(ACCIONES_INICIALES);

  const [form, setForm] = useState({
    titulo: 'Intento de acceso no autorizado — zona restringida ISPS sector norte',
    desc: 'Persona no identificada intentó ingresar al área de almacenamiento de carga de alto valor a través de sector norte a las 02:34h. Detectado por sensor perimetral y confirmado por cámara C-07.',
    fecha: '2026-04-16',
    hora: '02:34',
    area: 'Seguridad ISPS / BASC',
    turno: 'Turno noche (18:00–06:00)',
    equipo: 'Ninguno / N/A',
    causaInmediata: 'Sensor perimetral sector norte con cobertura parcial — área ciega de 4m sin detección.',
    causaRaiz: 'Presupuesto de actualización de infraestructura ISPS no fue aprobado en Q1. Los sensores instalados datan de 2019.',
    lecciones: 'Necesario realizar auditoría de cobertura de todos los sensores perimetrales y programar rondas obligatorias en horas de menor actividad.',
    inmediatas: 'Se activó protocolo ISPS nivel 2. Policía portuaria notificada a las 02:41h. Área asegurada y evidencia recopilada.',
    observaciones: 'Reporte formal enviado a autoridad portuaria ISPS el 17/04. Auditoría de sensores en curso.',
    motivoCierre: '',
  });

  const update = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setHasChanges(true); };

  const addAccion = () => setAcciones(prev => [...prev, { desc: '', resp: '', fecha: '', estado: 'Pendiente' }]);
  const removeAccion = (i: number) => { setAcciones(prev => prev.filter((_, j) => j !== i)); setHasChanges(true); };
  const updateAccion = (i: number, k: string, v: string) => {
    setAcciones(prev => prev.map((a, j) => j === i ? { ...a, [k]: v } : a));
    setHasChanges(true);
  };

  if (saved) {
    return (
      <>
        <title>Cambios Guardados | Operador</title>
        <PageHeader title="Editar Incidente" breadcrumbItems={breadcrumbs} />
        <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
          <Box style={{ width: 44, height: 44, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </Box>
          <Title order={4} mb={6}>Cambios guardados</Title>
          <Text size="sm" c="dimmed" mb="lg">Los cambios en INC-2026-018 quedaron registrados en el log de auditoría.</Text>
          <Group justify="center" gap="sm">
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.gestionIncidentes}>Volver a incidentes</Button>
          </Group>
        </Surface>
      </>
    );
  }

  return (
    <>
      <title>Editar Incidente | Operador</title>
      <PageHeader
        title="Editar Incidente"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="xs">
            <Text size="xs" c="dimmed">INC-2026-018</Text>
            <Badge color="red" variant="light" size="sm">Crítico</Badge>
            <Badge color={ESTADO_COLOR[estado]} variant="light" size="sm">{estado}</Badge>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Alertas */}
        {hasChanges && (
          <Box p="sm" style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <Text size="xs" c="yellow">Tienes cambios sin guardar — revisa todas las secciones antes de guardar.</Text>
          </Box>
        )}
        <Box p="sm" style={{ background: '#E6F1FB', border: '0.5px solid #B5D4F4', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <Text size="xs" c="blue">Todos los cambios quedarán registrados en el log de auditoría con tu usuario y la fecha/hora exacta.</Text>
        </Box>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="ocurrencia">Ocurrencia</Tabs.Tab>
            <Tabs.Tab value="afectados">Afectados</Tabs.Tab>
            <Tabs.Tab value="analisis">Análisis</Tabs.Tab>
            <Tabs.Tab value="acciones">Acciones</Tabs.Tab>
            <Tabs.Tab value="estado">Estado</Tabs.Tab>
          </Tabs.List>

          {/* ── Ocurrencia ── */}
          <Tabs.Panel value="ocurrencia" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Datos del evento</Text>
                <TextInput label="Título del incidente *" value={form.titulo} onChange={e => update('titulo', e.target.value)} mb="sm" />
                <Textarea label="Descripción detallada" value={form.desc} onChange={e => update('desc', e.target.value)} minRows={3} mb="sm" />
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <TextInput label="Fecha del incidente *" type="date" value={form.fecha} onChange={e => update('fecha', e.target.value)} />
                  <TextInput label="Hora exacta *" type="time" value={form.hora} onChange={e => update('hora', e.target.value)} />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <Select label="Área operacional *" value={form.area} onChange={v => update('area', v || '')}
                    data={['Muelle / Operaciones de buque', 'Patio de contenedores', 'Gate / Portería', 'Taller y equipos', 'Seguridad ISPS / BASC', 'Carga peligrosa IMDG', 'Sistemas TOS / IT']} />
                  <Select label="Turno" value={form.turno} onChange={v => update('turno', v || '')}
                    data={['Turno día (06:00–18:00)', 'Turno noche (18:00–06:00)']} />
                  <Select label="Equipo involucrado" value={form.equipo} onChange={v => update('equipo', v || '')}
                    data={['Ninguno / N/A', 'Grúa STS', 'RTG', 'Reach stacker', 'Sistema TOS']} />
                </SimpleGrid>
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Nivel de severidad *</Text>
                <SimpleGrid cols={{ base: 2, sm: 4 }}>
                  {SEV_OPTIONS.map((s) => (
                    <Box key={s.id} onClick={() => { setSev(s.id); setHasChanges(true); }}
                      style={{ border: `${sev === s.id ? `2px solid var(--mantine-color-${s.cls}-6)` : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '10px 8px', textAlign: 'center', cursor: 'pointer', background: sev === s.id ? `var(--mantine-color-${s.cls}-0)` : 'transparent' }}>
                      <Text size="xs" fw={500} c={s.color as any}>{s.label}</Text>
                      <Text size="xs" c="dimmed">{s.sub}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
                <Group gap="xs" mt="sm">
                  <Text size="xs" c="dimmed">Severidad actual:</Text>
                  <Badge color={SEV_OPTIONS[sev - 1].color as any} variant="light" size="xs">{SEV_OPTIONS[sev - 1].label}</Badge>
                </Group>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── Afectados ── */}
          <Tabs.Panel value="afectados" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Personas</Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <Select label="¿Hubo lesionados?" data={['No', 'Sí']} defaultValue="No" onChange={() => setHasChanges(true)} />
                  <TextInput label="Número de personas" type="number" defaultValue="0" onChange={() => setHasChanges(true)} />
                  <Select label="Atención médica" data={['No fue necesaria', 'Primeros auxilios', 'Traslado a clínica']} defaultValue="No fue necesaria" onChange={() => setHasChanges(true)} />
                </SimpleGrid>
              </Surface>
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Daños materiales y operacionales</Text>
                <Text size="xs" c="dimmed" mb="xs">¿Qué se vio afectado?</Text>
                <Stack gap={4} mb="sm">
                  {AFECTADOS.map((a) => <Checkbox key={a} label={a} size="xs" onChange={() => setHasChanges(true)} />)}
                </Stack>
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <Select label="Estimación económica" data={['Sin daño económico', 'Menor ($0–$1,000)', 'Moderado ($1K–$10K)', 'Significativo ($10K–$100K)']} defaultValue="Sin daño económico" onChange={() => setHasChanges(true)} />
                  <Select label="Impacto en operación" data={['Sin interrupción', 'Retraso menor', 'Interrupción parcial', 'Paralización total']} defaultValue="Sin interrupción" onChange={() => setHasChanges(true)} />
                </SimpleGrid>
                <Select label="Impacto ambiental" data={['No', 'Derrame menor', 'Derrame externo']} defaultValue="No" onChange={() => setHasChanges(true)} />
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── Análisis ── */}
          <Tabs.Panel value="analisis" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Causa raíz</Text>
                <Select label="Metodología" data={['5 Porqués', 'Diagrama Ishikawa', 'Árbol de fallas (FTA)', 'Análisis simplificado']} defaultValue="5 Porqués" mb="sm" onChange={() => setHasChanges(true)} />
                <Textarea label="Causa inmediata" value={form.causaInmediata} onChange={e => update('causaInmediata', e.target.value)} minRows={2} mb="sm" />
                <Textarea label="Causa raíz" value={form.causaRaiz} onChange={e => update('causaRaiz', e.target.value)} minRows={2} mb="sm" />
                <Text size="xs" c="dimmed" mb="xs">Factores contribuyentes</Text>
                <Stack gap={4}>
                  {FACTORES.map((f, i) => <Checkbox key={f} label={f} size="xs" defaultChecked={i === 0} onChange={() => setHasChanges(true)} />)}
                </Stack>
              </Surface>
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Lecciones aprendidas</Text>
                <Textarea value={form.lecciones} onChange={e => update('lecciones', e.target.value)} minRows={3} mb="sm" />
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Select label="¿Podría repetirse?" data={['Sí, sin acciones correctivas', 'Poco probable', 'No, fue aislado']} defaultValue="Sí, sin acciones correctivas" onChange={() => setHasChanges(true)} />
                  <Select label="Actualizar procedimiento" data={['No', 'Sí — Procedimiento operativo', 'Sí — Plan de emergencia']} defaultValue="Sí — Procedimiento operativo" onChange={() => setHasChanges(true)} />
                </SimpleGrid>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── Acciones ── */}
          <Tabs.Panel value="acciones" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Acciones inmediatas tomadas</Text>
                <Textarea value={form.inmediatas} onChange={e => update('inmediatas', e.target.value)} minRows={2} mb="sm" />
                <Select label="Notificación a autoridades" data={['No fue necesario', 'Policía portuaria', 'Cuerpo de bomberos', 'Ministerio de Trabajo']} defaultValue="Policía portuaria" onChange={() => setHasChanges(true)} />
              </Surface>
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Plan de acciones correctivas</Text>
                <Stack gap="sm">
                  {acciones.map((a, i) => (
                    <Box key={i} p="sm" style={{ border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 8, position: 'relative' }}>
                      <Button size="xs" variant="subtle" color="red" style={{ position: 'absolute', top: 6, right: 8 }} onClick={() => removeAccion(i)}>✕ Eliminar</Button>
                      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xs">
                        <TextInput label="Acción" size="xs" value={a.desc} onChange={e => updateAccion(i, 'desc', e.target.value)} />
                        <TextInput label="Responsable" size="xs" value={a.resp} onChange={e => updateAccion(i, 'resp', e.target.value)} />
                        <TextInput label="Fecha límite" type="date" size="xs" value={a.fecha} onChange={e => updateAccion(i, 'fecha', e.target.value)} />
                      </SimpleGrid>
                      <Select label="Estado" size="xs" value={a.estado} onChange={v => updateAccion(i, 'estado', v || 'Pendiente')}
                        data={['Pendiente', 'En progreso', 'Completada', 'Vencida']} style={{ maxWidth: 200 }} />
                    </Box>
                  ))}
                </Stack>
                <Button size="xs" variant="default" mt="sm" onClick={addAccion}>+ Agregar acción</Button>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── Estado ── */}
          <Tabs.Panel value="estado" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Estado del incidente</Text>
                <Group gap="sm" mb="md">
                  {ESTADOS.map((e) => (
                    <Box key={e} onClick={() => { setEstado(e); setHasChanges(true); }}
                      style={{ border: `${estado === e ? `2px solid var(--mantine-color-${ESTADO_COLOR[e]}-6)` : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '6px 14px', cursor: 'pointer', background: estado === e ? `var(--mantine-color-${ESTADO_COLOR[e]}-0)` : 'transparent' }}>
                      <Text size="xs" fw={estado === e ? 500 : 400} c={estado === e ? (ESTADO_COLOR[e] as any) : 'dimmed'}>{e}</Text>
                    </Box>
                  ))}
                </Group>
                {estado === 'Cerrado' && (
                  <Textarea label="Motivo de cierre *" placeholder="Describe cómo se resolvió el incidente y las acciones tomadas que justifican el cierre..." minRows={3} mb="sm" onChange={() => setHasChanges(true)} />
                )}
                <Textarea label="Observaciones internas" value={form.observaciones} onChange={e => update('observaciones', e.target.value)} minRows={2} />
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Vista previa de cambios</Text>
                {hasChanges ? (
                  <Stack gap={0}>
                    {[
                      ['Título', 'Intento acceso no autorizado zona ISPS norte', form.titulo.slice(0, 45) + '…'],
                      ['Causa inmediata', 'Sensor perimetral con cobertura parcial…', form.causaInmediata.slice(0, 40) + '…'],
                      ['Estado', 'En análisis', estado],
                      ['Acciones correctivas', `${ACCIONES_INICIALES.length} acciones`, `${acciones.length} acciones`],
                    ].map(([k, old, nuevo]) => (
                      <Group key={k} gap="xs" style={{ padding: '5px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Text size="xs" c="dimmed" style={{ minWidth: 120 }}>{k}</Text>
                        <Text size="xs" c="red" style={{ textDecoration: 'line-through', flex: 1 }}>{old}</Text>
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
              <Text size="xs" c="dimmed">INC-2026-018 · Última edición: hoy 09:14h</Text>
              {hasChanges && <Badge color="yellow" variant="light" size="xs">Cambios sin guardar</Badge>}
            </Group>
            <Group gap="sm">
              <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.gestionIncidentes}>Cancelar</Button>
              <Button size="xs" onClick={() => setSaved(true)}>Guardar cambios</Button>
            </Group>
          </Group>
        </Surface>
      </Stack>
    </>
  );
}
