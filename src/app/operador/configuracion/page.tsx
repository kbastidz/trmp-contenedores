'use client';

import { useState } from 'react';
import {
  Anchor, Badge, Box, Button, Grid, Group, NumberInput, Select,
  SimpleGrid, Stack, Switch, Table, Text, TextInput, Textarea, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Configuración', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

type Section = 'terminal' | 'areas' | 'equipos' | 'matriz' | 'kri' | 'alertas' | 'canales' | 'auditoria' | 'integraciones';

const NAV_ITEMS: { section: Section; label: string; group: string }[] = [
  { section: 'terminal', label: 'Terminal', group: 'General' },
  { section: 'areas', label: 'Áreas y zonas', group: 'General' },
  { section: 'equipos', label: 'Equipos', group: 'General' },
  { section: 'matriz', label: 'Matriz de riesgo', group: 'Riesgos' },
  { section: 'kri', label: 'Umbrales KRI', group: 'Riesgos' },
  { section: 'alertas', label: 'Alertas', group: 'Notificaciones' },
  { section: 'canales', label: 'Canales', group: 'Notificaciones' },
  { section: 'auditoria', label: 'Auditoría', group: 'Sistema' },
  { section: 'integraciones', label: 'Integraciones', group: 'Sistema' },
];

const AREAS = [
  { name: 'Muelle / Operaciones de buque', color: '#378ADD', equipos: 6, riesgos: 5 },
  { name: 'Patio de contenedores (Yard)', color: '#EF9F27', equipos: 8, riesgos: 7 },
  { name: 'Gate / Portería', color: '#185FA5', equipos: 3, riesgos: 4 },
  { name: 'Taller y equipos', color: '#534AB7', equipos: 4, riesgos: 5 },
  { name: 'Seguridad ISPS / BASC', color: '#E24B4A', equipos: 2, riesgos: 3 },
  { name: 'Carga peligrosa IMDG', color: '#D85A30', equipos: 1, riesgos: 2 },
  { name: 'Sistemas TOS / IT', color: '#1D9E75', equipos: 5, riesgos: 2 },
  { name: 'Salud ocupacional / SSOMA', color: '#639922', equipos: 0, riesgos: 1 },
];

const EQUIPOS = [
  { cod: 'STS-1', name: 'Grúa Ship-to-Shore 1', area: 'Muelle', mtto: 30, est: 'OK', color: 'green' },
  { cod: 'STS-2', name: 'Grúa Ship-to-Shore 2', area: 'Muelle', mtto: 30, est: 'Vencido', color: 'red' },
  { cod: 'RTG-01', name: 'RTG Gantry 01', area: 'Patio Norte', mtto: 15, est: 'OK', color: 'green' },
  { cod: 'RTG-02', name: 'RTG Gantry 02', area: 'Patio Norte', mtto: 15, est: 'OK', color: 'green' },
  { cod: 'RTG-03', name: 'RTG Gantry 03', area: 'Patio Norte', mtto: 15, est: 'Vencido', color: 'red' },
  { cod: 'RTG-04', name: 'RTG Gantry 04', area: 'Patio Sur', mtto: 15, est: 'Alerta', color: 'yellow' },
];

const THRESHOLDS = [
  { nivel: 'Crítico', min: 17, max: 25, color: '#A32D2D', bg: '#FCEBEB' },
  { nivel: 'Alto', min: 10, max: 16, color: '#993C1D', bg: '#FAECE7' },
  { nivel: 'Medio', min: 5, max: 9, color: '#854F0B', bg: '#FAEEDA' },
  { nivel: 'Bajo', min: 1, max: 4, color: '#3B6D11', bg: '#EAF3DE' },
];

const KRIS_CONFIG = [
  { name: 'Cumplimiento mtto. preventivo', alerta: 85, critico: 70, unidad: '%' },
  { name: 'Disponibilidad de equipos', alerta: 90, critico: 80, unidad: '%' },
  { name: 'Tasa de incidentes (por 100k mov.)', alerta: 3.5, critico: 5.0, unidad: 'índice' },
  { name: 'Tiempo respuesta emergencia', alerta: 5, critico: 8, unidad: 'min' },
  { name: 'Inspecciones preoperacionales', alerta: 95, critico: 85, unidad: '%' },
  { name: 'Capacitaciones completadas', alerta: 85, critico: 70, unidad: '%' },
];

const ALERTAS = [
  { label: 'Nuevo riesgo nivel crítico registrado', on: true, canal: 'Email + SMS' },
  { label: 'KRI supera umbral de alerta', on: true, canal: 'Email' },
  { label: 'Acción de mitigación vencida sin respuesta', on: true, canal: 'Email + Sistema' },
  { label: 'Nuevo incidente grave o crítico', on: true, canal: 'Email + SMS' },
  { label: 'Plan de emergencia próximo a vencer', on: true, canal: 'Email' },
  { label: 'Reporte ejecutivo mensual generado', on: false, canal: 'Email' },
];

const INTEGRACIONES = [
  { name: 'TOS — Terminal Operating System', desc: 'Sincronización de movimientos y trazabilidad', estado: 'Conectado', color: 'green' },
  { name: 'ISPS — Sistema de seguridad portuaria', desc: 'Alertas de acceso y eventos de seguridad', estado: 'Conectado', color: 'green' },
  { name: 'ERP — Sistema de mantenimiento', desc: 'Órdenes de trabajo y estado de equipos', estado: 'Desconectado', color: 'red' },
  { name: 'RRHH — Sistema de personal', desc: 'Capacitaciones y certificaciones', estado: 'Parcial', color: 'yellow' },
];

const TIPOS = ['Seguridad industrial', 'Operacional / Proceso', 'Seguridad física', 'Ambiental', 'Tecnológico', 'Humano / Fatiga', 'Externo / Climático', 'Legal / Regulatorio'];

export default function Configuracion() {
  const [activeSection, setActiveSection] = useState<Section>('terminal');
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  const markChanged = () => { setHasChanges(true); setSaved(false); };
  const handleSave = () => { setHasChanges(false); setSaved(true); };

  const groups = [...new Set(NAV_ITEMS.map(n => n.group))];

  return (
    <>
      <title>Configuración | Operador</title>
      <PageHeader title="Configuración del Sistema" breadcrumbItems={breadcrumbs} />

      <Grid mt="md" gutter="md">
        {/* Sidenav */}
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Surface p="sm">
            {groups.map((group) => (
              <Box key={group} mb="xs">
                <Text size="xs" c="dimmed" fw={500} tt="uppercase" style={{ letterSpacing: '0.06em' }} px="xs" mb={4}>{group}</Text>
                {NAV_ITEMS.filter(n => n.group === group).map((item) => (
                  <Box key={item.section} onClick={() => setActiveSection(item.section)} px="xs" py={6} style={{ borderRadius: 6, cursor: 'pointer', background: activeSection === item.section ? 'var(--mantine-color-default-hover)' : 'transparent', fontWeight: activeSection === item.section ? 500 : 400 }}>
                    <Text size="xs" c={activeSection === item.section ? undefined : 'dimmed'}>{item.label}</Text>
                  </Box>
                ))}
              </Box>
            ))}
          </Surface>
        </Grid.Col>

        {/* Content */}
        <Grid.Col span={{ base: 12, sm: 9 }}>
          <Stack gap="md">

            {/* Terminal */}
            {activeSection === 'terminal' && (
              <>
                <Surface p="md">
                  <Text fw={500} size="sm" mb="md">Información del terminal</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                    <TextInput label="Nombre del terminal" defaultValue="Terminal Puerto Principal" onChange={markChanged} />
                    <TextInput label="Puerto / Ciudad" defaultValue="Puerto Principal · Guayaquil, EC" onChange={markChanged} />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                    <TextInput label="Código ISPS" defaultValue="ECGYE-TRM-001" onChange={markChanged} />
                    <TextInput label="Código BASC" defaultValue="BASC-EC-2024-0042" onChange={markChanged} />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} mb="sm">
                    <NumberInput label="Capacidad (TEUs/año)" defaultValue={420000} onChange={markChanged} />
                    <NumberInput label="Berths operativos" defaultValue={4} onChange={markChanged} />
                    <Select label="Turnos por día" defaultValue="3 turnos (8h)" data={['2 turnos (12h)', '3 turnos (8h)']} onChange={markChanged} />
                  </SimpleGrid>
                  <Select label="Zona horaria" defaultValue="America/Guayaquil (UTC-5)" data={['America/Guayaquil (UTC-5)', 'America/Bogota (UTC-5)', 'America/Lima (UTC-5)']} onChange={markChanged} />
                </Surface>
                <Surface p="md">
                  <Text fw={500} size="sm" mb="md">Preferencias del sistema</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                    <Select label="Idioma de la interfaz" defaultValue="Español" data={['Español', 'English']} onChange={markChanged} />
                    <Select label="Formato de fecha" defaultValue="DD/MM/YYYY" data={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} onChange={markChanged} />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
                    <Select label="Moneda" defaultValue="USD — Dólar americano" data={['USD — Dólar americano', 'EUR — Euro']} onChange={markChanged} />
                    <Select label="Frecuencia de reporte automático" defaultValue="Mensual" data={['Mensual', 'Quincenal', 'Semanal']} onChange={markChanged} />
                  </SimpleGrid>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Box><Text size="xs">Modo oscuro automático</Text><Text size="xs" c="dimmed">Adapta la interfaz al sistema operativo</Text></Box>
                      <Switch defaultChecked onChange={markChanged} />
                    </Group>
                    <Group justify="space-between">
                      <Box><Text size="xs">Actualizaciones en tiempo real</Text><Text size="xs" c="dimmed">Refresca el dashboard cada 60 segundos</Text></Box>
                      <Switch defaultChecked onChange={markChanged} />
                    </Group>
                  </Stack>
                </Surface>
              </>
            )}

            {/* Áreas */}
            {activeSection === 'areas' && (
              <>
                <Surface p="md">
                  <Group justify="space-between" mb="sm">
                    <Text fw={500} size="sm">Áreas operacionales</Text>
                    <Text size="xs" c="dimmed">8 configuradas</Text>
                  </Group>
                  <Stack gap={6}>
                    {AREAS.map((a) => (
                      <Group key={a.name} gap="sm" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Box style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                        <Text size="xs" style={{ flex: 1 }}>{a.name}</Text>
                        <Text size="xs" c="dimmed">{a.equipos} equipos · {a.riesgos} riesgos</Text>
                        <Button size="xs" variant="subtle">Editar</Button>
                      </Group>
                    ))}
                  </Stack>
                  <Button size="xs" variant="default" mt="sm">+ Agregar área</Button>
                </Surface>
                <Surface p="md">
                  <Text fw={500} size="sm" mb="sm">Tipos de riesgo</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Box>
                      <Text size="xs" c="dimmed" mb={6}>Tipos activos</Text>
                      <Stack gap={4}>
                        {TIPOS.map((t) => (
                          <Group key={t} gap="xs" style={{ padding: '4px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                            <Box style={{ width: 7, height: 7, borderRadius: '50%', background: '#185FA5', flexShrink: 0 }} />
                            <Text size="xs" style={{ flex: 1 }}>{t}</Text>
                            <Button size="xs" variant="subtle" color="red" p={0} style={{ minWidth: 20 }}>✕</Button>
                          </Group>
                        ))}
                      </Stack>
                    </Box>
                    <Box>
                      <TextInput label="Agregar nuevo tipo" placeholder="Nombre del tipo de riesgo" size="xs" mb="xs" />
                      <Text size="xs" c="dimmed" mb="xs">Ej: Ciberseguridad, Reputacional</Text>
                      <Button size="xs" variant="default">+ Agregar</Button>
                    </Box>
                  </SimpleGrid>
                </Surface>
              </>
            )}

            {/* Equipos */}
            {activeSection === 'equipos' && (
              <Surface p="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={500} size="sm">Registro de equipos críticos</Text>
                  <Text size="xs" c="dimmed">12 equipos</Text>
                </Group>
                <Table striped withTableBorder={false} fz="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Código</Table.Th>
                      <Table.Th>Equipo</Table.Th>
                      <Table.Th>Área</Table.Th>
                      <Table.Th ta="center">Mtto. (días)</Table.Th>
                      <Table.Th ta="center">Estado</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {EQUIPOS.map((e) => (
                      <Table.Tr key={e.cod}>
                        <Table.Td><Text size="xs" c="blue" fw={500}>{e.cod}</Text></Table.Td>
                        <Table.Td>{e.name}</Table.Td>
                        <Table.Td c="dimmed">{e.area}</Table.Td>
                        <Table.Td ta="center">{e.mtto}d</Table.Td>
                        <Table.Td ta="center"><Badge color={e.color} variant="light" size="xs">{e.est}</Badge></Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                <Button size="xs" variant="default" mt="sm">+ Agregar equipo</Button>
              </Surface>
            )}

            {/* Matriz */}
            {activeSection === 'matriz' && (
              <>
                <Surface p="md">
                  <Text fw={500} size="sm" mb="xs">Umbrales de la matriz de riesgo</Text>
                  <Text size="xs" c="dimmed" mb="sm">Define los rangos de puntuación para cada nivel de riesgo (Probabilidad × Impacto, escala 1–25)</Text>
                  <Stack gap={6}>
                    {THRESHOLDS.map((t) => (
                      <Group key={t.nivel} gap="sm">
                        <Box p="xs" style={{ background: t.bg, borderRadius: 6, minWidth: 80, textAlign: 'center' }}>
                          <Text size="xs" fw={500} style={{ color: t.color }}>{t.nivel}</Text>
                        </Box>
                        <Text size="xs" c="dimmed">Puntaje mínimo</Text>
                        <NumberInput defaultValue={t.min} size="xs" style={{ width: 70 }} onChange={markChanged} />
                        <Text size="xs" c="dimmed">máximo</Text>
                        <NumberInput defaultValue={t.max} size="xs" style={{ width: 70 }} onChange={markChanged} />
                      </Group>
                    ))}
                  </Stack>
                </Surface>
                <Surface p="md">
                  <Text fw={500} size="sm" mb="sm">Configuración de revisiones periódicas</Text>
                  <SimpleGrid cols={{ base: 1, sm: 3 }}>
                    <Select label="Riesgos críticos — cada" defaultValue="15 días" data={['7 días', '15 días', '30 días']} onChange={markChanged} />
                    <Select label="Riesgos altos — cada" defaultValue="30 días" data={['15 días', '30 días', '60 días']} onChange={markChanged} />
                    <Select label="Riesgos medios/bajos — cada" defaultValue="60 días" data={['30 días', '60 días', '90 días']} onChange={markChanged} />
                  </SimpleGrid>
                </Surface>
              </>
            )}

            {/* KRI */}
            {activeSection === 'kri' && (
              <Surface p="md">
                <Text fw={500} size="sm" mb="xs">Umbrales de indicadores KRI</Text>
                <Text size="xs" c="dimmed" mb="sm">Configura los valores mínimos y máximos aceptables para cada indicador. Al superar el umbral se generará una alerta automática.</Text>
                <Table withTableBorder={false} fz="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Indicador</Table.Th>
                      <Table.Th ta="center">Alerta</Table.Th>
                      <Table.Th ta="center">Crítico</Table.Th>
                      <Table.Th ta="center">Unidad</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {KRIS_CONFIG.map((k) => (
                      <Table.Tr key={k.name}>
                        <Table.Td>{k.name}</Table.Td>
                        <Table.Td ta="center"><NumberInput defaultValue={k.alerta} size="xs" style={{ width: 70 }} onChange={markChanged} /></Table.Td>
                        <Table.Td ta="center"><NumberInput defaultValue={k.critico} size="xs" style={{ width: 70 }} onChange={markChanged} /></Table.Td>
                        <Table.Td ta="center" c="dimmed">{k.unidad}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                <Button size="xs" variant="default" mt="sm">+ Agregar KRI</Button>
              </Surface>
            )}

            {/* Alertas */}
            {activeSection === 'alertas' && (
              <>
                <Surface p="md">
                  <Text fw={500} size="sm" mb="sm">Reglas de alerta automática</Text>
                  <Stack gap={6}>
                    {ALERTAS.map((a) => (
                      <Group key={a.label} justify="space-between" style={{ padding: '8px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Box>
                          <Text size="xs">{a.label}</Text>
                          <Text size="xs" c="dimmed">{a.canal}</Text>
                        </Box>
                        <Switch defaultChecked={a.on} onChange={markChanged} />
                      </Group>
                    ))}
                  </Stack>
                </Surface>
                <Surface p="md">
                  <Text fw={500} size="sm" mb="md">Escalamiento automático</Text>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
                    <Select label="Escalar a gerencia si acción vence sin respuesta en" defaultValue="48 horas" data={['24 horas', '48 horas', '72 horas']} onChange={markChanged} />
                    <Select label="Escalar a gerencia general si no hay respuesta en" defaultValue="72 horas" data={['72 horas', '5 días', '7 días']} onChange={markChanged} />
                  </SimpleGrid>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Box><Text size="xs">Escalamiento automático activo</Text><Text size="xs" c="dimmed">El sistema escala sin intervención manual si no hay respuesta</Text></Box>
                      <Switch defaultChecked onChange={markChanged} />
                    </Group>
                    <Group justify="space-between">
                      <Box><Text size="xs">Notificar a autoridad portuaria en incidentes críticos</Text><Text size="xs" c="dimmed">Envío automático de notificación regulatoria</Text></Box>
                      <Switch onChange={markChanged} />
                    </Group>
                  </Stack>
                </Surface>
              </>
            )}

            {/* Canales */}
            {activeSection === 'canales' && (
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Destinatarios por nivel de alerta</Text>
                <Stack gap="sm">
                  <Textarea label="Alerta crítica — notificar a" defaultValue="gerencia@terminal.com; ssoma@terminal.com; mantenimiento@terminal.com" minRows={2} onChange={markChanged} />
                  <Textarea label="Alerta alta — notificar a" defaultValue="jefaturas@terminal.com; supervisores@terminal.com" minRows={2} onChange={markChanged} />
                  <Textarea label="Reporte ejecutivo mensual — distribuir a" defaultValue="gerenciageneral@terminal.com; gerenciaoperaciones@terminal.com; auditoria@terminal.com" minRows={2} onChange={markChanged} />
                </Stack>
              </Surface>
            )}

            {/* Auditoría */}
            {activeSection === 'auditoria' && (
              <Surface p="md">
                <Text fw={500} size="sm" mb="md">Configuración de auditoría</Text>
                <Stack gap="sm" mb="md">
                  {[
                    { label: 'Registro de auditoría activo', sub: 'Guarda cada cambio con usuario, fecha y acción', on: true },
                    { label: 'Registrar accesos al sistema', sub: 'Loguea cada inicio y cierre de sesión', on: true },
                    { label: 'Registrar exportaciones de datos', sub: 'Audita descargas de Excel y PDF', on: false },
                  ].map((s) => (
                    <Group key={s.label} justify="space-between" style={{ padding: '8px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                      <Box><Text size="xs">{s.label}</Text><Text size="xs" c="dimmed">{s.sub}</Text></Box>
                      <Switch defaultChecked={s.on} onChange={markChanged} />
                    </Group>
                  ))}
                </Stack>
                <SimpleGrid cols={{ base: 1, sm: 2 }} mb="sm">
                  <Select label="Retención de logs" defaultValue="1 año" data={['6 meses', '1 año', '2 años', 'Indefinido']} onChange={markChanged} />
                  <Select label="Exportar logs de auditoría" defaultValue="Último año" data={['Último mes', 'Últimos 3 meses', 'Último año']} />
                </SimpleGrid>
                <Button size="xs" variant="default">Exportar log</Button>
              </Surface>
            )}

            {/* Integraciones */}
            {activeSection === 'integraciones' && (
              <>
                <Surface p="md">
                  <Text fw={500} size="sm" mb="sm">Integraciones disponibles</Text>
                  <Stack gap={6}>
                    {INTEGRACIONES.map((i) => (
                      <Group key={i.name} justify="space-between" style={{ padding: '8px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Box>
                          <Text size="xs" fw={500}>{i.name}</Text>
                          <Text size="xs" c="dimmed">{i.desc}</Text>
                        </Box>
                        <Group gap="sm">
                          <Badge color={i.color} variant="light" size="xs">{i.estado}</Badge>
                          <Button size="xs" variant="subtle">{i.estado === 'Conectado' ? 'Configurar' : 'Conectar'}</Button>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                </Surface>
                <Surface p="md">
                  <Text fw={500} size="sm" mb="md">API del sistema</Text>
                  <Box mb="sm">
                    <Text size="xs" c="dimmed" mb={4}>API Key</Text>
                    <Group gap="sm">
                      <TextInput defaultValue="trm_live_sk_xxxxxxxxxxxxxxxxxxxxxxxx" type="password" style={{ flex: 1, fontFamily: 'monospace' }} size="xs" />
                      <Button size="xs" variant="default">Regenerar</Button>
                    </Group>
                    <Text size="xs" c="dimmed" mt={4}>Nunca compartas tu API Key. Se usa para conectar sistemas externos al TRM.</Text>
                  </Box>
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <TextInput label="Webhook URL (incidentes)" placeholder="https://tu-sistema.com/webhook/incidentes" size="xs" onChange={markChanged} />
                    <TextInput label="Webhook URL (alertas)" placeholder="https://tu-sistema.com/webhook/alertas" size="xs" onChange={markChanged} />
                  </SimpleGrid>
                </Surface>
              </>
            )}

            {/* Save bar */}
            <Surface p="sm">
              <Group justify="space-between">
                {hasChanges && <Text size="xs" c="yellow">Tienes cambios sin guardar</Text>}
                {saved && <Text size="xs" c="green">Configuración guardada correctamente</Text>}
                {!hasChanges && !saved && <Box />}
                <Group gap="sm">
                  <Button size="xs" variant="default" onClick={() => { setHasChanges(false); setSaved(false); }}>Descartar cambios</Button>
                  <Button size="xs" onClick={handleSave}>Guardar configuración</Button>
                </Group>
              </Group>
            </Surface>

          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
