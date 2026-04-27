'use client';

import { useState } from 'react';
import {
  Anchor, Badge, Box, Button, Collapse, Group, Grid, Select, SimpleGrid,
  Stack, Table, Tabs, Text, TextInput, Title, Progress,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Gestión de Incidentes', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const METRICS = [
  { label: 'Total incidentes (2026)', value: '63', sub: 'Ene – Abr' },
  { label: 'Este mes (Abril)', value: '17', sub: '▲ 3 vs marzo', color: 'yellow' },
  { label: 'Críticos / Graves', value: '7', sub: '11% del total', color: 'red' },
  { label: 'Cerrados con RCA', value: '48', sub: '76% del total', color: 'green' },
  { label: 'Días sin accidentes', value: '4', sub: 'Último: 12/04', color: 'blue' },
];

const AREA_STATS = [
  { label: 'Patio / Yard', val: 8, max: 17, color: 'red' },
  { label: 'Muelle / Buque', val: 4, max: 17, color: 'yellow' },
  { label: 'Taller / Equipos', val: 3, max: 17, color: 'yellow' },
  { label: 'Gate / Portería', val: 2, max: 17, color: 'blue' },
  { label: 'Seg. ISPS', val: 1, max: 17, color: 'green' },
];

const INCIDENTS = [
  { id: 'INC-2026-018', sev: 'Crítico', sevColor: 'red', desc: 'Intento acceso no autorizado zona ISPS norte', area: 'Seg. ISPS', fecha: '16/04', turno: 'Noche', estado: 'En análisis', estColor: 'yellow' },
  { id: 'INC-2026-017', sev: 'Grave', sevColor: 'orange', desc: 'Fallo hidráulico RTG-03 durante apilamiento 40\'', area: 'Patio', fecha: '15/04', turno: 'Día', estado: 'Con plan', estColor: 'blue' },
  { id: 'INC-2026-016', sev: 'Moderado', sevColor: 'yellow', desc: 'Retraso operacional por viento > 45 km/h grúa STS', area: 'Muelle', fecha: '14/04', turno: 'Día', estado: 'Cerrado', estColor: 'green' },
  { id: 'INC-2026-015', sev: 'Leve', sevColor: 'green', desc: 'Contenedor con daño estructural detectado en gate', area: 'Gate', fecha: '13/04', turno: 'Día', estado: 'Cerrado', estColor: 'green' },
  { id: 'INC-2026-014', sev: 'Grave', sevColor: 'orange', desc: 'Derrame de lubricante hidráulico en taller equipos', area: 'Taller', fecha: '12/04', turno: 'Noche', estado: 'Cerrado', estColor: 'green' },
  { id: 'INC-2026-013', sev: 'Moderado', sevColor: 'yellow', desc: 'Falla de lector RFID en gate — congestión de camiones', area: 'Gate', fecha: '11/04', turno: 'Día', estado: 'Cerrado', estColor: 'green' },
  { id: 'INC-2026-012', sev: 'Crítico', sevColor: 'red', desc: 'Near miss — reach stacker casi atropella a peatón', area: 'Patio', fecha: '10/04', turno: 'Noche', estado: 'Con plan', estColor: 'blue' },
  { id: 'INC-2026-011', sev: 'Grave', sevColor: 'orange', desc: 'Detención no planificada grúa STS-2 por recalentamiento', area: 'Muelle', fecha: '09/04', turno: 'Día', estado: 'Con plan', estColor: 'blue' },
  { id: 'INC-2026-010', sev: 'Leve', sevColor: 'green', desc: 'EPP inadecuado detectado en inspección de patio', area: 'Patio', fecha: '08/04', turno: 'Día', estado: 'Cerrado', estColor: 'green' },
  { id: 'INC-2026-009', sev: 'Moderado', sevColor: 'yellow', desc: 'Contenedor apilado incorrectamente bloque B-12', area: 'Patio', fecha: '07/04', turno: 'Noche', estado: 'Abierto', estColor: 'red' },
];

const HISTORIAL = [
  { action: 'Incidente registrado en sistema', detail: 'Registro inicial por operador de turno Carlos Vera', time: '16/04/2026 · 02:41h', color: 'blue' },
  { action: 'Policía portuaria notificada', detail: 'Se activó protocolo ISPS nivel 2. Unidad llegó a las 03:05h', time: '16/04/2026 · 02:41h', color: 'red' },
  { action: 'Área asegurada y evidencia recopilada', detail: 'Fotografías, registros de cámara C-07 y sensor capturados', time: '16/04/2026 · 03:20h', color: 'blue' },
  { action: 'Análisis de causa raíz iniciado', detail: 'Jefe de Seguridad ISPS inicia investigación formal', time: '16/04/2026 · 08:00h', color: 'yellow' },
  { action: 'Ronda nocturna sector norte reprogramada', detail: 'Acción correctiva inmediata ejecutada', time: '16/04/2026 · 09:30h', color: 'green' },
];

