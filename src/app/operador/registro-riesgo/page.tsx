'use client';
import Link from 'next/link';

import { useState, useEffect } from 'react';
import {
  Anchor, Badge, Box, Button, Checkbox, Group, Radio, Select,
  SimpleGrid, Stack, Stepper, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';
import { riesgosService, areasService, controlesService } from '@/lib/trm';
import { TERMINAL_ID } from '@/lib/constants';
import type { AreaDto, ControlDto } from '@/types/trm';
import { useCurrentUser } from '@/lib/hooks/useApi';
import {
  TIPOS_RIESGO,
  TURNOS,
  NORMATIVAS,
  PROBABILIDAD_OCURRENCIA,
  NIVEL_IMPACTO,
  ANTECEDENTES,
  PRIORIDADES,
  getScoreInfo
} from '@/constants/riesgos-combos';
import { usersService } from '@/lib/auth';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Registrar Riesgo', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);


export default function RegistroRiesgo() {
  const { user } = useCurrentUser();
  const [active, setActive] = useState(0);
  const [prob, setProb] = useState('');
  const [imp, setImp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [controles, setControles] = useState<ControlDto[]>([]);
  const [controlesSeleccionados, setControlesSeleccionados] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ nombre: '', desc: '', area_id: '', tipo: '', resp: '', turno: '', norma: '', prev: '', trigger: '', conseq: '', accion: '', resp2: '', fecha: '', prio: '', recursos: '' });
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Cargar áreas de la terminal al montar
  useEffect(() => {
    areasService.list(TERMINAL_ID)
      .then(setAreas)
      .catch(err => console.error('[RegistroRiesgo] Error cargando áreas:', err));

    // Cargar listado de usuarios
    usersService.list()
      .then(setUsers)
      .catch(err => console.error('[RegistroRiesgo] Error cargando usuarios:', err));

    // Cargar listado de controles
    controlesService.list()
      .then(setControles)
      .catch(err => console.error('[RegistroRiesgo] Error cargando controles:', err));
  }, []);

  const score = prob && imp ? parseInt(prob) * parseInt(imp) : null;
  const scoreInfo = score ? getScoreInfo(score) : null;

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const nivel = scoreInfo?.label as 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
      const result = await riesgosService.create({
        terminal_id: TERMINAL_ID,
        area_id: form.area_id || undefined,
        responsable_id: form.resp || undefined,
        responsable_accion_id: form.resp2 || undefined,
        codigo: `RISK-${Date.now()}`,
        nombre: form.nombre,
        descripcion: form.desc,
        causa: form.trigger,
        categoria: form.tipo,
        probabilidad: parseInt(prob),
        impacto: parseInt(imp),
        nivel,
        estado: 'Activo',
      });

      const riesgoId = result.id;
      if (!riesgoId) {
        throw new Error('No se pudo obtener el ID del riesgo creado');
      }

      // Vincular controles seleccionados
      if (controlesSeleccionados.size > 0) {
        const vincularPromises = Array.from(controlesSeleccionados).map(controlId =>
          riesgosService.vincularControl(riesgoId, {
            control_id: controlId,
            efectivo: true,
            observaciones: 'Control vinculado al crear el riesgo'
          })
        );
        await Promise.all(vincularPromises);
      }

      setCreatedId(riesgoId);
      setSubmitted(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrar el riesgo');
    } finally {
      setLoading(false);
    }
  }

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
          <Text size="sm" c="dimmed" mb="lg">ID asignado: <strong>{createdId ?? '—'}</strong> · El responsable será notificado por correo</Text>
          <Group justify="center" gap="sm">
            <Button size="xs" variant="default" onClick={() => { setSubmitted(false); setActive(0); }}>Registrar otro</Button>
            <Button size="xs" component={Link} href={PATH_OPERADOR.dashboard}>Ir al dashboard</Button>
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
                <Select label="Área operacional *" placeholder="Seleccionar..." value={form.area_id} onChange={v => update('area_id', v || '')}
                  data={areas.map(a => ({ value: a.id, label: a.nombre }))} />
                <Select label="Tipo de riesgo *" placeholder="Seleccionar..." value={form.tipo} onChange={v => update('tipo', v || '')}
                  data={TIPOS_RIESGO} />
              </SimpleGrid>
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <Select 
                  label="Responsable *" 
                  placeholder="Seleccionar responsable..." 
                  value={form.resp} 
                  onChange={v => update('resp', v || '')}
                  data={users.map(u => ({ value: u.id, label: u.name }))}
                  searchable
                  clearable
                />
                <Select label="Turno afectado" placeholder="Todos" value={form.turno} onChange={v => update('turno', v || '')} data={TURNOS} clearable />
                <Select label="Normativa aplicable" placeholder="Ninguna específica" value={form.norma} onChange={v => update('norma', v || '')} data={NORMATIVAS} clearable />
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
                    {PROBABILIDAD_OCURRENCIA.map(({ value, label }) => (
                      <Radio key={value} value={value} label={label} size="xs" styles={{ root: { padding: '6px 8px', border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 6 } }} />
                    ))}
                  </Stack>
                </Radio.Group>
                <Radio.Group label="Nivel de impacto *" value={imp} onChange={setImp}>
                  <Stack gap={4} mt={4}>
                    {NIVEL_IMPACTO.map(({ value, label }) => (
                      <Radio key={value} value={value} label={label} size="xs" styles={{ root: { padding: '6px 8px', border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 6 } }} />
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
                <Select label="¿Ya ocurrió antes?" data={ANTECEDENTES} />
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
                {controles.map((c) => (
                  <Group key={c.id} gap="sm" style={{ padding: '6px 10px', border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 6 }}>
                    <Checkbox
                      size="xs"
                      checked={controlesSeleccionados.has(c.id)}
                      onChange={(e) => {
                        const newSet = new Set(controlesSeleccionados);
                        if (e.currentTarget.checked) {
                          newSet.add(c.id);
                        } else {
                          newSet.delete(c.id);
                        }
                        setControlesSeleccionados(newSet);
                      }}
                    />
                    <Text size="xs" style={{ flex: 1 }}>{c.nombre}</Text>
                    <Text size="xs" c="dimmed">{c.tipo}</Text>
                  </Group>
                ))}
              </Stack>
            </Surface>
            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Plan de mitigación</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput label="Acción de mitigación propuesta *" placeholder="Ej: Instalar sensor de carga en gancho de RTG" value={form.accion} onChange={e => update('accion', e.target.value)} />
                <Select 
                  label="Responsable de la acción" 
                  placeholder="Seleccionar responsable..." 
                  value={form.resp2} 
                  onChange={v => update('resp2', v || '')}
                  data={users.map(u => ({ value: u.id, label: u.name }))}
                  searchable
                  clearable
                />
              </SimpleGrid>
              <SimpleGrid cols={{ base: 1, sm: 2 }} mt="sm">
                <TextInput label="Fecha límite" type="date" value={form.fecha} onChange={e => update('fecha', e.target.value)} />
                <Select label="Prioridad" data={PRIORIDADES} />
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
                ['Área operacional', areas.find(a => a.id === form.area_id)?.nombre || '—'],
                ['Tipo de riesgo', form.tipo || '—'],
                ['Responsable', users.find(u => u.id === form.resp)?.name || '—'],
                ['Probabilidad', prob ? `${prob}/5` : '—'],
                ['Impacto', imp ? `${imp}/5` : '—'],
                ['Puntaje / Nivel', score ? `${score} — ${scoreInfo?.label}` : '—'],
                ['Acción de mitigación', form.accion || '—'],
                ['Responsable de la acción', users.find(u => u.id === form.resp2)?.name || '—'],
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
            : <Button size="sm" style={{ background: '#185FA5', color: 'white' }} loading={loading} onClick={handleSubmit}>Registrar riesgo</Button>
          }
        </Group>
        {error && <Text size="xs" c="red" ta="center">{error}</Text>}
      </Stack>
    </>
  );
}
