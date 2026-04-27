'use client';

import {
  Anchor, Badge, Box, Button, Group, Progress, SimpleGrid,
  Stack, Table, Text, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Reporte Ejecutivo', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const METRICS = [
  { label: 'Riesgos activos', value: '24', delta: '▲ 2 vs marzo', deltaColor: 'red' },
  { label: 'Riesgos críticos', value: '6', delta: '▲ 1 vs marzo', deltaColor: 'red', valueColor: 'red' },
  { label: 'Incidentes (mes)', value: '17', delta: '▲ 3 vs marzo', deltaColor: 'red' },
  { label: 'Controles efectivos', value: '87%', delta: '▼ 2% vs marzo', deltaColor: 'green' },
  { label: 'Acciones vencidas', value: '2', delta: '= sin cambio', deltaColor: 'dimmed', valueColor: 'yellow' },
];

const AREAS = [
  { label: 'Muelle / Buque', riesgos: 5, criticos: 2, color: 'red', nivel: 'Alto' },
  { label: 'Patio / Yard', riesgos: 7, criticos: 3, color: 'yellow', nivel: 'Medio-Alto' },
  { label: 'Gate / Portería', riesgos: 4, criticos: 0, color: 'blue', nivel: 'Medio' },
  { label: 'Taller / Equipos', riesgos: 5, criticos: 1, color: 'yellow', nivel: 'Medio' },
  { label: 'Seg. ISPS / BASC', riesgos: 3, criticos: 0, color: 'green', nivel: 'Bajo' },
];

const TOP_RISKS = [
  { name: 'Caída de contenedor en RTG', area: 'Patio', score: 20, color: 'red' },
  { name: 'Falla grúa STS en buque', area: 'Muelle', score: 20, color: 'red' },
  { name: 'Incendio carga IMDG clase 3', area: 'Patio', score: 15, color: 'orange' },
  { name: 'Acceso no autorizado zona ISPS', area: 'Seguridad', score: 12, color: 'orange' },
  { name: 'Falla TOS — pérdida trazabilidad', area: 'Sistemas', score: 12, color: 'orange' },
  { name: 'Atropello por reach stacker', area: 'Patio', score: 10, color: 'yellow' },
];

const INCIDENTS_BY_AREA = [
  { label: 'Patio / Yard', val: 8, max: 17, color: 'red' },
  { label: 'Muelle / Buque', val: 4, max: 17, color: 'yellow' },
  { label: 'Taller / Equipos', val: 3, max: 17, color: 'yellow' },
  { label: 'Gate / Portería', val: 2, max: 17, color: 'blue' },
  { label: 'Seg. ISPS', val: 1, max: 17, color: 'green' },
];

const KRIS = [
  { name: 'Movimientos/hora (promedio grúas)', value: '23.4 mov/h', umbral: '≥ 20', estado: 'OK', color: 'green' },
  { name: 'Tasa de incidentes (por 100k mov.)', value: '4.2', umbral: '≤ 3.0', estado: 'Alerta', color: 'yellow' },
  { name: 'Disponibilidad de equipos críticos', value: '91%', umbral: '≥ 93%', estado: 'Alerta', color: 'yellow' },
  { name: 'Tiempo promedio respuesta emergencia', value: '4.5 min', umbral: '≤ 5 min', estado: 'OK', color: 'green' },
  { name: 'Cumplimiento mantenimiento preventivo', value: '74%', umbral: '≥ 90%', estado: 'Crítico', color: 'red' },
  { name: 'Capacitaciones completadas (% plan)', value: '88%', umbral: '≥ 85%', estado: 'OK', color: 'green' },
  { name: 'Riesgos sin control asignado', value: '3', umbral: '= 0', estado: 'Alto', color: 'orange' },
];

const TENDENCIAS = [
  { text: 'Aumento de incidentes en patio de contenedores, concentrado en operaciones nocturnas del RTG — posible relación con fatiga de operadores.', color: 'red' },
  { text: 'Cumplimiento de mantenimiento preventivo cayó a 74%, el nivel más bajo en 6 meses, correlacionado con incremento de fallas de equipos.', color: 'red' },
  { text: 'Disponibilidad de grúas STS por debajo del umbral mínimo por segundo mes consecutivo — requiere plan de acción inmediato.', color: 'yellow' },
  { text: 'Tiempo de respuesta a emergencias se mantiene dentro del umbral aceptable (4.5 min promedio vs límite de 5 min).', color: 'green' },
  { text: 'Área ISPS/BASC sin incidentes críticos por tercer mes consecutivo — controles de acceso funcionan correctamente.', color: 'green' },
];

