'use client';

import { useState } from 'react';
import {
  Anchor, Badge, Box, Button, Checkbox, Group, Progress,
  Select, SimpleGrid, Stack, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Escalamiento', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const PLANES_VENCIDOS = [
  { id: 'PM-029', name: 'Revisión integral del plan de emergencia portuaria', dias: 15, area: 'Muelle / Buque', resp: 'Seg. Industrial', vencio: '05/04', pct: 20, ultimoMov: '02/04/2026 — Sin actualizaciones en 14 días' },
  { id: 'PM-027', name: 'Mantenimiento correctivo grúa STS-2', dias: 19, area: 'Muelle / Buque', resp: 'Jef. Mantenimiento', vencio: '01/04', pct: 10, ultimoMov: '29/03/2026 — Sin actualizaciones en 18 días' },
];

const DESTINATARIOS = [
  { id: 'dc1', initials: 'GO', name: 'Gerencia de Operaciones', role: 'Responsable directo de área · Aprobador nivel 1', bg: '#E6F1FB', c: '#185FA5', obligatorio: true },
  { id: 'dc2', initials: 'SI', name: 'Jefatura de Seguridad Industrial', role: 'Supervisora de PM-029 · SSOMA', bg: '#FAECE7', c: '#993C1D', obligatorio: false },
  { id: 'dc3', initials: 'JM', name: 'Jefatura de Mantenimiento', role: 'Responsable de PM-027', bg: '#EEEDFE', c: '#534AB7', obligatorio: false },
  { id: 'dc4', initials: 'GG', name: 'Gerencia General', role: 'Escalamiento máximo · Solo si es crítico', bg: '#EAF3DE', c: '#3B6D11', obligatorio: false },
  { id: 'dc5', initials: 'AP', name: 'Autoridad Portuaria', role: 'Notificación regulatoria si aplica', bg: '#FAEEDA', c: '#854F0B', obligatorio: false },
];

const URGENCIAS = [
  { id: 1, tiempo: '48h', label: 'Normal', sub: 'Atención en 2 días', color: 'green' },
  { id: 2, tiempo: '24h', label: 'Alta', sub: 'Respuesta hoy', color: 'yellow' },
  { id: 3, tiempo: 'Inmediata', label: 'Crítica', sub: 'Acción ahora', color: 'red' },
];

