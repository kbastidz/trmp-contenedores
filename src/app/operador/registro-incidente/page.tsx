'use client';

import { useState } from 'react';
import {
  Anchor, Badge, Box, Button, Checkbox, Group, NativeSelect, NumberInput,
  Select, SimpleGrid, Stack, Stepper, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Registrar Incidente', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const SEV_OPTIONS = [
  { id: 1, label: 'Leve', sub: 'Sin lesiones · daño menor', color: 'green' },
  { id: 2, label: 'Moderado', sub: 'Primeros auxilios · baja operativa', color: 'yellow' },
  { id: 3, label: 'Grave', sub: 'Lesión con baja · daño mayor', color: 'orange' },
  { id: 4, label: 'Crítico', sub: 'Fatalidad · emergencia mayor', color: 'red' },
];

const AFECTADOS = ['Contenedor(es)', 'Equipo pesado (RTG/STS/Reach)', 'Vehículo liviano', 'Infraestructura del terminal', 'Sistema TOS / Software', 'Carga del cliente', 'Medio ambiente'];
const FACTORES = ['Fallo de equipo / maquinaria', 'Error humano / falta de atención', 'Falta de capacitación', 'Procedimiento no seguido', 'Condiciones climáticas adversas', 'Fatiga del operador', 'Comunicación deficiente', 'Herramientas / EPP inadecuados'];
const EVIDENCIAS = ['Fotografías del sitio', 'Video de cámara de seguridad', 'Informe del operador', 'Bitácora de turno', 'Reporte de mantenimiento', 'Ficha técnica del equipo'];