const RECOMENDACIONES = [
  { num: '01', text: 'Priorizar plan de recuperación del mantenimiento preventivo de RTG con cronograma de choque para mayo, asignando presupuesto extraordinario.', color: 'red', label: 'Urgente' },
  { num: '02', text: 'Implementar rotación de turnos o pausas obligatorias para operadores nocturnos de patio, evaluando impacto en tasa de incidentes.', color: 'orange', label: 'Alta' },
  { num: '03', text: 'Asignar responsables y controles a los 3 riesgos actualmente sin cobertura antes del cierre de abril.', color: 'orange', label: 'Alta' },
  { num: '04', text: 'Revisar disponibilidad contractual de grúas STS con proveedor; analizar si se requiere equipo de respaldo temporal.', color: 'yellow', label: 'Media' },
  { num: '05', text: 'Programar simulacro de respuesta a incidente IMDG (carga peligrosa) para Q2 — último simulacro fue hace más de 6 meses.', color: 'yellow', label: 'Media' },
];

const ACCIONES_MES = [
  { accion: 'Instalar sensor de carga en gancho RTG-03', resp: 'Jef. Mtto.', vence: '15/04', estado: 'Cerrado', color: 'green' },
  { accion: 'Actualizar POE de operaciones nocturnas', resp: 'Sup. Patio', vence: '10/04', estado: 'Cerrado', color: 'green' },
  { accion: 'Capacitar operadores en IMDG clase 3', resp: 'RRHH', vence: '30/04', estado: 'En curso', color: 'blue' },
  { accion: 'Revisión integral del plan de emergencia portuaria', resp: 'Seg. Ind.', vence: '05/04', estado: 'Vencida', color: 'red' },
  { accion: 'Mantenimiento correctivo grúa STS-2', resp: 'Jef. Mtto.', vence: '01/04', estado: 'Vencida', color: 'red' },
];