export default function Escalamiento() {
  const [step, setStep] = useState(1);
  const [urgencia, setUrgencia] = useState(2);
  const [selDest, setSelDest] = useState<string[]>(['dc1', 'dc2', 'dc3']);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    motivo: 'Incumplimiento de fecha límite sin justificación',
    contexto: 'Las acciones PM-027 y PM-029 están vinculadas a riesgos críticos de nivel 20 en el área de Muelle. La grúa STS-2 operando sin mantenimiento correctivo aumenta el riesgo de falla durante operación de buque, y la ausencia de un plan de emergencia actualizado deja al terminal sin protocolo vigente ante un incidente mayor. Se requiere decisión sobre presupuesto extraordinario y asignación de recursos adicionales.',
    nuevaFecha: '',
    recursos: '',
  });
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const toggleDest = (id: string) => {
    if (id === 'dc1') return;
    setSelDest(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const urgLabel = URGENCIAS.find(u => u.id === urgencia)?.label || '';
  const urgTiempo = URGENCIAS.find(u => u.id === urgencia)?.tiempo || '';
  const destNames = DESTINATARIOS.filter(d => selDest.includes(d.id)).map(d => d.name).join(' · ');

  if (submitted) {
    return (
      <>
        <title>Escalamiento Enviado | Operador</title>
        <PageHeader title="Escalamiento de Acciones" breadcrumbItems={breadcrumbs} />
        <Surface p="xl" mt="md" style={{ textAlign: 'center' }}>
          <Box style={{ width: 48, height: 48, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </Box>
          <Title order={4} mb={6}>Escalamiento enviado exitosamente</Title>
          <Text size="sm" c="dimmed" mb={4}>Referencia: <strong>ESC-2026-003</strong></Text>
          <Text size="xs" c="dimmed" mb="lg">Los destinatarios recibirán la notificación formal. El sistema registrará la respuesta automáticamente.</Text>

          <Surface p="md" mb="md" style={{ textAlign: 'left' }}>
            <Text size="xs" fw={500} mb="sm">Notificaciones enviadas a:</Text>
            {DESTINATARIOS.filter(d => selDest.includes(d.id)).map((d) => (
              <Group key={d.id} gap="sm" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B6D11', flexShrink: 0 }} />
                <Text size="xs" style={{ flex: 1 }}>{d.name}</Text>
                <Text size="xs" c="green">Enviado</Text>
              </Group>
            ))}
            <Group gap="sm" style={{ padding: '6px 0' }}>
              <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#185FA5', flexShrink: 0 }} />
              <Text size="xs" style={{ flex: 1 }}>Sistema TRM — Registro automático</Text>
              <Text size="xs" c="blue">Registrado</Text>
            </Group>
          </Surface>

          <Text size="xs" c="dimmed" mb="lg">Tiempo de respuesta esperado: <strong>{urgTiempo}</strong> · Si no hay respuesta, el sistema escalará automáticamente a Gerencia General.</Text>

          <Group justify="center" gap="sm" wrap="wrap">
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.seguimientoPlanes}>Tablero de planes</Button>
            <Button size="xs" component="a" href={PATH_OPERADOR.dashboard}>Dashboard</Button>
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.reporteEjecutivo}>Reporte ejecutivo</Button>
          </Group>
        </Surface>
      </>
    );
  }

  return (
    <>
      <title>Escalamiento de Acciones | Operador</title>
      <PageHeader title="Escalamiento de Acciones Vencidas" breadcrumbItems={breadcrumbs} />

      <Stack gap="md" mt="md">
        {/* Alerta */}
        <Box p="sm" style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          <Text size="xs" c="yellow">2 acciones vinculadas a riesgos críticos llevan más de 10 días vencidas sin avance significativo. Se requiere escalamiento formal a Gerencia de Operaciones.</Text>
        </Box>

        {/* Paso 1 */}
        {step === 1 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Acciones a escalar</Text>
              <Stack gap="sm">
                {PLANES_VENCIDOS.map((p) => (
                  <Box key={p.id} p="sm" style={{ border: '0.5px solid #F09595', borderRadius: 8 }}>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="red" fw={500}>{p.id}</Text>
                      <Badge color="red" variant="light" size="xs">{p.dias} días vencida</Badge>
                    </Group>
                    <Text size="xs" fw={500} mb={6}>{p.name}</Text>
                    <Group gap="xs" mb={6}>
                      <Badge color="red" variant="light" size="xs">Crítico</Badge>
                      <Badge color="blue" variant="light" size="xs">{p.area}</Badge>
                      <Text size="xs" c="dimmed">Resp: {p.resp} · Venció {p.vencio}</Text>
                    </Group>
                    <Group gap="sm">
                      <Progress value={p.pct} color="red" size="xs" style={{ flex: 1 }} />
                      <Text size="xs" c="red" fw={500}>{p.pct}% completado</Text>
                    </Group>
                    <Text size="xs" c="dimmed" mt={4}>{p.ultimoMov}</Text>
                  </Box>
                ))}
              </Stack>
            </Surface>

            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Motivo y urgencia del escalamiento</Text>
              <Select label="Motivo del escalamiento *" mb="sm" value={form.motivo} onChange={v => update('motivo', v || '')}
                data={['Incumplimiento de fecha límite sin justificación','Falta de recursos para ejecutar la acción','Bloqueo por decisión que requiere autoridad superior','Riesgo que se ha materializado parcialmente','Responsable no disponible / cambio de cargo']} />

              <Text size="xs" c="dimmed" mb="xs">Nivel de urgencia *</Text>
              <SimpleGrid cols={3} mb="sm">
                {URGENCIAS.map((u) => (
                  <Box key={u.id} onClick={() => setUrgencia(u.id)} style={{ border: `${urgencia === u.id ? '2px solid #185FA5' : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, padding: '10px 8px', textAlign: 'center', cursor: 'pointer', background: urgencia === u.id ? '#E6F1FB' : 'transparent' }}>
                    <Title order={4} c={u.color}>{u.tiempo}</Title>
                    <Text size="xs" fw={500} c={u.color}>{u.label}</Text>
                    <Text size="xs" c="dimmed">{u.sub}</Text>
                  </Box>
                ))}
              </SimpleGrid>

              <Textarea label="Contexto adicional para gerencia *" minRows={4} value={form.contexto} onChange={e => update('contexto', e.target.value)} mb="sm" />
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput label="Nueva fecha límite propuesta" type="date" value={form.nuevaFecha} onChange={e => update('nuevaFecha', e.target.value)} />
                <TextInput label="Recursos o decisión requerida" placeholder="Ej: Presupuesto $15,000 para técnico externo" value={form.recursos} onChange={e => update('recursos', e.target.value)} />
              </SimpleGrid>
            </Surface>

            <Surface p="md">
              <Text fw={500} size="sm" mb="xs">Destinatarios del escalamiento</Text>
              <Text size="xs" c="dimmed" mb="sm">Selecciona a quién se enviará la notificación formal</Text>
              <Stack gap={6}>
                {DESTINATARIOS.map((d) => (
                  <Group key={d.id} gap="sm" p="sm" onClick={() => toggleDest(d.id)} style={{ border: `${selDest.includes(d.id) ? '2px solid #185FA5' : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, cursor: d.obligatorio ? 'default' : 'pointer', background: selDest.includes(d.id) ? '#E6F1FB' : 'transparent' }}>
                    <Checkbox checked={selDest.includes(d.id)} readOnly size="xs" />
                    <Box style={{ width: 32, height: 32, borderRadius: '50%', background: d.bg, color: d.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{d.initials}</Box>
                    <Box style={{ flex: 1 }}>
                      <Text size="xs" fw={500}>{d.name}</Text>
                      <Text size="xs" c="dimmed">{d.role}</Text>
                    </Box>
                    {d.obligatorio && <Badge color="red" variant="light" size="xs">Obligatorio</Badge>}
                  </Group>
                ))}
              </Stack>
            </Surface>

            <Group justify="space-between">
              <Text size="xs" c="dimmed">Paso 1 de 2 — Configuración</Text>
              <Button size="sm" onClick={() => setStep(2)}>Siguiente → Previsualizar notificación</Button>
            </Group>
          </Stack>
        )}

        {/* Paso 2 - Preview */}
        {step === 2 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Vista previa de la notificación</Text>
              <Box p="md" style={{ background: 'var(--mantine-color-default-hover)', borderRadius: 8, border: '0.5px solid var(--mantine-color-default-border)', fontSize: 12, lineHeight: 1.7 }}>
                <Text size="xs" fw={500}>ESCALAMIENTO FORMAL DE ACCIONES VENCIDAS</Text>
                <Text size="xs" c="dimmed">Ref: ESC-2026-003 · Fecha: {new Date().toLocaleDateString('es-EC')}</Text>
                <br />
                <Text size="xs"><strong>Estimada Gerencia de Operaciones,</strong></Text>
                <br />
                <Text size="xs">Por medio del presente se notifica formalmente el vencimiento sin resolución de las siguientes acciones de mitigación críticas, requiriendo su intervención:</Text>
                <br />
                {PLANES_VENCIDOS.map((p) => (
                  <Box key={p.id} mb={4}>
                    <Text size="xs"><strong>· {p.id}</strong> — {p.name}</Text>
                    <Text size="xs" c="dimmed" ml="md">Vencida: {p.vencio}/2026 · Avance actual: {p.pct}% · Días de retraso: {p.dias}</Text>
                  </Box>
                ))}
                <br />
                <Text size="xs"><strong>Motivo:</strong> {form.motivo}</Text>
                <Text size="xs"><strong>Urgencia:</strong> <span style={{ color: URGENCIAS.find(u => u.id === urgencia)?.color === 'red' ? '#A32D2D' : URGENCIAS.find(u => u.id === urgencia)?.color === 'yellow' ? '#854F0B' : '#3B6D11', fontWeight: 500 }}>{urgLabel} ({urgTiempo})</span></Text>
                <br />
                <Text size="xs"><strong>Contexto:</strong></Text>
                <Text size="xs">{form.contexto}</Text>
                <br />
                <Text size="xs"><strong>Se solicita:</strong></Text>
                <Text size="xs">· Decisión sobre nueva fecha límite: {form.nuevaFecha || 'Por definir'}</Text>
                <Text size="xs">· Recursos / decisión requerida: {form.recursos || 'Por especificar'}</Text>
                <br />
                <Text size="xs" c="dimmed">— Terminal Risk Monitor · Sistema automatizado de escalamiento</Text>
              </Box>
            </Surface>

            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Canal de notificación</Text>
              <SimpleGrid cols={3}>
                {[
                  { label: 'Correo electrónico', sub: 'Notificación formal', selected: true },
                  { label: 'Mensaje interno', sub: 'Sistema TRM', selected: false },
                  { label: 'SMS / WhatsApp', sub: 'Solo urgencia crítica', selected: false },
                ].map((c) => (
                  <Box key={c.label} p="sm" style={{ border: `${c.selected ? '2px solid #185FA5' : '0.5px solid var(--mantine-color-default-border)'}`, borderRadius: 8, textAlign: 'center', background: c.selected ? '#E6F1FB' : 'transparent' }}>
                    <Text size="xs" fw={500} c={c.selected ? 'blue' : 'dimmed'}>{c.label}</Text>
                    <Text size="xs" c="dimmed">{c.sub}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Surface>

            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Resumen del escalamiento</Text>
              <Stack gap={0}>
                {[
                  ['Acciones escaladas', 'PM-027 · PM-029'],
                  ['Motivo', form.motivo],
                  ['Urgencia', `${urgLabel} (${urgTiempo})`],
                  ['Nueva fecha propuesta', form.nuevaFecha || 'Por definir'],
                  ['Destinatarios', destNames],
                  ['Canal', 'Correo electrónico + Registro TRM'],
                  ['Generado por', 'Sistema Terminal Risk Monitor'],
                ].map(([k, v]) => (
                  <Group key={k} justify="space-between" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                    <Text size="xs" c="dimmed" style={{ minWidth: 180 }}>{k}</Text>
                    <Text size="xs" fw={500} ta="right">{v}</Text>
                  </Group>
                ))}
              </Stack>
            </Surface>

            <Group justify="space-between">
              <Button variant="default" size="sm" onClick={() => setStep(1)}>← Editar</Button>
              <Text size="xs" c="dimmed">Paso 2 de 2 — Confirmación</Text>
              <Button size="sm" color="red" onClick={() => setSubmitted(true)}>Enviar escalamiento</Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </>
  );
}
