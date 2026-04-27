'use client';

import { useState, useMemo } from 'react';
import {
  Anchor, Badge, Box, Button, Collapse, Group, Progress,
  Select, SimpleGrid, Stack, Tabs, Text, TextInput, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Historial de Escalamientos', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

interface PlanEsc { id: string; n: string; p: number; dias: number }
interface Dest { nombre: string; av: string; color: string; oblig: boolean; estado: string }
interface Hist { a: string; d: string; t: string; c: string }
interface Respuesta { autor: string; fecha: string; texto: string }
interface Esc {
  id: string; fecha: string; urg: 'Crítica' | 'Alta' | 'Normal';
  planes: PlanEsc[]; dest: string; estado: 'Enviado' | 'Respondido' | 'Cerrado';
  estadoColor: string; respEn: string; creador: string;
  motivo: string; ctx: string; rec: string; nuevaFecha: string; canal: string;
  dests: Dest[]; hist: Hist[]; respuesta?: Respuesta;
}

const URG_COLOR = { Crítica: 'red', Alta: 'yellow', Normal: 'green' } as const;
const ESTADO_COLOR = { Enviado: 'yellow', Respondido: 'green', Cerrado: 'gray' } as const;

const DATA: Esc[] = [
  { id:'ESC-2026-003', fecha:'23/04/2026 · 10:20h', urg:'Alta',
    planes:[{id:'PM-027',n:'Mantenimiento correctivo grúa STS-2',p:10,dias:19},{id:'PM-029',n:'Revisión integral plan emergencia portuaria',p:20,dias:15}],
    dest:'Gerencia de Operaciones', estado:'Enviado', estadoColor:'yellow', respEn:'—', creador:'Sistema TRM (auto)',
    motivo:'Incumplimiento de fecha límite sin justificación',
    ctx:'Las acciones PM-027 y PM-029 están vinculadas a riesgos críticos de nivel 20 en el área de Muelle. La grúa STS-2 operando sin mantenimiento correctivo aumenta el riesgo de falla durante operación de buque.',
    rec:'Presupuesto extraordinario y asignación de técnico externo', nuevaFecha:'30/04/2026', canal:'Email + Registro TRM',
    dests:[{nombre:'Gerencia de Operaciones',av:'GO',color:'#185FA5',oblig:true,estado:'Enviado'},{nombre:'Jef. Seguridad Industrial',av:'SI',color:'#993C1D',oblig:false,estado:'Enviado'},{nombre:'Jef. Mantenimiento',av:'JM',color:'#534AB7',oblig:false,estado:'Enviado'}],
    hist:[{a:'Escalamiento generado automáticamente',d:'Sistema detectó PM-027 y PM-029 sin respuesta por más de 48h',t:'23/04/2026 · 10:20h',c:'#EF9F27'},{a:'Notificación enviada a 3 destinatarios',d:'Email enviado a Gerencia Ops, Jef. Seg. Industrial y Jef. Mantenimiento',t:'23/04/2026 · 10:21h',c:'#185FA5'}] },

  { id:'ESC-2026-002', fecha:'15/04/2026 · 08:45h', urg:'Alta',
    planes:[{id:'PM-022',n:'Instalación barreras peatonales patio sur',p:100,dias:3}],
    dest:'Gerencia de Operaciones', estado:'Respondido', estadoColor:'green', respEn:'16/04/2026', creador:'M. Torres',
    motivo:'Falta de recursos para ejecutar la acción',
    ctx:'El plan de instalación de barreras requería presupuesto adicional no incluido en el plan operativo mensual.',
    rec:'Aprobación de $4,200 para adquisición e instalación de barreras', nuevaFecha:'22/04/2026', canal:'Email',
    respuesta:{autor:'A. Mendoza — Gerencia Ops',fecha:'16/04/2026 · 11:30h',texto:'Aprobado el presupuesto solicitado. Contactar a proveedor CercoMar para cotización definitiva. Plazo extendido al 22/04.'},
    dests:[{nombre:'Gerencia de Operaciones',av:'GO',color:'#185FA5',oblig:true,estado:'Respondido'}],
    hist:[{a:'Escalamiento creado por M. Torres',d:'Plan PM-022 vencido 3 días. Recursos insuficientes.',t:'15/04/2026 · 08:45h',c:'#185FA5'},{a:'Respuesta recibida de Gerencia Ops',d:'Presupuesto aprobado. Plazo extendido.',t:'16/04/2026 · 11:30h',c:'#3B6D11'},{a:'Escalamiento cerrado',d:'Plan PM-022 reactivado con nuevo presupuesto',t:'16/04/2026 · 14:00h',c:'#3B6D11'}] },

  { id:'ESC-2026-001', fecha:'02/04/2026 · 16:30h', urg:'Crítica',
    planes:[{id:'PM-015',n:'Actualización protocolo IMDG clase 3',p:100,dias:7}],
    dest:'Gerencia General', estado:'Cerrado', estadoColor:'gray', respEn:'03/04/2026', creador:'P. Vera',
    motivo:'Riesgo que se ha materializado parcialmente',
    ctx:'El incidente INC-2026-006 (carga IMDG sin etiquetado) evidenció que el protocolo desactualizado contribuyó directamente al evento.',
    rec:'Decisión inmediata sobre actualización del POE y capacitación emergente', nuevaFecha:'10/04/2026', canal:'Email + SMS',
    respuesta:{autor:'Dir. General — R. Alvarado',fecha:'03/04/2026 · 09:00h',texto:'Autorizado el proceso de actualización urgente del protocolo IMDG. Se designa a Seg. Industrial como líder. Capacitación a todo el personal antes del 10/04.'},
    dests:[{nombre:'Gerencia General',av:'GG',color:'#3B6D11',oblig:true,estado:'Respondido'},{nombre:'Gerencia de Operaciones',av:'GO',color:'#185FA5',oblig:true,estado:'Respondido'}],
    hist:[{a:'Escalamiento crítico creado',d:'Incidente IMDG materializó el riesgo.',t:'02/04/2026 · 16:30h',c:'#E24B4A'},{a:'SMS enviado a Gerencia General',d:'Notificación urgente por canal SMS',t:'02/04/2026 · 16:31h',c:'#EF9F27'},{a:'Respuesta de Dirección General',d:'Aprobación inmediata y designación de responsable.',t:'03/04/2026 · 09:00h',c:'#3B6D11'},{a:'Escalamiento cerrado',d:'Objetivo cumplido dentro del plazo extendido.',t:'10/04/2026 · 08:30h',c:'#5F5E5A'}] },

  { id:'ESC-2026-004', fecha:'18/04/2026 · 09:10h', urg:'Normal', planes:[{id:'PM-031',n:'Calibración sensores perimetrales ISPS',p:40,dias:5}], dest:'Jef. Seguridad ISPS', estado:'Respondido', estadoColor:'green', respEn:'19/04/2026', creador:'R. Castro', motivo:'Incumplimiento de fecha límite sin justificación', ctx:'', rec:'', nuevaFecha:'25/04/2026', canal:'Email', respuesta:{autor:'Jef. Seg. ISPS',fecha:'19/04/2026',texto:'Se reprogramó con técnico disponible el 20/04.'}, dests:[{nombre:'Jef. Seguridad ISPS',av:'JS',color:'#E24B4A',oblig:true,estado:'Respondido'}], hist:[] },
  { id:'ESC-2026-005', fecha:'10/04/2026 · 14:00h', urg:'Alta', planes:[{id:'PM-025',n:'Revisión EPP operadores turno noche',p:60,dias:4}], dest:'Gerencia de Operaciones', estado:'Respondido', estadoColor:'green', respEn:'11/04/2026', creador:'M. Torres', motivo:'Falta de recursos para ejecutar la acción', ctx:'', rec:'', nuevaFecha:'18/04/2026', canal:'Email', respuesta:{autor:'Gerencia Ops',fecha:'11/04/2026',texto:'Presupuesto de EPP aprobado por $1,800.'}, dests:[{nombre:'Gerencia de Operaciones',av:'GO',color:'#185FA5',oblig:true,estado:'Respondido'}], hist:[] },
  { id:'ESC-2026-006', fecha:'08/04/2026 · 11:30h', urg:'Normal', planes:[{id:'PM-023',n:'Demarcación zonas peatonales bloque B',p:100,dias:2}], dest:'Sup. Patio', estado:'Cerrado', estadoColor:'gray', respEn:'09/04/2026', creador:'P. Vera', motivo:'Incumplimiento de fecha límite sin justificación', ctx:'', rec:'', nuevaFecha:'12/04/2026', canal:'Email', dests:[{nombre:'Supervisión de Patio',av:'SP',color:'#EF9F27',oblig:true,estado:'Respondido'}], hist:[] },
  { id:'ESC-2026-007', fecha:'20/04/2026 · 17:00h', urg:'Alta', planes:[{id:'PM-033',n:'Contratación técnico especialista grúas STS',p:0,dias:6}], dest:'RRHH', estado:'Enviado', estadoColor:'yellow', respEn:'—', creador:'A. Mendoza', motivo:'Bloqueo por decisión que requiere autoridad superior', ctx:'', rec:'', nuevaFecha:'05/05/2026', canal:'Email', dests:[{nombre:'RRHH',av:'RH',color:'#534AB7',oblig:true,estado:'Enviado'},{nombre:'Gerencia de Operaciones',av:'GO',color:'#185FA5',oblig:false,estado:'Enviado'}], hist:[] },
  { id:'ESC-2026-008', fecha:'21/04/2026 · 08:00h', urg:'Crítica', planes:[{id:'PM-035',n:'Actualizar plan de emergencia portuaria',p:15,dias:8}], dest:'Gerencia General', estado:'Enviado', estadoColor:'yellow', respEn:'—', creador:'Sistema TRM (auto)', motivo:'Incumplimiento de fecha límite sin justificación', ctx:'', rec:'', nuevaFecha:'30/04/2026', canal:'Email + SMS', dests:[{nombre:'Gerencia General',av:'GG',color:'#3B6D11',oblig:true,estado:'Enviado'},{nombre:'Gerencia de Operaciones',av:'GO',color:'#185FA5',oblig:true,estado:'Enviado'}], hist:[] },
];

const PER_PAGE = 8;

export default function HistorialEscalamientos() {
  const [filtEstado, setFiltEstado] = useState('todos');
  const [filtUrg, setFiltUrg] = useState('');
  const [filtDest, setFiltDest] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Esc | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('resumen');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return DATA.filter(r => {
      if (filtEstado !== 'todos' && r.estado !== filtEstado) return false;
      if (filtUrg && r.urg !== filtUrg) return false;
      if (filtDest && r.dest !== filtDest) return false;
      if (q && !r.id.toLowerCase().includes(q) && !r.planes.map(p => p.id).join(' ').toLowerCase().includes(q) && !r.dest.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filtEstado, filtUrg, filtDest, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openPanel = (r: Esc) => {
    setSelected(prev => prev?.id === r.id ? null : r);
    setActiveTab('resumen');
  };

  return (
    <>
      <title>Historial de Escalamientos | Operador</title>
      <PageHeader
        title="Historial de Escalamientos"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            <Button size="xs" component="a" href={PATH_OPERADOR.escalamiento}>+ Nuevo escalamiento</Button>
            <Button size="xs" variant="default">Exportar</Button>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Métricas */}
        <SimpleGrid cols={{ base: 2, sm: 5 }}>
          {[
            { label: 'Total 2026', value: '12', color: undefined },
            { label: 'Pendientes respuesta', value: '3', color: 'yellow' },
            { label: 'Respondidos', value: '7', color: 'green' },
            { label: 'Sin respuesta > 48h', value: '1', color: 'red' },
            { label: 'Tiempo resp. promedio', value: '1.8d', color: undefined },
          ].map((m) => (
            <Surface key={m.label} p="md">
              <Title order={3} c={m.color as any}>{m.value}</Title>
              <Text size="xs" c="dimmed">{m.label}</Text>
            </Surface>
          ))}
        </SimpleGrid>

        {/* Filtros */}
        <Group gap="sm" wrap="wrap">
          {[
            { key: 'todos', label: 'Todos (12)' },
            { key: 'Enviado', label: 'Pendientes (3)' },
            { key: 'Respondido', label: 'Respondidos (7)' },
            { key: 'Cerrado', label: 'Cerrados (2)' },
          ].map(f => (
            <Button key={f.key} size="xs" variant={filtEstado === f.key ? 'filled' : 'default'}
              onClick={() => { setFiltEstado(f.key); setPage(1); setSelected(null); }}>
              {f.label}
            </Button>
          ))}
          <Box style={{ width: 1, height: 20, background: 'var(--mantine-color-default-border)' }} />
          <Select size="xs" placeholder="Toda urgencia" data={['Crítica','Alta','Normal']} value={filtUrg} onChange={v => { setFiltUrg(v || ''); setPage(1); }} clearable style={{ width: 130 }} />
          <Select size="xs" placeholder="Todos los destinatarios" data={['Gerencia de Operaciones','Gerencia General','Jef. Seguridad Industrial','Jef. Mantenimiento']} value={filtDest} onChange={v => { setFiltDest(v || ''); setPage(1); }} clearable style={{ width: 200 }} />
          <TextInput size="xs" placeholder="Buscar código, plan..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} style={{ width: 170 }} />
        </Group>

        {/* Tabla */}
        <Surface style={{ overflow: 'hidden' }}>
          <Box style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 120 }} /><col style={{ width: 80 }} /><col />
                <col style={{ width: 150 }} /><col style={{ width: 90 }} /><col style={{ width: 100 }} /><col style={{ width: 110 }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)', background: 'var(--mantine-color-default-hover)' }}>
                  {['ID / Fecha','Urgencia','Planes escalados','Destinatario principal','Estado','Resp. en','Creado por'].map(h => (
                    <th key={h} style={{ fontSize: 11, color: 'var(--mantine-color-dimmed)', fontWeight: 500, textAlign: 'left', padding: '8px 10px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((r, i) => {
                  const isSelected = selected?.id === r.id;
                  return (
                    <tr key={r.id} onClick={() => openPanel(r)}
                      style={{ cursor: 'pointer', background: isSelected ? '#E6F1FB' : i % 2 === 1 ? 'var(--mantine-color-default-hover)' : 'transparent', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                      <td style={{ padding: '8px 10px' }}>
                        <Text size="xs" fw={500} c="blue">{r.id}</Text>
                        <Text size="xs" c="dimmed">{r.fecha}</Text>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <Badge color={URG_COLOR[r.urg]} variant="light" size="xs">{r.urg}</Badge>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {r.planes.map(p => (
                          <Box key={p.id} mb={2}>
                            <Text size="xs"><Text span fw={500} c="blue">{p.id}</Text> <Text span c="dimmed">{p.n.slice(0, 35)}{p.n.length > 35 ? '…' : ''}</Text></Text>
                          </Box>
                        ))}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <Text size="xs">{r.dest}</Text>
                        <Text size="xs" c="dimmed">{r.creador}</Text>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <Badge color={ESTADO_COLOR[r.estado]} variant="light" size="xs">{r.estado}</Badge>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <Text size="xs" c="dimmed">{r.respEn}</Text>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <Text size="xs" c="dimmed">{r.creador}</Text>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
          <Group justify="space-between" p="sm" style={{ borderTop: '0.5px solid var(--mantine-color-default-border)' }}>
            <Text size="xs" c="dimmed">Mostrando {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length} escalamientos</Text>
            <Group gap={4}>
              {page > 1 && <Button size="xs" variant="default" onClick={() => setPage(p => p - 1)}>←</Button>}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} size="xs" variant={p === page ? 'filled' : 'default'} onClick={() => setPage(p)}>{p}</Button>
              ))}
              {page < totalPages && <Button size="xs" variant="default" onClick={() => setPage(p => p + 1)}>→</Button>}
            </Group>
          </Group>
        </Surface>

        {/* Panel de detalle */}
        <Collapse in={!!selected}>
          {selected && (
            <Surface p="md">
              <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }} wrap="wrap">
                <Box>
                  <Text size="xs" c="dimmed" mb={2}>{selected.id}</Text>
                  <Text fw={500}>{selected.motivo}</Text>
                  <Group gap="xs" mt={6}>
                    <Badge color={URG_COLOR[selected.urg]} variant="light" size="xs">{selected.urg}</Badge>
                    <Badge color={ESTADO_COLOR[selected.estado]} variant="light" size="xs">{selected.estado}</Badge>
                  </Group>
                </Box>
                <Group gap="sm">
                  {selected.estado === 'Enviado' && (
                    <>
                      <Button size="xs" variant="default">Registrar respuesta</Button>
                      <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.escalamiento}>Re-escalar</Button>
                    </>
                  )}
                  <Button size="xs" variant="default" onClick={() => setSelected(null)}>Cerrar</Button>
                </Group>
              </Group>

              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab value="resumen">Resumen</Tabs.Tab>
                  <Tabs.Tab value="planes">Planes vinculados</Tabs.Tab>
                  <Tabs.Tab value="destinatarios">Destinatarios</Tabs.Tab>
                  <Tabs.Tab value="notificacion">Notificación enviada</Tabs.Tab>
                  <Tabs.Tab value="historial">Historial</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="resumen" pt="md">
                  <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
                    <Stack gap={8}>
                      <Box><Text size="xs" c="dimmed">Motivo del escalamiento</Text><Text size="xs">{selected.motivo}</Text></Box>
                      <Box><Text size="xs" c="dimmed">Urgencia</Text><Badge color={URG_COLOR[selected.urg]} variant="light" size="xs">{selected.urg}</Badge></Box>
                      {selected.ctx && <Box><Text size="xs" c="dimmed">Contexto para gerencia</Text><Text size="xs">{selected.ctx}</Text></Box>}
                      {selected.rec && <Box><Text size="xs" c="dimmed">Recursos / Decisión requerida</Text><Text size="xs">{selected.rec}</Text></Box>}
                    </Stack>
                    <Stack gap={8}>
                      <Box><Text size="xs" c="dimmed">Nueva fecha propuesta</Text><Text size="xs">{selected.nuevaFecha}</Text></Box>
                      <Box><Text size="xs" c="dimmed">Canal enviado</Text><Text size="xs">{selected.canal}</Text></Box>
                      <Box><Text size="xs" c="dimmed">Creado por</Text><Text size="xs">{selected.creador}</Text></Box>
                      <Box><Text size="xs" c="dimmed">Fecha de envío</Text><Text size="xs">{selected.fecha}</Text></Box>
                    </Stack>
                  </SimpleGrid>
                  {selected.respuesta ? (
                    <Box p="sm" style={{ background: '#EAF3DE', border: '0.5px solid #C0DD97', borderRadius: 8 }}>
                      <Text size="xs" fw={500} c="green" mb={4}>✓ Respuesta de {selected.respuesta.autor} · {selected.respuesta.fecha}</Text>
                      <Text size="xs">{selected.respuesta.texto}</Text>
                    </Box>
                  ) : selected.estado === 'Enviado' ? (
                    <Box p="sm" style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8 }}>
                      <Text size="xs" c="yellow">⏳ Esperando respuesta — Si no hay respuesta en 72h el sistema escalará automáticamente a Gerencia General.</Text>
                    </Box>
                  ) : null}
                </Tabs.Panel>

                <Tabs.Panel value="planes" pt="md">
                  <Stack gap={6}>
                    {selected.planes.map(p => (
                      <Group key={p.id} gap="sm" style={{ padding: '8px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Text size="xs" fw={500} c="blue" style={{ minWidth: 60 }}>{p.id}</Text>
                        <Box style={{ flex: 1 }}>
                          <Text size="xs">{p.n}</Text>
                          <Progress value={p.p} color={p.p === 100 ? 'green' : p.p < 30 ? 'red' : 'blue'} size="xs" mt={4} />
                        </Box>
                        <Badge color="red" variant="light" size="xs">{p.dias}d vencida</Badge>
                        <Badge variant="light" size="xs">{p.p}%</Badge>
                      </Group>
                    ))}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="destinatarios" pt="md">
                  <Stack gap={6}>
                    {selected.dests.map(d => (
                      <Group key={d.nombre} gap="sm" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Box style={{ width: 28, height: 28, borderRadius: '50%', background: d.color + '22', border: `0.5px solid ${d.color}44`, color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>{d.av}</Box>
                        <Box style={{ flex: 1 }}>
                          <Text size="xs" fw={500}>{d.nombre}</Text>
                          {d.oblig && <Badge color="red" variant="light" size="xs">Obligatorio</Badge>}
                        </Box>
                        <Badge color={d.estado === 'Respondido' ? 'green' : 'yellow'} variant="light" size="xs">{d.estado}</Badge>
                      </Group>
                    ))}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="notificacion" pt="md">
                  <Box p="md" style={{ background: 'var(--mantine-color-default-hover)', borderRadius: 8, fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {`ESCALAMIENTO FORMAL — ${selected.id}\nFecha: ${selected.fecha}\n\nEstimada ${selected.dest},\n\nSe notifica formalmente el vencimiento sin resolución de las siguientes acciones:\n\n${selected.planes.map(p => `· ${p.id} — ${p.n}\n  Días de retraso: ${p.dias} · Avance: ${p.p}%`).join('\n\n')}\n\nMotivo: ${selected.motivo}\nUrgencia: ${selected.urg}\n${selected.ctx ? '\nContexto:\n' + selected.ctx + '\n' : ''}${selected.rec ? '\nSe solicita: ' + selected.rec + '\n' : ''}\nNueva fecha propuesta: ${selected.nuevaFecha}\n\n— Terminal Risk Monitor`}
                  </Box>
                </Tabs.Panel>

                <Tabs.Panel value="historial" pt="md">
                  {selected.hist.length === 0
                    ? <Text size="xs" c="dimmed" fs="italic">Sin eventos registrados.</Text>
                    : (
                      <Stack gap={0}>
                        {selected.hist.map((h, i) => (
                          <Group key={i} gap="sm" align="flex-start" pb="sm">
                            <Box style={{ width: 9, height: 9, borderRadius: '50%', background: h.c, marginTop: 4, flexShrink: 0 }} />
                            <Box style={{ flex: 1 }}>
                              <Text size="xs" fw={500}>{h.a}</Text>
                              <Text size="xs" c="dimmed">{h.d}</Text>
                              <Text size="xs" c="dimmed">{h.t}</Text>
                            </Box>
                          </Group>
                        ))}
                      </Stack>
                    )
                  }
                </Tabs.Panel>
              </Tabs>
            </Surface>
          )}
        </Collapse>

        {/* Footer */}
        <Group justify="space-between" pt="xs" style={{ borderTop: '0.5px solid var(--mantine-color-default-border)' }}>
          <Text size="xs" c="dimmed">Terminal Risk Monitor v2.1 · Escalamientos automáticos activos</Text>
          <Group gap="sm">
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.seguimientoPlanes}>Tablero Kanban</Button>
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.reporteEjecutivo}>Reporte ejecutivo</Button>
          </Group>
        </Group>
      </Stack>
    </>
  );
}
