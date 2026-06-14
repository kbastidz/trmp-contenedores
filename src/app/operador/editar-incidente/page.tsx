'use client';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Anchor, Badge, Box, Button, Checkbox, Group, Loader,
  Select, SimpleGrid, Stack, Tabs, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';
import { useIncidente } from '@/lib/hooks/useApi';
import { incidentesService, areasService, equiposService } from '@/lib/trm';
import { TERMINAL_ID } from '@/lib/constants';
import type { EstadoIncidente, SeveridadIncidente, UpdateIncidentePayload, AreaDto, EquipoDto } from '@/types/trm';

const SEV_OPTIONS: { id: number; label: SeveridadIncidente; sub: string; color: string }[] = [
  { id: 1, label: 'Leve',     sub: 'Sin lesiones',          color: 'green'  },
  { id: 2, label: 'Moderado', sub: 'Primeros auxilios',     color: 'yellow' },
  { id: 3, label: 'Grave',    sub: 'Lesión con baja',       color: 'orange' },
  { id: 4, label: 'Crítico',  sub: 'Fatalidad / emergencia', color: 'red'   },
];

const ESTADOS: EstadoIncidente[] = ['Abierto', 'En análisis', 'Con plan', 'Cerrado'];
const ESTADO_COLOR: Record<EstadoIncidente, string> = { Abierto: 'red', 'En análisis': 'yellow', 'Con plan': 'blue', Cerrado: 'green' };

const FACTORES = [
  'Fallo de equipo / maquinaria', 'Error humano / falta de atención',
  'Falta de capacitación', 'Procedimiento no seguido',
  'Condiciones climáticas adversas', 'Fatiga del operador',
  'Comunicación deficiente', 'Herramientas / EPP inadecuados',
];

export default function EditarIncidente() {
  const params = useSearchParams();
  const id = params.get('id');

  const { data: incidente, loading, error } = useIncidente(id);
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [equipos, setEquipos] = useState<EquipoDto[]>([]);

  const [activeTab, setActiveTab] = useState<string | null>('ocurrencia');
  const [sev, setSev] = useState(1);
  const [estado, setEstado] = useState<EstadoIncidente>('Abierto');
  const [factores, setFactores] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState({
    titulo: '', descripcion: '', fecha: '', hora: '',
    area_id: '', turno: '', equipo_id: '',
    causa_inmediata: '', causa_raiz: '',
    lecciones_aprendidas: '', acciones_inmediatas: '',
    observaciones_internas: '', motivo_cierre: '',
  });

  // Cargar áreas y equipos
  useEffect(() => {
    areasService.list(TERMINAL_ID)
      .then(setAreas)
      .catch(err => console.error('[EditarIncidente] Error cargando áreas:', err));
    equiposService.list(TERMINAL_ID)
      .then(setEquipos)
      .catch(err => console.error('[EditarIncidente] Error cargando equipos:', err));
  }, []);

  // Poblar form cuando llega el incidente
  useEffect(() => {
    if (!incidente) return;
    const sevIdx = SEV_OPTIONS.findIndex(s => s.label === incidente.severidad);
    setSev(sevIdx >= 0 ? sevIdx + 1 : 1);
    setEstado(incidente.estado);
    // Parsear factores_contribuyentes desde JSON string
    try {
      const parsed = incidente.factores_contribuyentes
        ? JSON.parse(incidente.factores_contribuyentes)
        : [];
      setFactores(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFactores([]);
    }
    setForm({
      titulo: incidente.titulo ?? '',
      descripcion: incidente.descripcion ?? '',
      fecha: incidente.fecha_ocurrencia?.split('T')[0] ?? '',
      hora: incidente.hora_ocurrencia ?? '',
      area_id: incidente.area_id ?? '',
      turno: incidente.turno ?? '',
      equipo_id: '',   // se resuelve abajo cuando equipos ya cargó
      causa_inmediata: incidente.causa_inmediata ?? '',
      causa_raiz: incidente.causa_raiz ?? '',
      lecciones_aprendidas: incidente.lecciones_aprendidas ?? '',
      acciones_inmediatas: incidente.acciones_inmediatas ?? '',
      observaciones_internas: incidente.observaciones_internas ?? '',
      motivo_cierre: incidente.motivo_cierre ?? '',
    });
  }, [incidente]);

  // Resolver equipo_id cuando equipos y el incidente ya están disponibles
  useEffect(() => {
    if (!incidente || equipos.length === 0) return;
    // Buscar por id directo o por nombre si el backend devuelve el nombre en equipo_involucrado
    const match = equipos.find(
      e => e.id === (incidente as any).equipo_id || e.nombre === incidente.equipo_involucrado
    );
    if (match) setForm(f => ({ ...f, equipo_id: match.id }));
  }, [incidente, equipos]);

  const update = (k: keyof typeof form, v: string) => { setForm(f => ({ ...f, [k]: v })); setHasChanges(true); };
  const toggleFactor = (f: string) => { setFactores(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]); setHasChanges(true); };

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
        area_id: form.area_id || undefined,
        equipo_id: form.equipo_id || undefined,
        turno: form.turno || undefined,
        causa_inmediata: form.causa_inmediata || undefined,
        causa_raiz: form.causa_raiz || undefined,
        factores_contribuyentes: factores.length > 0 ? JSON.stringify(factores) : undefined,
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
        <Button size="xs" mt="md" variant="default" component={Link} href={PATH_OPERADOR.gestionIncidentes}>← Volver</Button>
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
          <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.gestionIncidentes}>Volver a incidentes</Button>
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
                  <Select label="Área operacional *" value={form.area_id} onChange={v => update('area_id', v || '')}
                    data={areas.map(a => ({ value: a.id, label: a.nombre }))} placeholder="Seleccionar..." />
                  <Select label="Turno" value={form.turno} onChange={v => update('turno', v || '')}
                    data={['Turno día (06:00–18:00)','Turno noche (18:00–06:00)']} clearable />
                  <Select label="Equipo involucrado" value={form.equipo_id} onChange={v => update('equipo_id', v || '')}
                    data={equipos.map(e => ({ value: e.id, label: e.nombre }))} placeholder="Ninguno / N/A" clearable />
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
                <Stack gap={4}>{FACTORES.map(f => <Checkbox key={f} label={f} size="xs" checked={factores.includes(f)} onChange={() => toggleFactor(f)} />)}</Stack>
              </Surface>
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Lecciones aprendidas</Text>
                <Textarea value={form.lecciones_aprendidas} onChange={e => update('lecciones_aprendidas', e.target.value)} minRows={3} placeholder="¿Qué aprendizaje deja este incidente?" />
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
              <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.gestionIncidentes}>Cancelar</Button>
              <Button size="xs" onClick={handleSave} loading={saving} disabled={!hasChanges}>Guardar cambios</Button>
            </Group>
          </Group>
        </Surface>
      </Stack>
    </>
  );
}
