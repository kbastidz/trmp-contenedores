'use client';
import Link from 'next/link';

import { useState, useEffect } from 'react';
import {
  Anchor, Badge, Box, Button, Checkbox, Group, Loader,
  Select, SimpleGrid, Stack, Stepper, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';
import { planesService } from '@/lib/trm';
import { usersService } from '@/lib/auth';
import { useCurrentUser, useRiesgos, useAreas } from '@/lib/hooks/useApi';
import type { EstadoPlan } from '@/types/trm';
import type { UserListItem } from '@/lib/auth';
import { TERMINAL_ID } from '@/lib/constants';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Nuevo Plan de Mitigación', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const TIPO_CONTROL = [
  { id: 1, label: 'Preventivo',    sub: 'Evita que el riesgo ocurra',          color: 'green'  },
  { id: 2, label: 'Detectivo',     sub: 'Identifica si el riesgo ocurre',      color: 'blue'   },
  { id: 3, label: 'Correctivo',    sub: 'Reduce impacto después de ocurrir',   color: 'yellow' },
  { id: 4, label: 'Mitigante',     sub: 'Reduce la probabilidad',              color: 'orange' },
  { id: 5, label: 'Transferencia', sub: 'Seguro o tercero asume el riesgo',    color: 'violet' },
  { id: 6, label: 'Aceptación',    sub: 'Riesgo asumido con monitoreo',        color: 'gray'   },
];

