'use client';
import Link from 'next/link';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Anchor, Badge, Box, Button, Group, Loader, Progress,
  Select, SimpleGrid, Stack, Tabs, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';
import { usePlan, useRiesgos, useAreas } from '@/lib/hooks/useApi';
import { planesService, tareasPlanService } from '@/lib/trm';
import { usersService } from '@/lib/auth';
import { TERMINAL_ID } from '@/lib/constants';
import type { EstadoPlan, UpdatePlanPayload, TareaDto, UpdateTareaPayload } from '@/types/trm';
import type { UserListItem } from '@/lib/auth';

const ESTADOS: EstadoPlan[] = ['Pendiente', 'En progreso', 'Completado', 'Vencido', 'Cancelado'];

const ESTADO_STYLE: Record<EstadoPlan, { border: string; bg: string; color: string }> = {
  Pendiente:     { border: '#5F5E5A', bg: 'var(--mantine-color-default-hover)', color: 'var(--mantine-color-text)' },
  'En progreso': { border: '#185FA5', bg: '#E6F1FB',  color: '#185FA5' },
  Completado:    { border: '#3B6D11', bg: '#EAF3DE',  color: '#3B6D11' },
  Vencido:       { border: '#A32D2D', bg: '#FCEBEB',  color: '#A32D2D' },
  Cancelado:     { border: '#5F5E5A', bg: 'var(--mantine-color-default-hover)', color: 'var(--mantine-color-dimmed)' },
};

const ESTADO_BADGE: Record<EstadoPlan, string> = {
  Pendiente: 'gray', 'En progreso': 'blue', Completado: 'green', Vencido: 'red', Cancelado: 'dark',
};

const TIPO_CONTROL = ['Preventivo', 'Detectivo', 'Correctivo', 'Mitigante', 'Transferencia', 'Aceptación'];