export default function ReporteEjecutivo() {
  return (
    <>
      <title>Reporte Ejecutivo | Operador</title>
      <PageHeader
        title="Reporte Ejecutivo de Riesgos"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            <Button size="xs" variant="default">Exportar PDF</Button>
            <Button size="xs" variant="default" component="a" href={PATH_OPERADOR.seguimientoPlanes}>Plan de mitigación</Button>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Header del reporte */}
        <Surface p="md">
          <Group justify="space-between">
            <Box>
              <Text fw={500}>Terminal Risk Monitor</Text>
              <Text size="xs" c="dimmed">Puerto Principal · Guayaquil</Text>
            </Box>
            <Box ta="right">
              <Text fw={500} size="sm">Reporte ejecutivo de riesgos</Text>
              <Text size="xs" c="dimmed">Período: Abril 2026 · Generado: 16/04/2026</Text>
              <Badge color="yellow" variant="light" mt={4}>Nivel de riesgo global: Medio-Alto</Badge>
            </Box>
          </Group>
        </Surface>

        {/* Métricas */}
        <SimpleGrid cols={{ base: 2, sm: 5 }}>
          {METRICS.map((m) => (
            <Surface key={m.label} p="md">
              <Text size="xs" c="dimmed">{m.label}</Text>
              <Title order={3} c={m.valueColor}>{m.value}</Title>
              <Text size="xs" c={m.deltaColor}>{m.delta}</Text>
            </Surface>
          ))}
        </SimpleGrid>

        {/* Semáforo por área */}
        <Surface p="md">
          <Group justify="space-between" mb="sm">
            <Text fw={500} size="sm">Semáforo de riesgo por área</Text>
            <Text size="xs" c="dimmed">Estado al cierre del período</Text>
          </Group>
          <SimpleGrid cols={{ base: 2, sm: 5 }}>
            {AREAS.map((a) => (
              <Box key={a.label} p="sm" style={{ border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 8, textAlign: 'center' }}>
                <Box style={{ width: 14, height: 14, borderRadius: '50%', background: a.color === 'red' ? '#E24B4A' : a.color === 'yellow' ? '#EF9F27' : a.color === 'blue' ? '#378ADD' : '#639922', margin: '0 auto 6px' }} />
                <Text size="xs" fw={500}>{a.label}</Text>
                <Text size="xs" c="dimmed">{a.riesgos} riesgos · {a.criticos} críticos</Text>
                <Badge color={a.color} variant="light" size="xs" mt={4}>{a.nivel}</Badge>
              </Box>
            ))}
          </SimpleGrid>
        </Surface>

        {/* Top riesgos + Incidentes por área */}
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Surface p="md">
            <Text fw={500} size="sm" mb="sm">Top 6 riesgos críticos</Text>
            <Stack gap={0}>
              {TOP_RISKS.map((r) => (
                <Group key={r.name} gap="xs" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                  <Box style={{ width: 8, height: 8, borderRadius: '50%', background: r.color === 'red' ? '#A32D2D' : r.color === 'orange' ? '#993C1D' : '#BA7517', flexShrink: 0 }} />
                  <Text size="xs" style={{ flex: 1 }} lineClamp={1}>{r.name}</Text>
                  <Badge color={r.color} variant="light" size="xs">{r.score}</Badge>
                  <Text size="xs" c="dimmed" style={{ width: 70, textAlign: 'right' }}>{r.area}</Text>
                </Group>
              ))}
            </Stack>
          </Surface>

          <Surface p="md">
            <Text fw={500} size="sm" mb="sm">Incidentes por área <Text span size="xs" c="dimmed">17 total</Text></Text>
            <Stack gap={6} mb="md">
              {INCIDENTS_BY_AREA.map((a) => (
                <Group key={a.label} gap="xs" wrap="nowrap">
                  <Text size="xs" style={{ minWidth: 120 }}>{a.label}</Text>
                  <Progress value={(a.val / a.max) * 100} color={a.color} size="xs" style={{ flex: 1 }} />
                  <Text size="xs" fw={500} style={{ minWidth: 20, textAlign: 'right' }}>{a.val}</Text>
                </Group>
              ))}
            </Stack>
            <Text size="xs" c="dimmed" mb={6}>Por severidad</Text>
            <SimpleGrid cols={3}>
              <Box p="xs" style={{ background: '#FCEBEB', borderRadius: 6, textAlign: 'center' }}><Title order={4} c="red">2</Title><Text size="xs" c="red">Críticos</Text></Box>
              <Box p="xs" style={{ background: '#FAECE7', borderRadius: 6, textAlign: 'center' }}><Title order={4} c="orange">5</Title><Text size="xs" c="orange">Graves</Text></Box>
              <Box p="xs" style={{ background: '#EAF3DE', borderRadius: 6, textAlign: 'center' }}><Title order={4} c="green">10</Title><Text size="xs" c="green">Leves</Text></Box>
            </SimpleGrid>
          </Surface>
        </SimpleGrid>

        {/* KRIs */}
        <Surface p="md">
          <Text fw={500} size="sm" mb="sm">Indicadores clave de riesgo (KRI) — estado del mes</Text>
          <Table striped withTableBorder={false} fz="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Indicador</Table.Th>
                <Table.Th ta="center">Valor actual</Table.Th>
                <Table.Th ta="center">Umbral</Table.Th>
                <Table.Th ta="right">Estado</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {KRIS.map((k) => (
                <Table.Tr key={k.name}>
                  <Table.Td>{k.name}</Table.Td>
                  <Table.Td ta="center" fw={500} c={k.color}>{k.value}</Table.Td>
                  <Table.Td ta="center" c="dimmed">{k.umbral}</Table.Td>
                  <Table.Td ta="right"><Badge color={k.color} variant="light" size="xs">{k.estado}</Badge></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Surface>

        {/* Tendencias + Recomendaciones */}
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Surface p="md">
            <Text fw={500} size="sm" mb="sm">Tendencias observadas</Text>
            <Stack gap={0}>
              {TENDENCIAS.map((t, i) => (
                <Group key={i} gap="sm" align="flex-start" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                  <Box style={{ width: 6, height: 6, borderRadius: '50%', background: t.color === 'red' ? '#E24B4A' : t.color === 'yellow' ? '#EF9F27' : '#639922', marginTop: 5, flexShrink: 0 }} />
                  <Text size="xs" style={{ flex: 1 }}>{t.text}</Text>
                </Group>
              ))}
            </Stack>
          </Surface>

          <Surface p="md">
            <Text fw={500} size="sm" mb="sm">Recomendaciones ejecutivas</Text>
            <Stack gap={0}>
              {RECOMENDACIONES.map((r) => (
                <Group key={r.num} gap="sm" align="flex-start" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                  <Text size="xs" c="dimmed" fw={500} style={{ width: 20, flexShrink: 0 }}>{r.num}</Text>
                  <Text size="xs" style={{ flex: 1 }}>{r.text}</Text>
                  <Badge color={r.color} variant="light" size="xs" style={{ flexShrink: 0 }}>{r.label}</Badge>
                </Group>
              ))}
            </Stack>
          </Surface>
        </SimpleGrid>

        {/* Acciones del mes anterior */}
        <Surface p="md">
          <Text fw={500} size="sm" mb="sm">Estado de acciones correctivas del mes anterior</Text>
          <Table striped withTableBorder={false} fz="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Acción</Table.Th>
                <Table.Th ta="center">Responsable</Table.Th>
                <Table.Th ta="center">Vence</Table.Th>
                <Table.Th ta="right">Estado</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ACCIONES_MES.map((a) => (
                <Table.Tr key={a.accion}>
                  <Table.Td>{a.accion}</Table.Td>
                  <Table.Td ta="center" c="dimmed">{a.resp}</Table.Td>
                  <Table.Td ta="center">{a.vence}</Table.Td>
                  <Table.Td ta="right"><Badge color={a.color} variant="light" size="xs">{a.estado}</Badge></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Surface>

        {/* Footer */}
        <Surface p="md">
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed">Elaborado por: Sistema Terminal Risk Monitor · Aprobado por: Gerencia de Operaciones</Text>
              <Text size="xs" c="dimmed">Próximo reporte: 16/05/2026 · Distribución: Gerencia General, Ops, SSOMA, Seguridad</Text>
            </Box>
          </Group>
        </Surface>
      </Stack>
    </>
  );
}