export default function GestionIncidentes() {
  const [selectedInc, setSelectedInc] = useState<typeof INCIDENTS[0] | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('resumen');

  const filtered = INCIDENTS.filter(inc =>
    inc.desc.toLowerCase().includes(search.toLowerCase()) ||
    inc.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <title>Gestión de Incidentes | Operador</title>
      <PageHeader
        title="Gestión de Incidentes"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            <Button size="xs" component="a" href={PATH_OPERADOR.registroIncidente}>+ Nuevo incidente</Button>
            <Button size="xs" variant="default">Exportar</Button>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Métricas */}
        <SimpleGrid cols={{ base: 2, sm: 5 }}>
          {METRICS.map((m) => (
            <Surface key={m.label} p="md">
              <Text size="xs" c="dimmed">{m.label}</Text>
              <Title order={3} c={m.color}>{m.value}</Title>
              <Text size="xs" c="dimmed">{m.sub}</Text>
            </Surface>
          ))}
        </SimpleGrid>

        {/* Estadísticas */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Incidentes por área (2026)</Text>
              <Stack gap={6}>
                {AREA_STATS.map((a) => (
                  <Group key={a.label} gap="xs" wrap="nowrap">
                    <Text size="xs" style={{ minWidth: 130 }}>{a.label}</Text>
                    <Progress value={(a.val / a.max) * 100} color={a.color} size="xs" style={{ flex: 1 }} />
                    <Text size="xs" fw={500} style={{ minWidth: 20, textAlign: 'right' }}>{a.val}</Text>
                  </Group>
                ))}
              </Stack>
            </Surface>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Surface p="md" h="100%">
              <Text fw={500} size="sm" mb="sm">Por severidad &amp; estado</Text>
              <Group align="flex-start" gap="xl">
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" mb={4}>Severidad</Text>
                  {[['Crítico','red','2'],['Grave','orange','5'],['Moderado','yellow','6'],['Leve','green','4']].map(([l,c,v]) => (
                    <Group key={l} justify="space-between" gap="xs">
                      <Text size="xs">{l}</Text>
                      <Badge color={c} variant="light" size="xs">{v}</Badge>
                    </Group>
                  ))}
                </Stack>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" mb={4}>Estado</Text>
                  {[['Abierto','red','3'],['En análisis','yellow','5'],['Con plan','blue','4'],['Cerrado','green','5']].map(([l,c,v]) => (
                    <Group key={l} justify="space-between" gap="xs">
                      <Text size="xs">{l}</Text>
                      <Badge color={c} variant="light" size="xs">{v}</Badge>
                    </Group>
                  ))}
                </Stack>
              </Group>
            </Surface>
          </Grid.Col>
        </Grid>

        {/* Filtros y tabla */}
        <Surface p="md">
          <Group mb="sm" gap="sm" wrap="wrap">
            <TextInput placeholder="Buscar incidente..." size="xs" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 200 }} />
            <Select size="xs" placeholder="Todas las áreas" data={['Patio / Yard','Muelle / Buque','Taller / Equipos','Gate / Portería','Seg. ISPS']} clearable style={{ width: 160 }} />
            <Select size="xs" placeholder="Todos los turnos" data={['Turno día','Turno noche']} clearable style={{ width: 140 }} />
          </Group>
          <Table striped highlightOnHover withTableBorder={false} fz="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Sev.</Table.Th>
                <Table.Th>Descripción</Table.Th>
                <Table.Th>Área</Table.Th>
                <Table.Th>Fecha</Table.Th>
                <Table.Th>Turno</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Acción</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((inc) => (
                <Table.Tr key={inc.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedInc(inc)}>
                  <Table.Td><Text size="xs" c="dimmed">{inc.id}</Text></Table.Td>
                  <Table.Td><Box style={{ width: 8, height: 8, borderRadius: '50%', background: inc.sevColor === 'red' ? '#A32D2D' : inc.sevColor === 'orange' ? '#993C1D' : inc.sevColor === 'yellow' ? '#EF9F27' : '#639922' }} /></Table.Td>
                  <Table.Td style={{ maxWidth: 280 }}><Text size="xs" lineClamp={1}>{inc.desc}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{inc.area}</Text></Table.Td>
                  <Table.Td><Text size="xs">{inc.fecha}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{inc.turno}</Text></Table.Td>
                  <Table.Td><Badge color={inc.estColor} variant="light" size="xs">{inc.estado}</Badge></Table.Td>
                  <Table.Td><Text size="xs" c="blue" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSelectedInc(inc); }}>Ver detalle</Text></Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="subtle"
                      component="a"
                      href={PATH_OPERADOR.editarIncidente}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Editar
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Surface>

        {/* Panel de detalle */}
        <Collapse in={!!selectedInc}>
          {selectedInc && (
            <Surface p="md">
              <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                <Box>
                  <Text size="xs" c="dimmed">{selectedInc.id}</Text>
                  <Text fw={500}>{selectedInc.desc}</Text>
                  <Group gap="xs" mt={6}>
                    <Badge color={selectedInc.sevColor} variant="light" size="xs">{selectedInc.sev}</Badge>
                    <Badge color={selectedInc.estColor} variant="light" size="xs">{selectedInc.estado}</Badge>
                    <Badge color="blue" variant="light" size="xs">{selectedInc.area}</Badge>
                  </Group>
                </Box>
                <Button size="xs" variant="default" onClick={() => setSelectedInc(null)}>Cerrar</Button>
              </Group>

              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab value="resumen">Resumen</Tabs.Tab>
                  <Tabs.Tab value="rca">Causa raíz</Tabs.Tab>
                  <Tabs.Tab value="acciones">Acciones</Tabs.Tab>
                  <Tabs.Tab value="historial">Historial</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="resumen" pt="md">
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Stack gap={8}>
                      <Box><Text size="xs" c="dimmed">Área / Equipo</Text><Text size="sm">{selectedInc.area} · Sin equipo involucrado</Text></Box>
                      <Box><Text size="xs" c="dimmed">Turno y fecha</Text><Text size="sm">Turno {selectedInc.turno} · {selectedInc.fecha}/2026</Text></Box>
                      <Box><Text size="xs" c="dimmed">Reportado por</Text><Text size="sm">Central de monitoreo</Text></Box>
                    </Stack>
                    <Stack gap={8}>
                      <Box><Text size="xs" c="dimmed">Lesionados</Text><Text size="sm">Ninguno</Text></Box>
                      <Box><Text size="xs" c="dimmed">Daño económico estimado</Text><Text size="sm">Sin daño económico directo</Text></Box>
                      <Box><Text size="xs" c="dimmed">Impacto operacional</Text><Text size="sm">Sin interrupción operativa</Text></Box>
                    </Stack>
                  </SimpleGrid>
                </Tabs.Panel>

                <Tabs.Panel value="rca" pt="md">
                  <Stack gap={6}>
                    {[
                      ['Metodología', '5 Porqués'],
                      ['Causa inmediata', 'Sensor perimetral sector norte con cobertura parcial — área ciega de 4m sin detección'],
                      ['Causa raíz', 'Presupuesto de actualización de infraestructura ISPS no fue aprobado en Q1'],
                      ['Factores contribuyentes', 'Turno nocturno con menor dotación de vigilantes'],
                      ['¿Podría repetirse?', 'Sí, sin corrección de cobertura perimetral'],
                    ].map(([k, v]) => (
                      <Group key={k} gap="md" align="flex-start" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Text size="xs" c="dimmed" style={{ minWidth: 160 }}>{k}</Text>
                        <Text size="xs" style={{ flex: 1 }}>{v}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="acciones" pt="md">
                  <Stack gap={4}>
                    {[
                      { accion: 'Auditoría completa cobertura sensores perimetrales', resp: 'Jef. Seg. ISPS', fecha: '20/04', estado: 'En curso', color: 'blue' },
                      { accion: 'Programar rondas nocturnas 01:00–03:00h sector norte', resp: 'Sup. Turno', fecha: '18/04', estado: 'Cerrada', color: 'green' },
                      { accion: 'Solicitud presupuesto actualización sensores Q2', resp: 'Gerencia Ops', fecha: '30/04', estado: 'Pendiente', color: 'yellow' },
                    ].map((a) => (
                      <Group key={a.accion} justify="space-between" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Text size="xs" style={{ flex: 1 }}>{a.accion}</Text>
                        <Text size="xs" c="dimmed" style={{ width: 100 }}>{a.resp}</Text>
                        <Text size="xs" c="dimmed" style={{ width: 50 }}>{a.fecha}</Text>
                        <Badge color={a.color} variant="light" size="xs">{a.estado}</Badge>
                      </Group>
                    ))}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="historial" pt="md">
                  <Stack gap={0}>
                    {HISTORIAL.map((h, i) => (
                      <Group key={i} gap="sm" align="flex-start" pb="sm">
                        <Box style={{ width: 10, height: 10, borderRadius: '50%', background: h.color === 'blue' ? '#378ADD' : h.color === 'red' ? '#E24B4A' : h.color === 'green' ? '#639922' : '#EF9F27', marginTop: 4, flexShrink: 0 }} />
                        <Box style={{ flex: 1 }}>
                          <Text size="xs" fw={500}>{h.action}</Text>
                          <Text size="xs" c="dimmed">{h.detail}</Text>
                          <Text size="xs" c="dimmed">{h.time}</Text>
                        </Box>
                      </Group>
                    ))}
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Surface>
          )}
        </Collapse>
      </Stack>
    </>
  );
}


