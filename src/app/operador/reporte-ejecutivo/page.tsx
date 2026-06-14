'use client';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import {
  Anchor, Badge, Box, Button, Group, Loader, Progress, SimpleGrid,
  Stack, Table, Text, Title,
} from '@mantine/core';
import { PageHeader, Surface } from '@/components';
import { PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';
import { useRiesgos, useIncidentes, usePlanes, useKriByTerminal, useAreas } from '@/lib/hooks/useApi';
import { TERMINAL_ID } from '@/lib/constants';
import type { NivelRiesgo } from '@/types/trm';

const breadcrumbs = [
  { title: 'Dashboard', href: PATH_DASHBOARD.default },
  { title: 'Operador', href: PATH_OPERADOR.dashboard },
  { title: 'Reporte Ejecutivo', href: '#' },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const NIVEL_COLOR: Record<NivelRiesgo, string> = {
  Crítico: 'red', Alto: 'orange', Medio: 'yellow', Bajo: 'green',
};
const NIVEL_HEX: Record<NivelRiesgo, string> = {
  Crítico: '#A32D2D', Alto: '#993C1D', Medio: '#854F0B', Bajo: '#3B6D11',
};

interface DashboardMetricas {
  total_riesgos_activos?: number;
  riesgos_criticos?: number;
  riesgos_altos?: number;
  riesgos_medios?: number;
  riesgos_bajos?: number;
  total_incidentes_mes?: number;
  incidentes_criticos_mes?: number;
  incidentes_graves_mes?: number;
  dias_sin_accidentes?: number;
  planes_activos?: number;
  planes_vencidos?: number;
  planes_completados_mes?: number;
  efectividad_controles_pct?: number;
  acciones_vencidas?: number;
  acciones_pendientes?: number;
  escalamientos_pendientes?: number;
}

export default function ReporteEjecutivo() {
  const { data: riesgos, loading: loadingR } = useRiesgos(TERMINAL_ID);
  const { data: incidentes, loading: loadingI } = useIncidentes({ terminal_id: TERMINAL_ID });
  const { data: planes, loading: loadingP } = usePlanes({ terminal_id: TERMINAL_ID });
  const { data: kris, loading: loadingK } = useKriByTerminal(TERMINAL_ID);
  const { data: areas } = useAreas(TERMINAL_ID);
  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte Ejecutivo de Riesgos', 105, y, { align: 'center' });
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Terminal ID: ${TERMINAL_ID.slice(0, 8)}…`, 105, y, { align: 'center' });
    y += 6;
    doc.text(`Período: ${periodo} · Generado: ${new Date().toLocaleDateString('es-PE')}`, 105, y, { align: 'center' });
    y += 6;

    const nivelGlobal = riesgosCriticos > 3 ? 'Crítico' : riesgosCriticos > 0 ? 'Medio-Alto' : 'Controlado';
    doc.text(`Nivel global: ${nivelGlobal}`, 105, y, { align: 'center' });
    y += 15;

    // Métricas
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Métricas Principales', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const metricasData = [
      ['Riesgos activos', String(totalRiesgos)],
      ['Riesgos críticos', String(riesgosCriticos)],
      ['Incidentes (mes)', String(totalIncidentes)],
      ['Controles efectivos', efectividad != null ? `${efectividad}%` : '—'],
      ['Acciones vencidas', String(accionesVencidas)],
    ];

    metricasData.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 25, y);
      y += 6;
    });
    y += 10;

    // Semáforo por área
    if (semaforoAreas.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Semáforo de Riesgo por Área', 20, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      semaforoAreas.forEach((a) => {
        doc.text(`${a.nombre}: ${a.total} riesgos · ${a.criticos} críticos · ${a.nivel}`, 25, y);
        y += 5;
      });
      y += 10;
    }

    // Top riesgos
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Top ${topRiesgos.length} Riesgos por Score`, 20, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    topRiesgos.forEach((r) => {
      const score = r.probabilidad * r.impacto;
      doc.text(`${r.nombre} - Score: ${score} - ${r.area ?? '—'}`, 25, y);
      y += 5;
    });
    y += 10;

    // Incidentes por área
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Incidentes por Área', 20, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    incidentesPorArea.forEach((a) => {
      doc.text(`${a.nombre}: ${a.total} incidentes`, 25, y);
      y += 5;
    });
    y += 8;

    doc.text('Por severidad:', 25, y);
    y += 5;
    doc.text(`Críticos: ${incCriticos}`, 30, y);
    y += 5;
    doc.text(`Graves: ${incGraves}`, 30, y);
    y += 5;
    doc.text(`Leves/Moderados: ${incLeves}`, 30, y);
    y += 10;

    // KRIs
    if (kris.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Indicadores Clave de Riesgo (KRI)', 20, y);
      y += 8;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      kris.forEach((k) => {
        const val = k.ultimo_valor ?? null;
        const estado = k.ultimo_estado ?? (
          val == null ? '—'
          : k.umbral_critico != null && val >= k.umbral_critico ? 'Crítico'
          : k.umbral_alerta != null && val >= k.umbral_alerta ? 'Alerta'
          : 'OK'
        );
        doc.text(`${k.nombre}: ${val != null ? `${val}${k.unidad ? ` ${k.unidad}` : ''}` : '—'} - Estado: ${estado}`, 25, y);
        y += 5;
      });
      y += 10;
    }

    // Estado de planes
    if (accionesMes.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Estado de Planes de Mitigación', 20, y);
      y += 8;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      accionesMes.forEach((p) => {
        const vencido = p.fecha_limite && p.fecha_limite < hoy && p.estado !== 'Completado';
        const estado = vencido ? 'Vencida' : p.estado;
        doc.text(`${p.titulo} - ${p.responsable_nombre ?? p.responsable_id?.slice(0, 8) ?? '—'} - ${p.fecha_limite ? new Date(p.fecha_limite).toLocaleDateString('es-PE') : '—'} - ${p.progreso}% - ${estado}`, 25, y);
        y += 5;
      });
      y += 10;
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Elaborado por: Sistema Terminal Risk Monitor', 20, y);
    y += 5;
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 20, y);
    y += 5;
    doc.text(`Terminal ID: ${TERMINAL_ID}`, 20, y);

    // Guardar PDF
    doc.save(`reporte-ejecutivo-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const loading = loadingR || loadingI || loadingP || loadingK;

  // Cargar métricas del dashboard directamente desde el backend
  useEffect(() => {
    const TRM_API = process.env.NEXT_PUBLIC_TRM_API_URL ?? 'http://localhost:3002';
    fetch(`${TRM_API}/api/trm/dashboard/metricas?terminal_id=${TERMINAL_ID}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setMetricas(Array.isArray(data) ? data[0] : data); })
      .catch(() => null);
  }, []);

  // Calcular métricas desde los datos cargados como fallback
  const totalRiesgos = metricas?.total_riesgos_activos ?? riesgos.filter(r => r.estado !== 'Cerrado').length;
  const riesgosCriticos = metricas?.riesgos_criticos ?? riesgos.filter(r => r.nivel === 'Crítico').length;
  const totalIncidentes = metricas?.total_incidentes_mes ?? incidentes.length;
  const accionesVencidas = metricas?.acciones_vencidas ?? planes.filter(p => {
    if (!p.fecha_limite) return false;
    return p.estado !== 'Completado' && p.fecha_limite < new Date().toISOString().split('T')[0];
  }).length;
  const efectividad = metricas?.efectividad_controles_pct ?? null;

  // Top riesgos por score
  const topRiesgos = [...riesgos]
    .sort((a, b) => (b.probabilidad * b.impacto) - (a.probabilidad * a.impacto))
    .slice(0, 6);

  // Incidentes por área
  const incidentesPorArea = areas.map(area => ({
    nombre: area.nombre,
    total: incidentes.filter(i => i.area_id === area.id || i.area === area.nombre).length,
  })).filter(a => a.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);
  const maxIncArea = incidentesPorArea[0]?.total ?? 1;

  // Incidentes por severidad
  const incCriticos = incidentes.filter(i => i.severidad === 'Crítico').length;
  const incGraves = incidentes.filter(i => i.severidad === 'Grave').length;
  const incLeves = incidentes.filter(i => i.severidad === 'Leve' || i.severidad === 'Moderado').length;

  // Semáforo por área
  const semaforoAreas = areas.map(area => {
    const riesgosArea = riesgos.filter(r => r.area_id === area.id || r.area === area.nombre);
    const criticos = riesgosArea.filter(r => r.nivel === 'Crítico').length;
    const nivel: NivelRiesgo = criticos > 0 ? 'Crítico'
      : riesgosArea.some(r => r.nivel === 'Alto') ? 'Alto'
      : riesgosArea.some(r => r.nivel === 'Medio') ? 'Medio' : 'Bajo';
    return { nombre: area.nombre, total: riesgosArea.length, criticos, nivel };
  }).filter(a => a.total > 0);

  // Planes vencidos como acciones del mes
  const accionesMes = planes
    .filter(p => p.estado !== 'Cancelado')
    .sort((a, b) => (a.fecha_limite ?? '').localeCompare(b.fecha_limite ?? ''))
    .slice(0, 8);

  const hoy = new Date().toISOString().split('T')[0];
  const periodo = new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <>
        <PageHeader title="Reporte Ejecutivo de Riesgos" breadcrumbItems={breadcrumbs} />
        <Group justify="center" mt="xl"><Loader /></Group>
      </>
    );
  }

  return (
    <>
      <title>Reporte Ejecutivo | Operador</title>
      <PageHeader
        title="Reporte Ejecutivo de Riesgos"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            <Button size="xs" variant="default" onClick={handleExportPDF}>Exportar PDF</Button>
            <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.seguimientoPlanes}>Plan de mitigación</Button>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Header */}
        <Surface p="md">
          <Group justify="space-between">
            <Box>
              <Text fw={500}>Terminal Risk Monitor</Text>
              <Text size="xs" c="dimmed">Terminal ID: {TERMINAL_ID.slice(0, 8)}…</Text>
            </Box>
            <Box ta="right">
              <Text fw={500} size="sm">Reporte ejecutivo de riesgos</Text>
              <Text size="xs" c="dimmed">Período: {periodo} · Generado: {new Date().toLocaleDateString('es-PE')}</Text>
              <Badge color={riesgosCriticos > 3 ? 'red' : riesgosCriticos > 0 ? 'yellow' : 'green'} variant="light" mt={4}>
                Nivel global: {riesgosCriticos > 3 ? 'Crítico' : riesgosCriticos > 0 ? 'Medio-Alto' : 'Controlado'}
              </Badge>
            </Box>
          </Group>
        </Surface>

        {/* Métricas */}
        <SimpleGrid cols={{ base: 2, sm: 5 }}>
          {[
            { label: 'Riesgos activos',     value: totalRiesgos,    color: undefined },
            { label: 'Riesgos críticos',    value: riesgosCriticos, color: riesgosCriticos > 0 ? 'red' : undefined },
            { label: 'Incidentes (mes)',    value: totalIncidentes, color: undefined },
            { label: 'Controles efectivos', value: efectividad != null ? `${efectividad}%` : '—', color: undefined },
            { label: 'Acciones vencidas',   value: accionesVencidas, color: accionesVencidas > 0 ? 'yellow' : undefined },
          ].map((m) => (
            <Surface key={m.label} p="md">
              <Text size="xs" c="dimmed">{m.label}</Text>
              <Title order={3} c={m.color}>{m.value}</Title>
            </Surface>
          ))}
        </SimpleGrid>

        {/* Semáforo por área */}
        {semaforoAreas.length > 0 && (
          <Surface p="md">
            <Group justify="space-between" mb="sm">
              <Text fw={500} size="sm">Semáforo de riesgo por área</Text>
              <Text size="xs" c="dimmed">Estado al cierre del período</Text>
            </Group>
            <SimpleGrid cols={{ base: 2, sm: Math.min(semaforoAreas.length, 5) }}>
              {semaforoAreas.map((a) => (
                <Box key={a.nombre} p="sm" style={{ border: '0.5px solid var(--mantine-color-default-border)', borderRadius: 8, textAlign: 'center' }}>
                  <Box style={{ width: 14, height: 14, borderRadius: '50%', background: NIVEL_HEX[a.nivel], margin: '0 auto 6px' }} />
                  <Text size="xs" fw={500} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nombre}</Text>
                  <Text size="xs" c="dimmed">{a.total} riesgos · {a.criticos} críticos</Text>
                  <Badge color={NIVEL_COLOR[a.nivel]} variant="light" size="xs" mt={4}>{a.nivel}</Badge>
                </Box>
              ))}
            </SimpleGrid>
          </Surface>
        )}

        {/* Top riesgos + Incidentes por área */}
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Surface p="md">
            <Text fw={500} size="sm" mb="sm">Top {topRiesgos.length} riesgos por score</Text>
            {topRiesgos.length === 0
              ? <Text size="xs" c="dimmed" fs="italic">Sin riesgos registrados.</Text>
              : (
                <Stack gap={0}>
                  {topRiesgos.map((r) => {
                    const score = r.probabilidad * r.impacto;
                    return (
                      <Group key={r.id} gap="xs" style={{ padding: '6px 0', borderBottom: '0.5px solid var(--mantine-color-default-border)' }}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: NIVEL_HEX[r.nivel], flexShrink: 0 }} />
                        <Text size="xs" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre}</Text>
                        <Badge color={NIVEL_COLOR[r.nivel]} variant="light" size="xs">{score}</Badge>
                        <Text size="xs" c="dimmed" style={{ width: 70, textAlign: 'right' }}>{r.area ?? '—'}</Text>
                      </Group>
                    );
                  })}
                </Stack>
              )
            }
          </Surface>

          <Surface p="md">
            <Text fw={500} size="sm" mb="sm">
              Incidentes por área <Text span size="xs" c="dimmed">{totalIncidentes} total</Text>
            </Text>
            {incidentesPorArea.length === 0
              ? <Text size="xs" c="dimmed" fs="italic">Sin incidentes registrados.</Text>
              : (
                <>
                  <Stack gap={6} mb="md">
                    {incidentesPorArea.map((a) => (
                      <Group key={a.nombre} gap="xs" wrap="nowrap">
                        <Text size="xs" style={{ minWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nombre}</Text>
                        <Progress value={(a.total / maxIncArea) * 100} color="blue" size="xs" style={{ flex: 1 }} />
                        <Text size="xs" fw={500} style={{ minWidth: 20, textAlign: 'right' }}>{a.total}</Text>
                      </Group>
                    ))}
                  </Stack>
                  <Text size="xs" c="dimmed" mb={6}>Por severidad</Text>
                  <SimpleGrid cols={3}>
                    <Box p="xs" style={{ background: '#FCEBEB', borderRadius: 6, textAlign: 'center' }}>
                      <Title order={4} c="red">{incCriticos}</Title>
                      <Text size="xs" c="red">Críticos</Text>
                    </Box>
                    <Box p="xs" style={{ background: '#FAECE7', borderRadius: 6, textAlign: 'center' }}>
                      <Title order={4} c="orange">{incGraves}</Title>
                      <Text size="xs" c="orange">Graves</Text>
                    </Box>
                    <Box p="xs" style={{ background: '#EAF3DE', borderRadius: 6, textAlign: 'center' }}>
                      <Title order={4} c="green">{incLeves}</Title>
                      <Text size="xs" c="green">Leves/Mod.</Text>
                    </Box>
                  </SimpleGrid>
                </>
              )
            }
          </Surface>
        </SimpleGrid>

        {/* KRIs */}
        {kris.length > 0 && (
          <Surface p="md">
            <Text fw={500} size="sm" mb="sm">Indicadores clave de riesgo (KRI) — estado del mes</Text>
            <Table striped withTableBorder={false} fz="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Indicador</Table.Th>
                  <Table.Th ta="center">Valor actual</Table.Th>
                  <Table.Th ta="center">Umbral alerta</Table.Th>
                  <Table.Th ta="center">Umbral crítico</Table.Th>
                  <Table.Th ta="right">Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {kris.map((k) => {
                  const val = k.ultimo_valor ?? null;
                  const estado = k.ultimo_estado ?? (
                    val == null ? '—'
                    : k.umbral_critico != null && val >= k.umbral_critico ? 'Crítico'
                    : k.umbral_alerta != null && val >= k.umbral_alerta ? 'Alerta'
                    : 'OK'
                  );
                  const color = estado === 'Crítico' ? 'red' : estado === 'Alerta' ? 'yellow' : estado === 'OK' ? 'green' : 'gray';
                  return (
                    <Table.Tr key={k.id}>
                      <Table.Td>{k.nombre}</Table.Td>
                      <Table.Td ta="center" fw={500} c={color}>
                        {val != null ? `${val}${k.unidad ? ` ${k.unidad}` : ''}` : '—'}
                      </Table.Td>
                      <Table.Td ta="center" c="dimmed">{k.umbral_alerta ?? '—'}</Table.Td>
                      <Table.Td ta="center" c="dimmed">{k.umbral_critico ?? '—'}</Table.Td>
                      <Table.Td ta="right"><Badge color={color} variant="light" size="xs">{estado}</Badge></Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Surface>
        )}

        {/* Estado de planes */}
        {accionesMes.length > 0 && (
          <Surface p="md">
            <Text fw={500} size="sm" mb="sm">Estado de planes de mitigación</Text>
            <Table striped withTableBorder={false} fz="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Plan</Table.Th>
                  <Table.Th ta="center">Responsable</Table.Th>
                  <Table.Th ta="center">Fecha límite</Table.Th>
                  <Table.Th ta="center">Avance</Table.Th>
                  <Table.Th ta="right">Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {accionesMes.map((p) => {
                  const vencido = p.fecha_limite && p.fecha_limite < hoy && p.estado !== 'Completado';
                  const estadoColor = p.estado === 'Completado' ? 'green'
                    : vencido ? 'red'
                    : p.estado === 'En progreso' ? 'blue'
                    : 'gray';
                  return (
                    <Table.Tr key={p.id}>
                      <Table.Td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titulo}</Table.Td>
                      <Table.Td ta="center" c="dimmed">{p.responsable_nombre ?? p.responsable_id?.slice(0, 8) ?? '—'}</Table.Td>
                      <Table.Td ta="center" c={vencido ? 'red' : undefined}>
                        {p.fecha_limite ? new Date(p.fecha_limite).toLocaleDateString('es-PE') : '—'}
                      </Table.Td>
                      <Table.Td ta="center">{p.progreso}%</Table.Td>
                      <Table.Td ta="right">
                        <Badge color={estadoColor} variant="light" size="xs">
                          {vencido ? 'Vencida' : p.estado}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Surface>
        )}

        {/* Footer */}
        <Surface p="md">
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed">Elaborado por: Sistema Terminal Risk Monitor</Text>
              <Text size="xs" c="dimmed">Generado: {new Date().toLocaleString('es-PE')}</Text>
            </Box>
            <Text size="xs" c="dimmed">Terminal ID: {TERMINAL_ID}</Text>
          </Group>
        </Surface>
      </Stack>
    </>
  );
}
