'use client';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Anchor, Badge, Box, Button, Group, Loader,
  Select, SimpleGrid, Stack, Tabs, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';
import { useRiesgo } from '@/lib/hooks/useApi';
import { riesgosService } from '@/lib/trm';
import { usersService } from '@/lib/auth';
import type { EstadoRiesgo, NivelRiesgo, UpdateRiesgoPayload } from '@/types/trm';
import { TIPOS_RIESGO } from '@/constants/riesgos-combos';

const ESTADO_COLOR: Record<EstadoRiesgo, string> = {
  Activo: 'red', 'En revisión': 'orange', 'En mitigación': 'blue', Aceptado: 'yellow', Cerrado: 'green',
};
const MATRIX_DATA = [[1,2,3,4,5],[2,4,6,8,10],[3,6,9,12,15],[4,8,12,16,20],[5,10,15,20,25]];
function cellBg(v: number) {
  if (v <= 4) return '#EAF3DE';
  if (v <= 9) return '#FAEEDA';
  if (v <= 16) return '#FAECE7';
  return '#FCEBEB';
}
function nivelFromScore(s: number): { label: NivelRiesgo; color: string; hex: string } {
  if (s >= 17) return { label: 'Crítico', color: 'red', hex: '#A32D2D' };
  if (s >= 10) return { label: 'Alto', color: 'orange', hex: '#993C1D' };
  if (s >= 5)  return { label: 'Medio', color: 'yellow', hex: '#854F0B' };
  return { label: 'Bajo', color: 'green', hex: '#3B6D11' };
}

