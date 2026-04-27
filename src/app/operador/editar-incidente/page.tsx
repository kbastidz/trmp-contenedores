'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Anchor, Badge, Box, Button, Group, Loader,
  Select, SimpleGrid, Stack, Tabs, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';
import { useIncidente } from '@/lib/hooks/useApi';
import { incidentesService } from '@/lib/trm';
import type { EstadoIncidente, SeveridadIncidente, UpdateIncidentePayload } from '@/types/trm';

const SEV_OPTIONS: { id: number; label: SeveridadIncidente; sub: string; color: string }[] = [
  { id: 1, label: 'Leve',     sub: 'Sin lesiones',          color: 'green'  },
  { id: 2, label: 'Moderado', sub: 'Primeros auxilios',     color: 'yellow' },
  { id: 3, label: 'Grave',    sub: 'Lesión con baja',       color: 'orange' },
  { id: 4, label: 'Crítico',  sub: 'Fatalidad / emergencia', color: 'red'   },
];

const ESTADOS: EstadoIncidente[] = ['Abierto', 'En análisis', 'Con plan', 'Cerrado'];
const ESTADO_COLOR: Record<EstadoIncidente, string> = { Abierto: 'red', 'En análisis': 'yellow', 'Con plan': 'blue', Cerrado: 'green' };

const FACTORES = [
  'Fallo de equipo / maquinaria','Error humano','Falta de capacitación',
  'Procedimiento no seguido','Condiciones climáticas adversas',
  'Fatiga del operador','Comunicación deficiente',
];