export default function EditarPlan() {
  const params = useSearchParams();
  const id = params.get('id');
  const { data: plan, loading, error } = usePlan(id);
  const { data: riesgos } = useRiesgos(TERMINAL_ID);
  const { data: areas } = useAreas(TERMINAL_ID);
  const [users, setUsers] = useState<UserListItem[]>([]);

  // Nombre del riesgo vinculado: usa riesgo_nombre si el backend lo popula, si no busca por riesgo_id
  const riesgoNombre = plan?.riesgo_nombre
    ?? riesgos.find(r => r.id === plan?.riesgo_id)?.nombre
    ?? plan?.riesgo_id
    ?? '—';

  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [estado, setEstado] = useState<EstadoPlan>('En progreso');
  const [progreso, setProgreso] = useState(45);
  const [tareas, setTareas] = useState<TareaDto[]>([]);
  const [tareasLoading, setTareasLoading] = useState(false);
  const [nota_avance, setNotaAvance] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState({
    titulo: '', descripcion: '', objetivo: '', tipo_control: 'Preventivo',
    estrategia: 'Reducir probabilidad e impacto', norma: 'ISO 45001',
    indicador: '', fecha_inicio: '', fecha_limite: '', frecuencia: 'Semanal',
    fecha_revision: '', responsable_id: '', aprobador_id: '', area_id: '',
    nivel_aprobacion: 'Gerencia de Operaciones', presupuesto: 'Significativo ($10K–$50K)',
    fuente: 'Presupuesto de mantenimiento', prioridad: 'Inmediata (24–48h)',
    recursos_adicionales: '', observaciones: '', justificacion: '', evidencia_cierre: '',
  });

  const update = (k: keyof typeof form, v: string) => { setForm(f => ({ ...f, [k]: v })); setHasChanges(true); };

  useEffect(() => {
    usersService.list()
      .then(setUsers)
      .catch(err => console.error('[EditarPlan] Error cargando usuarios:', err));
  }, []);

  useEffect(() => {
    if (!plan) return;
    setEstado(plan.estado);
    setProgreso(plan.progreso);
    // Cargar tareas del plan
    setTareasLoading(true);
    tareasPlanService.list(plan.id)
      .then(setTareas)
      .catch(err => console.error('[EditarPlan] Error cargando tareas:', err))
      .finally(() => setTareasLoading(false));    setForm(f => ({
      ...f,
      titulo:         plan.titulo ?? '',
      descripcion:    plan.descripcion ?? '',
      objetivo:       plan.objetivo ?? '',
      tipo_control:   plan.tipo_control ?? 'Preventivo',
      estrategia:     plan.estrategia ?? '',
      norma:          plan.norma ?? '',
      indicador:      plan.indicador ?? '',
      fecha_inicio:   plan.fecha_inicio?.split('T')[0] ?? '',
      fecha_limite:   plan.fecha_limite?.split('T')[0] ?? '',
      fecha_revision: plan.fecha_revision?.split('T')[0] ?? '',
      observaciones:  plan.observaciones ?? '',
      responsable_id: plan.responsable_id ?? '',
      aprobador_id:   plan.aprobador ?? '',
      area_id:        plan.area_id ?? '',
    }));
  }, [plan]);

  const fechaVencida = useMemo(() => {
    if (!form.fecha_limite) return false;
    return form.fecha_limite < new Date().toISOString().split('T')[0];
  }, [form.fecha_limite]);

  const tareasCompletadas = tareas.filter(t => t.estado === 'Completada').length;

  const progresoColor = progreso >= 80 ? '#3B6D11' : progreso >= 40 ? '#378ADD' : '#E24B4A';

  const updateTarea = async (tarea: TareaDto, k: keyof UpdateTareaPayload, v: string) => {
    if (!plan) return;
    setTareas(prev => prev.map(t => t.id === tarea.id ? { ...t, [k]: v } : t));
    setHasChanges(true);
    try {
      await tareasPlanService.update(plan.id, tarea.id, { [k]: v });
    } catch (err) {
      console.error('[EditarPlan] Error actualizando tarea:', err);
    }
  };

  const toggleTarea = async (tarea: TareaDto) => {
    if (!plan) return;
    const nuevoEstado = tarea.estado === 'Completada' ? 'Pendiente' : 'Completada';
    setTareas(prev => prev.map(t => t.id === tarea.id ? { ...t, estado: nuevoEstado } : t));
    setHasChanges(true);
    try {
      await tareasPlanService.update(plan.id, tarea.id, { estado: nuevoEstado });
    } catch (err) {
      console.error('[EditarPlan] Error actualizando tarea:', err);
    }
  };

  const deleteTarea = async (tarea: TareaDto) => {
    if (!plan) return;
    setTareas(prev => prev.filter(t => t.id !== tarea.id));
    setHasChanges(true);
    try {
      await tareasPlanService.delete(plan.id, tarea.id);
    } catch (err) {
      console.error('[EditarPlan] Error eliminando tarea:', err);
    }
  };

  const addTarea = async () => {
    if (!plan) return;
    try {
      const nueva = await tareasPlanService.create(plan.id, {
        descripcion: '',
        estado: 'Pendiente',
        orden: tareas.length,
      });
      setTareas(prev => [...prev, nueva]);
      setHasChanges(true);
    } catch (err) {
      console.error('[EditarPlan] Error creando tarea:', err);
    }
  };

  const breadcrumbs = [
    { title: 'Dashboard',            href: PATH_DASHBOARD.default },
    { title: 'Operador',             href: PATH_OPERADOR.dashboard },
    { title: 'Seguimiento de Planes', href: PATH_OPERADOR.seguimientoPlanes },
    { title: plan?.codigo ?? '…',    href: '#' },
    { title: 'Editar',               href: '#' },
  ].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload: UpdatePlanPayload = {
        titulo:               form.titulo,
        descripcion:          form.descripcion || undefined,
        objetivo:             form.objetivo || undefined,
        estado,
        progreso,
        tipo_control:         form.tipo_control || undefined,
        estrategia:           form.estrategia || undefined,
        indicador:            form.indicador || undefined,
        fecha_inicio:         form.fecha_inicio || undefined,
        fecha_limite:         form.fecha_limite || undefined,
        fecha_revision:       form.fecha_revision || undefined,
        observaciones:        form.observaciones || undefined,
        area_id:              form.area_id || undefined,
        aprobador:            form.aprobador_id || undefined,
        norma:                form.norma || undefined,
        responsable:          form.responsable_id || undefined,
        presupuesto:          form.presupuesto || undefined,
        fuente_financiamiento: form.fuente || undefined,
        prioridad:            form.prioridad || undefined,
        recursos_adicionales: form.recursos_adicionales || undefined,
        justificacion_cambio: form.justificacion || undefined,
        evidencia_cierre:     form.evidencia_cierre || undefined,
      };
      await planesService.update(plan.id, payload);

      // Registrar avance en historial si cambió progreso, estado o hay nota
      const progresoChanged = progreso !== plan.progreso;
      const estadoChanged = estado !== plan.estado;
      if (progresoChanged || estadoChanged || nota_avance.trim()) {
        await planesService.registrarAvance(plan.id, {
          progreso_nuevo: progreso,
          estado_nuevo: estado,
          nota: nota_avance.trim() || undefined,
        });
      }

      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <>
      <PageHeader title="Editar Plan" breadcrumbItems={breadcrumbs} />
      <Group justify="center" mt="xl"><Loader /></Group>
    </>
  );

  if (error || !plan) return (
    <>
      <PageHeader title="Editar Plan" breadcrumbItems={breadcrumbs} />
      <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
        <Text c="red">{error?.message ?? 'Plan no encontrado. Verifica el ID en la URL.'}</Text>
        <Button size="xs" mt="md" variant="default" component={Link} href={PATH_OPERADOR.seguimientoPlanes}>← Volver</Button>
      </Surface>
    </>
  );

  if (saved) return (
    <>
      <title>Plan Actualizado | Operador</title>
      <PageHeader title="Editar Plan" breadcrumbItems={breadcrumbs} />
      <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
        <Box style={{ width: 44, height: 44, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        </Box>
        <Title order={4} mb={6}>Plan actualizado correctamente</Title>
        <Text size="sm" c="dimmed" mb="lg">Los cambios en {plan.codigo} quedaron registrados en el log de auditoría. El tablero Kanban se actualizó.</Text>
        <Group justify="center" gap="sm">
          <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.seguimientoPlanes}>Ver tablero Kanban</Button>
          {plan.riesgo_id && (
            <Button size="xs" component={Link} href={`${PATH_OPERADOR.detalleRiesgo}?id=${plan.riesgo_id}`}>Ver riesgo vinculado</Button>
          )}
        </Group>
      </Surface>
    </>
  );

  return (
    <>
      <title>Editar Plan | Operador</title>
      <PageHeader
        title="Editar Plan de Mitigación"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">{plan.codigo}</Text>
            <Badge color={ESTADO_BADGE[estado]} variant="light" size="sm">{estado}</Badge>
            {plan.riesgo_id && <Badge color="red" variant="light" size="xs">Riesgo vinculado</Badge>}
            <Text size="xs" c="dimmed">Editando</Text>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Alerta cambios sin guardar */}
        {hasChanges && (
          <Box p="sm" style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <Text size="xs" c="yellow.9">Tienes cambios sin guardar.</Text>
          </Box>
        )}

        {/* Info auditoría */}
        <Box p="sm" style={{ background: '#E6F1FB', border: '0.5px solid #B5D4F4', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <Text size="xs" c="blue.8">Los cambios quedarán registrados en el log de auditoría. Actualizar el avance también actualizará la tarjeta en el tablero Kanban.</Text>
        </Box>

        {saveError && (
          <Box p="sm" style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8 }}>
            <Text size="xs" c="red">{saveError}</Text>
          </Box>
        )}

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="general">General</Tabs.Tab>
            <Tabs.Tab value="avance">Avance y tareas</Tabs.Tab>
            <Tabs.Tab value="recursos">Recursos</Tabs.Tab>
            <Tabs.Tab value="estado">Estado</Tabs.Tab>
          </Tabs.List>

          {/* ── GENERAL ── */}
          <Tabs.Panel value="general" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Información del plan</Text>
                <TextInput label="Título del plan *" value={form.titulo} onChange={e => update('titulo', e.target.value)} mb="sm" />
                <Textarea label="Descripción" value={form.descripcion} onChange={e => update('descripcion', e.target.value)} minRows={2} mb="sm" />
                <Textarea label="Objetivo del plan" value={form.objetivo} onChange={e => update('objetivo', e.target.value)} minRows={3} mb="sm" />
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <TextInput label="Riesgo vinculado" value={riesgoNombre} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  <Select label="Tipo de control *" value={form.tipo_control} onChange={v => update('tipo_control', v || '')}
                    data={TIPO_CONTROL} />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <Select label="Estrategia de reducción" value={form.estrategia} onChange={v => update('estrategia', v || '')}
                    data={['Reducir probabilidad e impacto', 'Reducir probabilidad', 'Reducir impacto', 'Eliminar el riesgo']} />
                  <Select label="Normativa de referencia" value={form.norma} onChange={v => update('norma', v || '')}
                    data={['ISO 45001', 'ISO 31000', 'Código ISPS', 'IMDG', 'BASC']} />
                </SimpleGrid>
                <Textarea label="Indicador de éxito" value={form.indicador} onChange={e => update('indicador', e.target.value)} minRows={2} />
              </Surface>

              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Cronograma</Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }} mb="sm">
                  <TextInput label="Fecha de inicio" type="date" value={form.fecha_inicio} onChange={e => update('fecha_inicio', e.target.value)} />
                  <Box>
                    <TextInput label={<Group gap={4}><span>Fecha límite *</span>{fechaVencida && <Badge color="red" size="xs">Vencida</Badge>}</Group>}
                      type="date" value={form.fecha_limite} onChange={e => update('fecha_limite', e.target.value)}
                      styles={fechaVencida ? { input: { borderColor: '#E24B4A' } } : {}} />
                  </Box>
                  
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 3 }} mb="sm">
                  <Select label="Frecuencia de seguimiento" value={form.frecuencia} onChange={v => update('frecuencia', v || '')}
                    data={['Diaria', 'Semanal', 'Quincenal', 'Mensual']} />
                <TextInput label="Fecha de revisión de efectividad" type="date" value={form.fecha_revision} onChange={e => update('fecha_revision', e.target.value)} />
                {fechaVencida && (
                  <Box mt="sm" p="sm" style={{ background: '#FCEBEB', borderRadius: 8 }}>
                    <Text size="xs" c="red">⚠ La fecha límite ya venció. Si vas a extenderla, justifícalo en la pestaña Estado.</Text>
                  </Box>
                )}
                </SimpleGrid>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── AVANCE Y TAREAS ── */}
          <Tabs.Panel value="avance" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={500} size="sm">Avance general del plan</Text>
                  <Text fw={500} size="sm" style={{ color: progresoColor }}>{progreso}%</Text>
                </Group>
                <Progress value={progreso} size="md" mb="xs" color={progreso >= 80 ? 'green' : progreso >= 40 ? 'blue' : 'red'} />
                <input type="range" min={0} max={100} value={progreso}
                  onChange={e => { setProgreso(Number(e.target.value)); setHasChanges(true); }}
                  style={{ width: '100%', margin: '4px 0' }} />
                <Group justify="space-between">
                  {[0, 25, 50, 75, 100].map(v => <Text key={v} size="xs" c="dimmed">{v}%</Text>)}
                </Group>
                <Box mt="sm" p="sm" style={{ background: 'var(--mantine-color-default-hover)', borderRadius: 8 }}>
                  <Text size="xs" c="dimmed" mb={4}>Nota de avance (se mostrará en el historial)</Text>
                  <Textarea value={nota_avance} onChange={e => { setNotaAvance(e.target.value); setHasChanges(true); }}
                    placeholder="Ej: RTG-01 y RTG-02 completados. RTG-03 en mantenimiento, finalización estimada 17/04."
                    minRows={2} />
                </Box>
              </Surface>

              <Surface p="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={500} size="sm">Tareas del plan</Text>
                  <Text size="xs" c="dimmed">{tareasCompletadas} de {tareas.length} completadas</Text>
                </Group>
                <Stack gap={6}>
                  {tareasLoading ? (
                    <Group justify="center" p="md"><Loader size="sm" /></Group>
                  ) : (
                    tareas.map((t) => (
                      <Box key={t.id} p="sm" style={{ border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 8, position: 'relative', opacity: t.estado === 'Completada' ? 0.7 : 1 }}>
                        <Button size="xs" variant="subtle" color="red" style={{ position: 'absolute', top: 4, right: 4, padding: '2px 6px', fontSize: 10 }}
                          onClick={() => deleteTarea(t)}>✕</Button>
                        <Group gap="sm" mb="xs" align="center">
                          <input type="checkbox" checked={t.estado === 'Completada'} onChange={() => toggleTarea(t)} style={{ width: 'auto', margin: 0 }} />
                          <TextInput value={t.descripcion} onChange={e => updateTarea(t, 'descripcion', e.target.value)}
                            placeholder="Descripción de la tarea" size="xs" style={{ flex: 1 }}
                            styles={t.estado === 'Completada' ? { input: { textDecoration: 'line-through', color: 'var(--mantine-color-dimmed)' } } : {}} />
                        </Group>
                        <SimpleGrid cols={{ base: 1, sm: 3 }}>
                          <Select
                            label="Responsable"
                            size="xs"
                            value={t.responsable ?? ''}
                            onChange={v => updateTarea(t, 'responsable', v || '')}
                            data={users.map(u => ({ value: u.id, label: u.name }))}
                            placeholder="Seleccionar..."
                            clearable
                          />
                          <TextInput label="Fecha límite" size="xs" type="date" value={t.fecha_limite ?? ''} onChange={e => updateTarea(t, 'fecha_limite', e.target.value)} />
                          <Select label="Estado" size="xs" value={t.estado} onChange={v => updateTarea(t, 'estado', v || 'Pendiente')}
                            data={['Pendiente', 'En ejecución', 'Completada']} />
                        </SimpleGrid>
                      </Box>
                    ))
                  )}
                </Stack>
                <Button size="xs" variant="default" mt="sm" onClick={addTarea}>+ Agregar tarea</Button>
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── RECURSOS ── */}
          <Tabs.Panel value="recursos" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Responsables</Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <Select
                    label="Responsable del plan *"
                    value={form.responsable_id}
                    onChange={v => update('responsable_id', v || '')}
                    data={users.map(u => ({ value: u.id, label: u.name }))}
                    placeholder="Seleccionar..."
                    clearable
                  />
                  <Select
                    label="Aprobador"
                    value={form.aprobador_id}
                    onChange={v => update('aprobador_id', v || '')}
                    data={users.map(u => ({ value: u.id, label: u.name }))}
                    placeholder="Seleccionar..."
                    clearable
                  />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Select label="Área responsable" value={form.area_id} onChange={v => update('area_id', v || '')}
                    data={areas.map(a => ({ value: a.id, label: a.nombre }))} placeholder="Seleccionar..." />
                </SimpleGrid>
              </Surface>
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Presupuesto y recursos</Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }} mb="sm">
                  <Select label="Presupuesto estimado" value={form.presupuesto} onChange={v => update('presupuesto', v || '')}
                    data={['Sin costo', 'Menor ($0–$1,000)', 'Moderado ($1K–$10K)', 'Significativo ($10K–$50K)', 'Mayor (más de $50K)']} />
                  <Select label="Fuente de financiamiento" value={form.fuente} onChange={v => update('fuente', v || '')}
                    data={['Presupuesto de mantenimiento', 'Presupuesto operativo', 'Fondo de emergencia', 'CAPEX', 'Seguro / tercero']} />
                  <Select label="Prioridad" value={form.prioridad} onChange={v => update('prioridad', v || '')}
                    data={['Inmediata (24–48h)', 'Alta (esta semana)', 'Media (este mes)', 'Baja (próximo trimestre)']} />
                </SimpleGrid>
                <Textarea label="Recursos adicionales necesarios" value={form.recursos_adicionales} onChange={e => update('recursos_adicionales', e.target.value)} minRows={2} />
              </Surface>
            </Stack>
          </Tabs.Panel>

          {/* ── ESTADO ── */}
          <Tabs.Panel value="estado" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Estado del plan</Text>
                <SimpleGrid cols={{ base: 2, sm: 5 }} mb="md">
                  {ESTADOS.map(e => {
                    const s = ESTADO_STYLE[e];
                    const sel = estado === e;
                    return (
                      <Box key={e} onClick={() => { setEstado(e); setHasChanges(true); }}
                        style={{ border: `${sel ? `2px solid ${s.border}` : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '8px 4px', textAlign: 'center', cursor: 'pointer', background: sel ? s.bg : 'transparent' }}>
                        <Text size="xs" fw={sel ? 500 : 400} style={{ color: sel ? s.color : 'var(--mantine-color-dimmed)' }}>{e}</Text>
                      </Box>
                    );
                  })}
                </SimpleGrid>

                {(estado === 'Vencido' || estado === 'Cancelado') && (
                  <Textarea label="Justificación del cambio de estado *" value={form.justificacion}
                    onChange={e => update('justificacion', e.target.value)}
                    placeholder="Explica el motivo del cambio de estado..." minRows={3} mb="sm" />
                )}
                {estado === 'Completado' && (
                  <Textarea label="Evidencia de cierre" value={form.evidencia_cierre}
                    onChange={e => update('evidencia_cierre', e.target.value)}
                    placeholder="Describe las evidencias que demuestran que el plan fue completado exitosamente..." minRows={3} mb="sm" />
                )}
                <Textarea label="Observaciones del responsable" value={form.observaciones}
                  onChange={e => update('observaciones', e.target.value)} minRows={3} />
              </Surface>

              {/* Vista previa de cambios */}
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Vista previa de cambios</Text>
                {!hasChanges ? (
                  <Text size="xs" c="dimmed" fs="italic">Sin cambios registrados aún.</Text>
                ) : (
                  <Stack gap={0}>
                    {[
                      { k: 'Título',   v: form.titulo || '—' },
                      { k: 'Estado',   v: estado },
                      { k: 'Avance',   v: `${progreso}%` },
                      { k: 'Fecha límite', v: form.fecha_limite || '—' },
                    ].map(({ k, v }) => (
                      <Group key={k} gap="md" style={{ padding: '4px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Text size="xs" c="dimmed" style={{ minWidth: 120 }}>{k}</Text>
                        <Text size="xs" fw={500} c="green">{v}</Text>
                      </Group>
                    ))}
                  </Stack>
                )}
              </Surface>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Footer */}
        <Surface p="sm">
          <Group justify="space-between" wrap="wrap">
            <Group gap="sm">
              <Text size="xs" c="dimmed">{plan.codigo}</Text>
              {plan.createdAt && <Text size="xs" c="dimmed">· Creado: {new Date(plan.createdAt).toLocaleDateString('es-PE')}</Text>}
              {hasChanges && <Badge color="yellow" variant="light" size="xs">Cambios sin guardar</Badge>}
            </Group>
            <Group gap="sm">
              <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.seguimientoPlanes}>Cancelar</Button>
              <Button size="xs" onClick={handleSave} loading={saving} disabled={!hasChanges}
                style={{ background: '#185FA5', color: 'white', borderColor: '#185FA5' }}>
                Guardar cambios
              </Button>
            </Group>
          </Group>
        </Surface>
      </Stack>
    </>
  );
}