export default function RegistroIncidente() {
  const [active, setActive] = useState(0);
  const [sev, setSev] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    titulo: '', desc: '', fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5), area: '', turno: '', equipo: '',
    lesion: 'no', npersonas: 0, tlesion: '', medica: '', costo: '', impop: '', ambiental: '',
    metodo: '', cimediata: '', craiz: '', testigos: '', inmediatas: '', autoridades: '', lecciones: '', recurrencia: '', proc: '',
  });

  const update = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  if (submitted) {
    return (
      <>
        <title>Incidente Registrado | Operador</title>
        <PageHeader title="Registrar Incidente" breadcrumbItems={breadcrumbs} />
        <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
          <Box style={{ width: 48, height: 48, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </Box>
          <Title order={4} mb={6}>Incidente registrado exitosamente</Title>
          <Text size="sm" c="dimmed" mb={4}>ID asignado: <strong>INC-2026-018</strong></Text>
          <Text size="xs" c="dimmed" mb="lg">Notificaciones enviadas al supervisor de turno y a Seguridad Industrial</Text>
          <Group justify="center" gap="sm" wrap="wrap">
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.gestionIncidentes}>Ver incidentes</Button>
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.registroRiesgo}>Vincular a riesgo</Button>
            <Button size="xs" component="a" href={PATH_OPERADOR.dashboard}>Dashboard</Button>
          </Group>
        </Surface>
      </>
    );
  }

  return (
    <>
      <title>Registrar Incidente | Operador</title>
      <PageHeader title="Registrar Incidente" breadcrumbItems={breadcrumbs} />

      <Stack gap="md" mt="md">
        <Stepper active={active} onStepClick={setActive} size="sm">
          <Stepper.Step label="Ocurrencia" />
          <Stepper.Step label="Afectados" />
          <Stepper.Step label="Análisis" />
          <Stepper.Step label="Acciones" />
          <Stepper.Step label="Revisión" />
        </Stepper>

        {/* Paso 1 */}
        {active === 0 && (
          <Stack gap="md">
            {sev === 4 && (
              <Box p="sm" style={{ background: '#FCEBEB', borderRadius: 8, border: '0.5px solid #F09595' }}>
                <Text size="xs" c="red">Incidente crítico detectado — se notificará automáticamente a Gerencia y Seguridad Industrial.</Text>
              </Box>
            )}
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">¿Qué ocurrió?</Text>
              <Stack gap="sm">
                <TextInput label="Título del incidente *" placeholder="Ej: Fallo hidráulico en RTG-03 durante operación de apilamiento" value={form.titulo} onChange={e => update('titulo', e.target.value)} />
                <Textarea label="Descripción detallada del evento *" placeholder="Narre cronológicamente lo sucedido..." value={form.desc} onChange={e => update('desc', e.target.value)} minRows={3} />
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput label="Fecha del incidente *" type="date" value={form.fecha} onChange={e => update('fecha', e.target.value)} />
                  <TextInput label="Hora exacta *" type="time" value={form.hora} onChange={e => update('hora', e.target.value)} />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <Select label="Área operacional *" placeholder="Seleccionar..." value={form.area} onChange={v => update('area', v || '')}
                    data={['Muelle / Operaciones de buque','Patio de contenedores','Gate / Portería','Taller y equipos','Seguridad ISPS / BASC','Carga peligrosa IMDG','Sistemas TOS / IT','Salud ocupacional']} />
                  <Select label="Turno" value={form.turno} onChange={v => update('turno', v || '')}
                    data={['Turno día (06:00–18:00)','Turno noche (18:00–06:00)']} />
                  <Select label="Equipo involucrado" placeholder="Ninguno / N/A" value={form.equipo} onChange={v => update('equipo', v || '')}
                    data={['Grúa STS','RTG','RMG','Reach stacker','Tractor de patio','Montacargas','Vehículo liviano','Sistema TOS','Otro equipo']} clearable />
                </SimpleGrid>
              </Stack>
            </Surface>

            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Nivel de severidad *</Text>
              <SimpleGrid cols={{ base: 2, sm: 4 }}>
                {SEV_OPTIONS.map((s) => (
                  <Box key={s.id} onClick={() => setSev(s.id)} style={{ border: `2px solid ${sev === s.id ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '10px 8px', textAlign: 'center', cursor: 'pointer', background: sev === s.id ? 'var(--mantine-color-blue-0)' : 'transparent' }}>
                    <Badge color={s.color} variant="light" size="sm">{s.label}</Badge>
                    <Text size="xs" c="dimmed" mt={4}>{s.sub}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Surface>
          </Stack>
        )}

        {/* Paso 2 */}
        {active === 1 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Personas afectadas</Text>
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <Select label="¿Hubo lesionados?" value={form.lesion} onChange={v => update('lesion', v || 'no')} data={[{value:'no',label:'No'},{value:'si',label:'Sí'}]} />
                <NumberInput label="Número de personas" value={form.npersonas} onChange={v => update('npersonas', Number(v))} min={0} />
                <Select label="Tipo de lesión" disabled={form.lesion === 'no'} data={['N/A','Golpe / contusión','Laceración / corte','Fractura','Quemadura','Intoxicación','Politraumatismo','Fallecimiento']} />
              </SimpleGrid>
              <Select label="¿Se brindó atención médica?" mt="sm" data={['No fue necesaria','Primeros auxilios en sitio','Traslado a clínica / hospital','Atención de emergencia']} />
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Daños materiales y operacionales</Text>
              <Text size="xs" c="dimmed" mb="sm">¿Qué se vio afectado?</Text>
              <Stack gap={4} mb="sm">
                {AFECTADOS.map((a) => <Checkbox key={a} label={a} size="xs" />)}
              </Stack>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select label="Estimación de daño económico" data={['Sin daño económico','Menor ($0–$1,000)','Moderado ($1,000–$10,000)','Significativo ($10,000–$100,000)','Mayor (más de $100,000)']} />
                <Select label="Impacto en operación" data={['Sin interrupción','Retraso menor (menos de 1h)','Interrupción parcial (1–4h)','Paralización total (más de 4h)']} />
              </SimpleGrid>
              <Select label="¿Hubo impacto ambiental?" mt="sm" data={['No','Derrame menor contenido en área','Derrame con alcance externo','Emisión de gases / contaminantes']} />
            </Surface>
          </Stack>
        )}

        {/* Paso 3 */}
        {active === 2 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Análisis de causa raíz</Text>
              <Stack gap="sm">
                <Select label="Metodología de análisis" data={['5 Porqués','Diagrama Ishikawa (causa-efecto)','Árbol de fallas (FTA)','Análisis simplificado']} />
                <Textarea label="Causa inmediata" placeholder="Ej: Fallo del sistema hidráulico del RTG-03..." value={form.cimediata} onChange={e => update('cimediata', e.target.value)} minRows={2} />
                <Textarea label="Causa básica / raíz" placeholder="Ej: Mantenimiento preventivo vencido hace 3 semanas..." value={form.craiz} onChange={e => update('craiz', e.target.value)} minRows={2} />
                <Text size="xs" c="dimmed" mb={4}>Factores contribuyentes</Text>
                <Stack gap={4}>
                  {FACTORES.map((f) => <Checkbox key={f} label={f} size="xs" />)}
                </Stack>
              </Stack>
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Testigos y evidencia</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Textarea label="Testigos presentes" placeholder="Nombre y cargo de personas que presenciaron el evento" minRows={2} />
                <Stack gap={4}>
                  <Text size="xs" c="dimmed">Evidencia recopilada</Text>
                  {EVIDENCIAS.map((e) => <Checkbox key={e} label={e} size="xs" />)}
                </Stack>
              </SimpleGrid>
            </Surface>
          </Stack>
        )}

        {/* Paso 4 */}
        {active === 3 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Acciones inmediatas tomadas</Text>
              <Textarea label="¿Qué se hizo en el momento?" placeholder="Ej: Se detuvo la operación del RTG-03, se activó protocolo de emergencia..." minRows={3} />
              <Select label="¿Se notificó a autoridades externas?" mt="sm" data={['No fue necesario','Autoridad portuaria','Cuerpo de bomberos','Policía / Fuerzas del orden','Ministerio de Trabajo','Entidad ambiental']} />
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Plan de acción correctiva</Text>
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <TextInput label="Acción *" placeholder="Descripción de la acción" />
                <TextInput label="Responsable" placeholder="Cargo o nombre" />
                <TextInput label="Fecha límite" type="date" />
              </SimpleGrid>
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Lecciones aprendidas</Text>
              <Textarea label="¿Qué aprendizaje deja este incidente?" placeholder="Ej: Es crítico mantener los ciclos de mantenimiento preventivo..." minRows={3} />
              <SimpleGrid cols={{ base: 1, sm: 2 }} mt="sm">
                <Select label="¿Este incidente podría repetirse?" data={['Sí, sin las acciones correctivas','Poco probable con los controles actuales','No, fue un evento aislado']} />
                <Select label="¿Requiere actualizar algún procedimiento?" data={['No','Sí — POE de mantenimiento','Sí — Plan de emergencia','Sí — Procedimiento operativo','Sí — Política de seguridad']} />
              </SimpleGrid>
            </Surface>
          </Stack>
        )}

        {/* Paso 5 - Revisión */}
        {active === 4 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Revisión final del incidente</Text>
              <Stack gap={0}>
                {[
                  ['Título del incidente', form.titulo || '—'],
                  ['Fecha y hora', `${form.fecha} ${form.hora}`],
                  ['Área operacional', form.area || '—'],
                  ['Turno', form.turno || '—'],
                  ['Equipo involucrado', form.equipo || 'N/A'],
                  ['Severidad', sev ? SEV_OPTIONS[sev - 1].label : '—'],
                  ['Lesionados', form.lesion === 'si' ? `${form.npersonas} persona(s)` : 'No'],
                  ['Causa inmediata', form.cimediata || '—'],
                  ['Causa raíz', form.craiz || '—'],
                ].map(([k, v]) => (
                  <Group key={k} justify="space-between" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                    <Text size="xs" c="dimmed" style={{ minWidth: 160 }}>{k}</Text>
                    <Text size="xs" fw={500} ta="right">{v}</Text>
                  </Group>
                ))}
              </Stack>
            </Surface>
            <Surface p="md">
              <Checkbox
                label="Confirmo que la información es verídica y completa. Entiendo que este registro quedará en el historial oficial del terminal."
                size="xs"
                checked={confirmed}
                onChange={e => setConfirmed(e.currentTarget.checked)}
              />
            </Surface>
          </Stack>
        )}

        {/* Navegación */}
        <Group justify="space-between">
          <Button variant="default" size="sm" disabled={active === 0} onClick={() => setActive(a => a - 1)}>← Anterior</Button>
          <Text size="xs" c="dimmed">Paso {active + 1} de 5</Text>
          {active < 4
            ? <Button size="sm" onClick={() => setActive(a => a + 1)}>Siguiente →</Button>
            : <Button size="sm" disabled={!confirmed} onClick={() => setSubmitted(true)}>Registrar incidente</Button>
          }
        </Group>
      </Stack>
    </>
  );
}