export default function EditarIncidente() {
  const params = useSearchParams();
  const id = params.get('id');

  const { data: incidente, loading, error } = useIncidente(id);

  const [activeTab, setActiveTab] = useState<string | null>('ocurrencia');
  const [sev, setSev] = useState(1);
  const [estado, setEstado] = useState<EstadoIncidente>('Abierto');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState({
    titulo: '', descripcion: '', fecha: '', hora: '',
    area: '', turno: '', equipo: '',
    causa_inmediata: '', causa_raiz: '',
    lecciones_aprendidas: '', acciones_inmediatas: '',
    observaciones_internas: '', motivo_cierre: '',
  });

  useEffect(() => {
    if (!incidente) return;
    const sevIdx = SEV_OPTIONS.findIndex(s => s.label === incidente.severidad);
    setSev(sevIdx >= 0 ? sevIdx + 1 : 1);
    setEstado(incidente.estado);
    setForm({
      titulo: incidente.titulo ?? '',
      descripcion: incidente.descripcion ?? '',
      fecha: incidente.fecha_ocurrencia?.split('T')[0] ?? '',
      hora: incidente.hora_ocurrencia ?? '',
      area: incidente.area ?? '',
      turno: incidente.turno ?? '',
      equipo: incidente.equipo_involucrado ?? '',
      causa_inmediata: incidente.causa_inmediata ?? '',
      causa_raiz: incidente.causa_raiz ?? '',
      lecciones_aprendidas: incidente.lecciones_aprendidas ?? '',
      acciones_inmediatas: incidente.acciones_inmediatas ?? '',
      observaciones_internas: incidente.observaciones_internas ?? '',
      motivo_cierre: incidente.motivo_cierre ?? '',
    });
  }, [incidente]);

  const update = (k: keyof typeof form, v: string) => { setForm(f => ({ ...f, [k]: v })); setHasChanges(true); };

  const breadcrumbs = [
    { title: 'Dashboard', href: PATH_DASHBOARD.default },
    { title: 'Operador', href: PATH_OPERADOR.dashboard },
    { title: 'Gestión de Incidentes', href: PATH_OPERADOR.gestionIncidentes },
    { title: incidente?.codigo ?? '…', href: '#' },
    { title: 'Editar', href: '#' },
  ].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

  const handleSave = async () => {
    if (!incidente) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload: UpdateIncidentePayload = {
        titulo: form.titulo,
        descripcion: form.descripcion || undefined,
        severidad: SEV_OPTIONS[sev - 1].label,
        estado,
        fecha_ocurrencia: form.fecha || undefined,
        hora_ocurrencia: form.hora || undefined,
        turno: form.turno || undefined,
        equipo_involucrado: form.equipo || undefined,
        causa_inmediata: form.causa_inmediata || undefined,
        causa_raiz: form.causa_raiz || undefined,
        lecciones_aprendidas: form.lecciones_aprendidas || undefined,
        acciones_inmediatas: form.acciones_inmediatas || undefined,
        observaciones_internas: form.observaciones_internas || undefined,
        motivo_cierre: estado === 'Cerrado' ? form.motivo_cierre || undefined : undefined,
      };
      await incidentesService.update(incidente.id, payload);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <>
      <PageHeader title="Editar Incidente" breadcrumbItems={breadcrumbs} />
      <Group justify="center" mt="xl"><Loader /></Group>
    </>
  );

  if (error || !incidente) return (
    <>
      <PageHeader title="Editar Incidente" breadcrumbItems={breadcrumbs} />
      <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
        <Text c="red">{error?.message ?? 'Incidente no encontrado. Verifica el ID en la URL.'}</Text>
        <Button size="xs" mt="md" variant="default" component="a" href={PATH_OPERADOR.gestionIncidentes}>← Volver</Button>
      </Surface>
    </>
  );

  if (saved) return (
    <>
      <title>Cambios Guardados | Operador</title>
      <PageHeader title="Editar Incidente" breadcrumbItems={breadcrumbs} />
      <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
        <Box style={{ width: 44, height: 44, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        </Box>
        <Title order={4} mb={6}>Cambios guardados</Title>
        <Text size="sm" c="dimmed" mb="lg">Los cambios en {incidente.codigo} quedaron registrados.</Text>
        <Group justify="center" gap="sm">
          <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.gestionIncidentes}>Volver a incidentes</Button>
        </Group>
      </Surface>
    </>
  );

  const sevLabel = SEV_OPTIONS[sev - 1]?.label ?? 'Leve';
  const sevColor = SEV_OPTIONS[sev - 1]?.color ?? 'green';

  return (
    <>
      <title>Editar Incidente | Operador</title>
      <PageHeader
        title="Editar Incidente"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="xs">
            <Text size="xs" c="dimmed">{incidente.codigo}</Text>
            <Badge color={sevColor as any} variant="light" size="sm">{sevLabel}</Badge>
            <Badge color={ESTADO_COLOR[estado]} variant="light" size="sm">{estado}</Badge>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {hasChanges && (
          <Box p="sm" style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8 }}>
            <Text size="xs" c="yellow">Tienes cambios sin guardar.</Text>
          </Box>
        )}
        {saveError && (
          <Box p="sm" style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8 }}>
            <Text size="xs" c="red">{saveError}</Text>
          </Box>
        )}

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="ocurrencia">Ocurrencia</Tabs.Tab>
            <Tabs.Tab value="analisis">Análisis</Tabs.Tab>
            <Tabs.Tab value="acciones">Acciones</Tabs.Tab>
            <Tabs.Tab value="estado">Estado</Tabs.Tab>
          </Tabs.List>

          {/* Ocurrencia */}
          <Tabs.Panel value="ocurrencia" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Datos del evento</Text>
                <TextInput label="Título del incidente *" value={form.titulo} onChange={e => update('titulo', e.target.value)} mb="sm" />
                <Textarea label="Descripción detallada" value={form.descripcion} onChange={e => update('descripcion', e.target.value)} minRows={3} mb="sm" />
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <TextInput label="Fecha del incidente *" type="date" value={form.fecha} onChange={e => update('fecha', e.target.value)} />
                  <TextInput label="Hora exacta" type="time" value={form.hora} onChange={e => update('hora', e.target.value)} />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <Select label="Área operacional *" value={form.area} onChange={v => update('area', v || '')}
                    data={['Muelle / Operaciones de buque','Patio de contenedores','Gate / Portería','Taller y equipos','Seguridad ISPS / BASC','Carga peligrosa IMDG','Sistemas TOS / IT']} />
                  <Select label="Turno" value={form.turno} onChange={v => update('turno', v || '')}
                    data={['Turno día (06:00–18:00)','Turno noche (18:00–06:00)']} />
                  <Select label="Equipo involucrado" value={form.equipo} onChange={v => update('equipo', v || '')}
                    data={['Ninguno / N/A','Grúa STS','RTG','Reach stacker','Sistema TOS','Otro equipo']} clearable />
                </SimpleGrid>
              </Surface>
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Nivel de severidad *</Text>
                <SimpleGrid cols={{ base: 2, sm: 4 }}>
                  {SEV_OPTIONS.map((s) => (
                    <Box key={s.id} onClick={() => { setSev(s.id); setHasChanges(true); }}
                      style={{ border: `${sev === s.id ? `2px solid var(--mantine-color-${s.color}-6)` : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '10px 8px', textAlign: 'center', cursor: 'pointer', background: sev === s.id ? `var(--mantine-color-${s.color}-0)` : 'transparent' }}>
                      <Text size="xs" fw={500} c={s.color as any}>{s.label}</Text>
                      <Text size="xs" c="dimmed">{s.sub}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* Análisis */}
          <Tabs.Panel value="analisis" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Causa raíz</Text>
                <Select label="Metodología" data={['5 Porqués','Diagrama Ishikawa','Árbol de fallas (FTA)','Análisis simplificado']} defaultValue="5 Porqués" mb="sm" onChange={() => setHasChanges(true)} />
                <Textarea label="Causa inmediata" value={form.causa_inmediata} onChange={e => update('causa_inmediata', e.target.value)} minRows={2} mb="sm" />
                <Textarea label="Causa raíz" value={form.causa_raiz} onChange={e => update('causa_raiz', e.target.value)} minRows={2} mb="sm" />
                <Text size="xs" c="dimmed" mb="xs">Factores contribuyentes</Text>
                <Stack gap={4}>{FACTORES.map(f => <Box key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '3px 0' }}><input type="checkbox" onChange={() => setHasChanges(true)} /><Text size="xs">{f}</Text></Box>)}</Stack>
              </Surface>
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Lecciones aprendidas</Text>
                <Textarea value={form.lecciones_aprendidas} onChange={e => update('lecciones_aprendidas', e.target.value)} minRows={3} />
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* Acciones */}
          <Tabs.Panel value="acciones" pt="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Acciones inmediatas tomadas</Text>
              <Textarea value={form.acciones_inmediatas} onChange={e => update('acciones_inmediatas', e.target.value)} minRows={3} />
            </Surface>
          </Tabs.Panel>

          {/* Estado */}
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
                  <Textarea label="Motivo de cierre *" placeholder="Describe cómo se resolvió el incidente..." value={form.motivo_cierre} onChange={e => update('motivo_cierre', e.target.value)} minRows={3} mb="sm" />
                )}
                <Textarea label="Observaciones internas" value={form.observaciones_internas} onChange={e => update('observaciones_internas', e.target.value)} minRows={2} />
              </Surface>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Footer */}
        <Surface p="sm">
          <Group justify="space-between">
            <Group gap="sm">
              <Text size="xs" c="dimmed">{incidente.codigo}</Text>
              {hasChanges && <Badge color="yellow" variant="light" size="xs">Cambios sin guardar</Badge>}
            </Group>
            <Group gap="sm">
              <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.gestionIncidentes}>Cancelar</Button>
              <Button size="xs" onClick={handleSave} loading={saving} disabled={!hasChanges}>Guardar cambios</Button>
            </Group>
          </Group>
        </Surface>
      </Stack>
    </>
  );
}