export default function EditarRiesgo() {
  const params = useSearchParams();
  const id = params.get('id');

  const { data: riesgo, loading, error } = useRiesgo(id);

  const [activeTab, setActiveTab] = useState<string | null>('info');
  const [prob, setProb] = useState(1);
  const [imp, setImp] = useState(1);
  const [estado, setEstado] = useState<EstadoRiesgo>('Activo');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    causa: '',
    categoria: '',
    justificacion: '',
    responsable_id: '',
    responsable_accion_id: '',
  });

  // Populate form once riesgo loads
  useEffect(() => {
    if (!riesgo) return;
    setForm({
      nombre: riesgo.nombre ?? '',
      descripcion: riesgo.descripcion ?? '',
      causa: riesgo.causa ?? '',
      categoria: riesgo.categoria ?? '',
      justificacion: '',
      responsable_id: riesgo.responsable_id ?? '',
      responsable_accion_id: riesgo.responsable_accion_id ?? '',
    });
    setProb(riesgo.probabilidad);
    setImp(riesgo.impacto);
    setEstado(riesgo.estado);
  }, [riesgo]);

  // Cargar listado de usuarios
  useEffect(() => {
    usersService.list()
      .then(setUsers)
      .catch(err => console.error('[EditarRiesgo] Error cargando usuarios:', err));
  }, []);

  const update = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setHasChanges(true);
  };

  const score = prob * imp;
  const nivel = nivelFromScore(score);

  const breadcrumbs = [
    { title: 'Dashboard', href: PATH_DASHBOARD.default },
    { title: 'Operador', href: PATH_OPERADOR.dashboard },
    { title: 'Gestión de Riesgos', href: PATH_OPERADOR.gestionRiesgos },
    { title: riesgo?.codigo ?? '…', href: riesgo ? `${PATH_OPERADOR.detalleRiesgo}?id=${riesgo.id}` : '#' },
    { title: 'Editar', href: '#' },
  ].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

  const handleSave = async () => {
    if (!riesgo) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload: UpdateRiesgoPayload = {
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        causa: form.causa || undefined,
        categoria: form.categoria || undefined,
        probabilidad: prob,
        impacto: imp,
        nivel: nivel.label,
        estado,
        justificacion_cambio_estado: form.justificacion || undefined,
        responsable_id: form.responsable_id || undefined,
        responsable_accion_id: form.responsable_accion_id || undefined,
      };
      await riesgosService.update(riesgo.id, payload);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <>
      <PageHeader title="Editar Riesgo" breadcrumbItems={breadcrumbs} />
      <Group justify="center" mt="xl"><Loader /></Group>
    </>
  );

  if (error || !riesgo) return (
    <>
      <PageHeader title="Editar Riesgo" breadcrumbItems={breadcrumbs} />
      <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
        <Text c="red">{error?.message ?? 'Riesgo no encontrado. Verifica el ID en la URL.'}</Text>
        <Button size="xs" mt="md" variant="default" component={Link} href={PATH_OPERADOR.gestionRiesgos}>← Volver al listado</Button>
      </Surface>
    </>
  );

  if (saved) return (
    <>
      <title>Riesgo Actualizado | Operador</title>
      <PageHeader title="Editar Riesgo" breadcrumbItems={breadcrumbs} />
      <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
        <Box style={{ width: 44, height: 44, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        </Box>
        <Title order={4} mb={6}>Riesgo actualizado correctamente</Title>
        <Text size="sm" c="dimmed" mb="lg">Los cambios en {riesgo.codigo} quedaron registrados.</Text>
        <Group justify="center" gap="sm">
          <Button size="xs" variant="default" component={Link} href={`${PATH_OPERADOR.detalleRiesgo}?id=${riesgo.id}`}>Ver ficha</Button>
          <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.gestionRiesgos}>Ver listado</Button>
        </Group>
      </Surface>
    </>
  );

  return (
    <>
      <title>Editar Riesgo | Operador</title>
      <PageHeader
        title="Editar Riesgo"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="xs">
            <Text size="xs" c="dimmed">{riesgo.codigo}</Text>
            <Badge color={nivel.color as any} variant="light" size="sm">{nivel.label} · {score}</Badge>
            <Badge color={ESTADO_COLOR[estado]} variant="light" size="sm">{estado}</Badge>
          </Group>
        }
      />
      <Stack gap="md" mt="md">
        {hasChanges && (
          <Box p="sm" style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
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
            <Tabs.Tab value="info">Información general</Tabs.Tab>
            <Tabs.Tab value="evaluacion">Evaluación</Tabs.Tab>
            <Tabs.Tab value="causas">Causa raíz</Tabs.Tab>
            <Tabs.Tab value="estado">Estado</Tabs.Tab>
          </Tabs.List>

          {/* Información general */}
          <Tabs.Panel value="info" pt="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Datos del riesgo</Text>
              <TextInput label="Nombre del riesgo *" value={form.nombre} onChange={e => update('nombre', e.target.value)} mb="sm" />
              <Textarea label="Descripción detallada" value={form.descripcion} onChange={e => update('descripcion', e.target.value)} minRows={3} mb="sm" />
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select
                  label="Categoría"
                  value={form.categoria}
                  onChange={v => update('categoria', v || '')}
                  data={TIPOS_RIESGO}
                />
                <Select 
                  label="Responsable del riesgo" 
                  placeholder="Seleccionar responsable..." 
                  value={form.responsable_id} 
                  onChange={v => update('responsable_id', v || '')}
                  data={users.map(u => ({ value: u.id, label: u.name }))}
                  searchable
                  clearable
                />
              </SimpleGrid>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select 
                  label="Responsable de la acción" 
                  placeholder="Seleccionar responsable..." 
                  value={form.responsable_accion_id} 
                  onChange={v => update('responsable_accion_id', v || '')}
                  data={users.map(u => ({ value: u.id, label: u.name }))}
                  searchable
                  clearable
                />
              </SimpleGrid>
            </Surface>
          </Tabs.Panel>

          {/* Evaluación */}
          <Tabs.Panel value="evaluacion" pt="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="xs">Probabilidad × Impacto</Text>
              <Text size="xs" c="dimmed" mb="sm">Haz clic en la celda que representa la nueva evaluación.</Text>
              <Group align="flex-start" gap="md">
                <Box style={{ flex: 1 }}>
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
                </Box>
                <Box p="sm" style={{ background: 'var(--mantine-color-default-hover)', borderRadius: 8, textAlign: 'center', minWidth: 110 }}>
                  <Text size="xs" c="dimmed">Puntaje</Text>
                  <Title order={2} style={{ color: nivel.hex }}>{score}</Title>
                  <Badge color={nivel.color as any} variant="light" size="xs" mt={4}>{nivel.label}</Badge>
                </Box>
              </Group>
            </Surface>
          </Tabs.Panel>

          {/* Causa raíz */}
          <Tabs.Panel value="causas" pt="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Análisis de causa raíz</Text>
              <Textarea label="Causa raíz" value={form.causa} onChange={e => update('causa', e.target.value)} minRows={3} />
            </Surface>
          </Tabs.Panel>

          {/* Estado */}
          <Tabs.Panel value="estado" pt="md">
            <Stack gap="md">
              <Surface p="md">
                <Text fw={500} size="sm" mb="sm">Estado del riesgo</Text>
                <Group gap="sm" mb="md">
                  {(['Activo','En revisión','En mitigación','Aceptado','Cerrado'] as EstadoRiesgo[]).map((e) => (
                    <Box key={e} onClick={() => { setEstado(e); setHasChanges(true); }}
                      style={{ border: `${estado === e ? `2px solid var(--mantine-color-${ESTADO_COLOR[e]}-6)` : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '6px 14px', cursor: 'pointer', background: estado === e ? `var(--mantine-color-${ESTADO_COLOR[e]}-0)` : 'transparent', textAlign: 'center' }}>
                      <Text size="xs" fw={estado === e ? 500 : 400} c={estado === e ? (ESTADO_COLOR[e] as any) : 'dimmed'}>{e}</Text>
                    </Box>
                  ))}
                </Group>
                {(estado === 'Cerrado' || estado === 'Aceptado') && (
                  <Textarea
                    label="Justificación de cambio de estado *"
                    placeholder="Explica por qué el riesgo cambia a este estado..."
                    value={form.justificacion}
                    onChange={e => update('justificacion', e.target.value)}
                    minRows={3}
                  />
                )}
              </Surface>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Footer */}
        <Surface p="sm">
          <Group justify="space-between">
            <Group gap="sm">
              <Text size="xs" c="dimmed">{riesgo.codigo}</Text>
              {hasChanges && <Badge color="yellow" variant="light" size="xs">Cambios sin guardar</Badge>}
            </Group>
            <Group gap="sm">
              <Button size="xs" variant="default" component={Link} href={`${PATH_OPERADOR.detalleRiesgo}?id=${riesgo.id}`}>Cancelar</Button>
              <Button size="xs" onClick={handleSave} loading={saving} disabled={!hasChanges}>Guardar cambios</Button>
            </Group>
          </Group>
        </Surface>
      </Stack>
    </>
  );
}