export default function NuevoPlan() {
  const { user } = useCurrentUser();
  const { data: riesgos, loading: loadingRiesgos } = useRiesgos();
  const { data: areas } = useAreas(TERMINAL_ID);
  const [users, setUsers] = useState<UserListItem[]>([]);

  const [active, setActive] = useState(0);
  const [selRiesgoId, setSelRiesgoId] = useState<string | null>(null);
  const [selTipo, setSelTipo] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createdCodigo, setCreatedCodigo] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    titulo: '', objetivo: '', estrategia: '', nivelObj: '', norma: '',
    indicador: '', frecuencia: 'Mensual', responsable_id: '', area_id: '',
    aprobador_id: '', presupuesto: '', fuente: '', prioridad: '',
    recursos: '', inicio: '', cierre: '',
  });
  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    usersService.list()
      .then(setUsers)
      .catch(err => console.error('[NuevoPlan] Error cargando usuarios:', err));
  }, []);

  const filteredRiesgos = riesgos.filter(r =>
    r.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (r.area ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const selRiesgo = riesgos.find(r => r.id === selRiesgoId);

  const handleSubmit = async () => {
    if (!selRiesgoId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const codigo = `PLN-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      const result = await planesService.create({
        terminal_id: TERMINAL_ID,
        riesgo_id: selRiesgoId,
        responsable_id: form.responsable_id || user?.id || undefined,
        codigo,
        titulo: form.titulo,
        objetivo: form.objetivo || undefined,
        estado: 'Pendiente' as EstadoPlan,
        progreso: 0,
        fecha_inicio: form.inicio || undefined,
        fecha_limite: form.cierre,
        tipo_control: selTipo ? TIPO_CONTROL[selTipo - 1].label : undefined,
        estrategia: form.estrategia || undefined,
        indicador: form.indicador || undefined,
        area_id: form.area_id || undefined,
        aprobador: form.aprobador_id || undefined,
        norma: form.norma || undefined,
      });
      setCreatedCodigo(result.codigo);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al crear plan');
      setSaving(false);
    }
  };

  if (createdCodigo) {
    return (
      <>
        <title>Plan Creado | Operador</title>
        <PageHeader title="Nuevo Plan de Mitigación" breadcrumbItems={breadcrumbs} />
        <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
          <Box style={{ width: 48, height: 48, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </Box>
          <Title order={4} mb={6}>Plan de mitigación creado</Title>
          <Text size="sm" c="dimmed" mb={4}>ID asignado: <strong>{createdCodigo}</strong></Text>
          <Group justify="center" gap="sm" wrap="wrap" mt="lg">
            <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.seguimientoPlanes}>Tablero Kanban</Button>
            <Button size="xs" component={Link} href={PATH_OPERADOR.dashboard}>Dashboard</Button>
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
          <Stepper.Step label="Recursos" />
          <Stepper.Step label="Revisión" />
        </Stepper>

        {/* Paso 1 — Selección de riesgo */}
        {active === 0 && (
          <Surface p="md">
            <Text fw={500} size="sm" mb="sm">¿A qué riesgo vinculamos este plan? *</Text>
            <TextInput placeholder="Buscar riesgo por nombre o área..." mb="sm" value={search} onChange={e => setSearch(e.target.value)} />
            {loadingRiesgos ? (
              <Group justify="center" p="md"><Loader size="sm" /></Group>
            ) : (
              <Stack gap={6} style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
                {filteredRiesgos.map((r) => {
                  const score = r.probabilidad * r.impacto;
                  const color = score >= 17 ? 'red' : score >= 10 ? 'orange' : score >= 5 ? 'yellow' : 'green';
                  return (
                    <Box key={r.id} onClick={() => setSelRiesgoId(r.id)}
                      style={{ border: `${selRiesgoId === r.id ? '2px solid #185FA5' : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer', background: selRiesgoId === r.id ? '#E6F1FB' : 'transparent' }}>
                      <Group justify="space-between" wrap="nowrap">
                        <Box>
                          <Text size="sm" fw={500}>{r.nombre}</Text>
                          <Group gap="xs" mt={2}>
                            <Text size="xs" c="dimmed">{r.area ?? '—'}</Text>
                            <Badge color={color} variant="light" size="xs">{r.nivel} · {score}</Badge>
                            <Text size="xs" c="dimmed">· {r.estado}</Text>
                          </Group>
                        </Box>
                      </Group>
                    </Box>
                  );
                })}
                {filteredRiesgos.length === 0 && <Text size="xs" c="dimmed" ta="center">No se encontraron riesgos</Text>}
              </Stack>
            )}
          </Surface>
        )}

        {/* Paso 2 — Estrategia */}
        {active === 1 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Nombre y objetivo del plan</Text>
              <TextInput label="Título del plan *" placeholder="Ej: Instalación de sistema anti-colisión en RTG del patio norte" value={form.titulo} onChange={e => update('titulo', e.target.value)} mb="sm" />
              <Textarea label="Objetivo del plan" placeholder="¿Qué resultado espera lograr? ¿Cómo reducirá el riesgo?" value={form.objetivo} onChange={e => update('objetivo', e.target.value)} minRows={3} />
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Tipo de control *</Text>
              <SimpleGrid cols={{ base: 2, sm: 3 }}>
                {TIPO_CONTROL.map((t) => (
                  <Box key={t.id} onClick={() => setSelTipo(t.id)}
                    style={{ border: `${selTipo === t.id ? '2px solid #185FA5' : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '10px 8px', textAlign: 'center', cursor: 'pointer', background: selTipo === t.id ? '#E6F1FB' : 'transparent' }}>
                    <Badge color={t.color} variant="light" size="sm">{t.label}</Badge>
                    <Text size="xs" c="dimmed" mt={4}>{t.sub}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Alcance y cronograma</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                <Select label="Estrategia de reducción" data={['Reducir probabilidad','Reducir impacto','Reducir probabilidad e impacto','Eliminar el riesgo completamente']} value={form.estrategia} onChange={v => update('estrategia', v || '')} />
                <Select label="Normativa de referencia" data={['Ninguna específica','ISO 45001','ISO 31000','Código ISPS','IMDG','BASC']} value={form.norma} onChange={v => update('norma', v || '')} />
              </SimpleGrid>
              <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                <TextInput label="Fecha de inicio" type="date" value={form.inicio} onChange={e => update('inicio', e.target.value)} />
                <TextInput label="Fecha límite *" type="date" value={form.cierre} onChange={e => update('cierre', e.target.value)} />
              </SimpleGrid>
              <Textarea label="Indicador de éxito" placeholder="Ej: Reducir puntaje del riesgo de 20 a máximo 8." minRows={2} value={form.indicador} onChange={e => update('indicador', e.target.value)} />
            </Surface>
          </Stack>
        )}

        {/* Paso 3 — Recursos */}
        {active === 2 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Responsables</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select
                  label="Responsable del plan *"
                  placeholder="Seleccionar responsable..."
                  data={users.map(u => ({ value: u.id, label: u.name }))}
                  value={form.responsable_id || user?.id || ''}
                  onChange={v => update('responsable_id', v || '')}
                  clearable
                />
                <Select label="Área responsable" placeholder="Seleccionar área..." data={areas.map(a => ({ value: a.id, label: a.nombre }))} value={form.area_id} onChange={v => update('area_id', v || '')} clearable />
              </SimpleGrid>
              <Select
                label="Aprobador del plan"
                placeholder="Seleccionar aprobador..."
                data={users.map(u => ({ value: u.id, label: u.name }))}
                value={form.aprobador_id}
                onChange={v => update('aprobador_id', v || '')}
                clearable
                mt="sm"
              />
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Presupuesto y prioridad</Text>
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <Select label="Presupuesto estimado" data={['Sin costo','Menor ($0–$1,000)','Moderado ($1,000–$10,000)','Significativo ($10,000–$50,000)','Mayor (más de $50,000)']} value={form.presupuesto} onChange={v => update('presupuesto', v || '')} />
                <Select label="Fuente de financiamiento" data={['Presupuesto operativo','Presupuesto de mantenimiento','Fondo de emergencia','CAPEX','Seguro / tercero']} value={form.fuente} onChange={v => update('fuente', v || '')} />
                <Select label="Prioridad de ejecución *" data={['Inmediata (24–48h)','Alta (esta semana)','Media (este mes)','Baja (próximo trimestre)']} value={form.prioridad} onChange={v => update('prioridad', v || '')} />
              </SimpleGrid>
            </Surface>
          </Stack>
        )}

        {/* Paso 4 — Revisión */}
        {active === 3 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Resumen del plan</Text>
              <Stack gap={0}>
                {[
                  ['Riesgo vinculado', selRiesgo?.nombre ?? '—'],
                  ['Título del plan', form.titulo || '—'],
                  ['Tipo de control', selTipo ? TIPO_CONTROL[selTipo - 1].label : '—'],
                  ['Estrategia', form.estrategia || '—'],
                  ['Área responsable', areas.find(a => a.id === form.area_id)?.nombre || '—'],
                  ['Responsable', users.find(u => u.id === form.responsable_id)?.name || user?.name || '—'],
                  ['Aprobador', users.find(u => u.id === form.aprobador_id)?.name || '—'],
                  ['Normativa', form.norma || '—'],
                  ['Prioridad', form.prioridad || '—'],
                  ['Fecha de inicio', form.inicio || '—'],
                  ['Fecha límite', form.cierre || '—'],
                  ['Presupuesto', form.presupuesto || '—'],
                ].map(([k, v]) => (
                  <Group key={k} justify="space-between" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                    <Text size="xs" c="dimmed" style={{ minWidth: 180 }}>{k}</Text>
                    <Text size="xs" fw={500} ta="right">{v}</Text>
                  </Group>
                ))}
              </Stack>
            </Surface>
            {saveError && (
              <Box p="sm" style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8 }}>
                <Text size="xs" c="red">{saveError}</Text>
              </Box>
            )}
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
          <Text size="xs" c="dimmed">Paso {active + 1} de 4</Text>
          {active < 3
            ? <Button size="sm" onClick={() => setActive(a => a + 1)}>Siguiente →</Button>
            : <Button size="sm" disabled={!confirmed || saving} loading={saving} onClick={handleSubmit}>Crear plan</Button>
          }
        </Group>
      </Stack>
    </>
  );
}
