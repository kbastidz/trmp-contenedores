"use client";

import { useState, useMemo, useEffect } from "react";
import Link from 'next/link';
import * as XLSX from "xlsx";
import {
  Anchor, Badge, Box, Button, Collapse, Group, Loader,
  Select, SimpleGrid, Stack, Tabs, Text, TextInput, Title,
} from "@mantine/core";
import { PageHeader, Surface } from "@/components";
import { PATH_DASHBOARD, PATH_OPERADOR } from "@/routes";
import { useEscalamientos, useEscalamientoHistorial, useCurrentUser } from "@/lib/hooks/useApi";
import { escalamientosService } from "@/lib/trm";
import type { EscalamientoDto, UrgenciaEscalamiento, EstadoEscalamiento } from "@/types/trm";

const URG_COLOR: Record<UrgenciaEscalamiento, string> = { Critica: "red", Alta: "yellow", Normal: "green" } as any;
const ESTADO_COLOR: Record<EstadoEscalamiento, string> = { Enviado: "yellow", Respondido: "green", Cerrado: "gray" };

const PER_PAGE = 8;

function DetailPanel({ esc, onClose, onRefetch }: { esc: EscalamientoDto; onClose: () => void; onRefetch: () => void }) {
  const { user } = useCurrentUser();
  const [tab, setTab] = useState<string | null>("resumen");
  const { data: historial } = useEscalamientoHistorial(esc.id);
  const [respTexto, setRespTexto] = useState("");
  const [respAutor, setRespAutor] = useState(user?.name ?? '');

  // Resuelve el nombre del creador: usa creado_por_nombre si el backend lo popula,
  // si no compara con el usuario de sesión, si no muestra el ID truncado
  const creadoPorNombre = esc.creado_por_nombre
    ?? (esc.creado_por === user?.id ? user?.name : null)
    ?? (esc.creado_por ? `${esc.creado_por.slice(0, 8)}…` : '—');

  // Sincronizar cuando llega el usuario de sesión
  useEffect(() => {
    if (user?.name) setRespAutor(user.name);
  }, [user?.name]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleResponder = async () => {
    if (!respTexto || !respAutor) return;
    setSaving(true);
    setSaveError(null);
    try {
      await escalamientosService.responder(esc.id, {
        respuesta_texto: respTexto,
        respuesta_autor: respAutor,
        respuesta_usuario_id: user?.id || undefined,
      });
      onRefetch();
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al registrar respuesta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Surface p="md">
      <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: "0.5px solid var(--mantine-color-default-border)" }} wrap="wrap">
        <Box>
          <Text size="xs" c="dimmed" mb={2}>{esc.codigo}</Text>
          <Text fw={500}>{esc.motivo}</Text>
          <Group gap="xs" mt={6}>
            <Badge color={(URG_COLOR as any)[esc.urgencia] ?? "gray"} variant="light" size="xs">{esc.urgencia}</Badge>
            <Badge color={ESTADO_COLOR[esc.estado]} variant="light" size="xs">{esc.estado}</Badge>
          </Group>
        </Box>
        <Group gap="sm">
          {esc.estado === "Enviado" && (
            <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.escalamiento}>Re-escalar</Button>
          )}
          <Button size="xs" variant="default" onClick={onClose}>Cerrar</Button>
        </Group>
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="resumen">Resumen</Tabs.Tab>
          <Tabs.Tab value="historial">Historial</Tabs.Tab>
          {esc.estado === "Enviado" && <Tabs.Tab value="responder">Registrar respuesta</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel value="resumen" pt="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
            <Stack gap={8}>
              <Box><Text size="xs" c="dimmed">Motivo</Text><Text size="xs">{esc.motivo}</Text></Box>
              <Box><Text size="xs" c="dimmed">Urgencia</Text><Badge color={(URG_COLOR as any)[esc.urgencia] ?? "gray"} variant="light" size="xs">{esc.urgencia}</Badge></Box>
              {esc.contexto && <Box><Text size="xs" c="dimmed">Contexto</Text><Text size="xs">{esc.contexto}</Text></Box>}
              {esc.recursos_requeridos && <Box><Text size="xs" c="dimmed">Recursos requeridos</Text><Text size="xs">{esc.recursos_requeridos}</Text></Box>}
            </Stack>
            <Stack gap={8}>
              {esc.nueva_fecha_propuesta && <Box><Text size="xs" c="dimmed">Nueva fecha propuesta</Text><Text size="xs">{new Date(esc.nueva_fecha_propuesta).toLocaleDateString("es-PE")}</Text></Box>}
              {esc.canal && <Box><Text size="xs" c="dimmed">Canal</Text><Text size="xs">{esc.canal}</Text></Box>}
              {esc.creado_por && <Box><Text size="xs" c="dimmed">Creado por</Text><Text size="xs">{creadoPorNombre}</Text></Box>}
              {esc.createdAt && <Box><Text size="xs" c="dimmed">Fecha de envio</Text><Text size="xs">{new Date(esc.createdAt).toLocaleString("es-PE")}</Text></Box>}
              <Box><Text size="xs" c="dimmed">Nivel</Text><Text size="xs">{esc.nivel_escalamiento}</Text></Box>
            </Stack>
          </SimpleGrid>
          {esc.respuesta_texto ? (
            <Box p="sm" style={{ background: "#EAF3DE", border: "0.5px solid #C0DD97", borderRadius: 8 }}>
              <Text size="xs" fw={500} c="green" mb={4}>
                Respuesta de {esc.respuesta_autor}{esc.respuesta_fecha ? ` · ${new Date(esc.respuesta_fecha).toLocaleString("es-PE")}` : ""}
              </Text>
              <Text size="xs">{esc.respuesta_texto}</Text>
            </Box>
          ) : esc.estado === "Enviado" ? (
            <Box p="sm" style={{ background: "#FAEEDA", border: "0.5px solid #FAC775", borderRadius: 8 }}>
              <Text size="xs" c="yellow">Esperando respuesta — Si no hay respuesta en 72h el sistema escalara automaticamente.</Text>
            </Box>
          ) : null}
        </Tabs.Panel>

        <Tabs.Panel value="historial" pt="md">
          {historial.length === 0 ? (
            <Text size="xs" c="dimmed" fs="italic">Sin eventos registrados.</Text>
          ) : (
            <Stack gap={0}>
              {historial.map((h, i) => (
                <Group key={h.id ?? i} gap="sm" align="flex-start" pb="sm">
                  <Box style={{ width: 9, height: 9, borderRadius: "50%", background: "#185FA5", marginTop: 4, flexShrink: 0 }} />
                  <Box style={{ flex: 1 }}>
                    <Text size="xs" fw={500}>{h.estado_anterior} → {h.estado_nuevo}</Text>
                    {h.justificacion && <Text size="xs" c="dimmed">{h.justificacion}</Text>}
                    <Text size="xs" c="dimmed">{h.usuario ? `${h.usuario} · ` : ""}{(() => { const d = h.creado_en ?? h.fecha; return d ? new Date(d).toLocaleString("es-PE") : '—'; })()}</Text>
                  </Box>
                </Group>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        {esc.estado === "Enviado" && (
          <Tabs.Panel value="responder" pt="md">
            <Stack gap="sm">
              <TextInput label="Autor de la respuesta" value={respAutor} readOnly placeholder="Cargando..." />
              <TextInput label="Texto de la respuesta *" placeholder="Describe la decision o accion tomada..." value={respTexto} onChange={e => setRespTexto(e.target.value)} />
              {saveError && <Text size="xs" c="red">{saveError}</Text>}
              <Button size="xs" onClick={handleResponder} loading={saving} disabled={!respTexto || !respAutor}>
                Registrar respuesta
              </Button>
            </Stack>
          </Tabs.Panel>
        )}
      </Tabs>
    </Surface>
  );
}

export default function HistorialEscalamientos() {
  const { user } = useCurrentUser();
  const { data: escalamientos, loading, error, refetch } = useEscalamientos();
  const [filtEstado, setFiltEstado] = useState("todos");
  const [filtUrg, setFiltUrg] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<EscalamientoDto | null>(null);

  const handleExport = () => {
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Crear hoja de datos
    const headers = ['ID', 'Fecha', 'Urgencia', 'Motivo', 'Estado', 'Respuesta', 'Creado por'];
    const rows = filtered.map(r => {
      const creadoPorNombre = r.creado_por_nombre
        ?? (r.creado_por === user?.id ? user?.name : null)
        ?? (r.auto_generado ? "Sistema TRM" : r.creado_por ? `${r.creado_por.slice(0, 8)}…` : "—");
      
      // Extraer fecha del código (formato: ESC-AAAA-M-D)
      let fecha = r.creado_en;
      
      return [
        r.codigo,
        fecha ? new Date(fecha).toLocaleDateString("es-PE") : 'Sin fecha',
        r.urgencia,
        r.motivo,
        r.estado,
        r.respuesta_fecha ? new Date(r.respuesta_fecha).toLocaleDateString("es-PE") : '—',
        creadoPorNombre,
      ];
    });

    // Crear hoja con cabecera y datos
    const wsData = [
      ['Reporte de Escalamientos'],
      [`Fecha de generación: ${new Date().toLocaleString("es-PE")}`],
      [`Total de escalamientos: ${filtered.length}`],
      [],
      headers,
      ...rows,
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Configurar anchos de columnas
    ws['!cols'] = [
      { wch: 15 }, // ID
      { wch: 15 }, // Fecha
      { wch: 12 }, // Urgencia
      { wch: 40 }, // Motivo
      { wch: 15 }, // Estado
      { wch: 15 }, // Respuesta
      { wch: 25 }, // Creado por
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Escalamientos');

    // Generar y descargar archivo
    XLSX.writeFile(wb, `escalamientos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const breadcrumbs = [
    { title: "Dashboard", href: PATH_DASHBOARD.default },
    { title: "Operador", href: PATH_OPERADOR.dashboard },
    { title: "Historial de Escalamientos", href: "#" },
  ].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return escalamientos.filter(r => {
      if (filtEstado !== "todos" && r.estado !== filtEstado) return false;
      if (filtUrg && r.urgencia !== filtUrg) return false;
      if (q && !r.codigo.toLowerCase().includes(q) && !r.motivo.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [escalamientos, filtEstado, filtUrg, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = useMemo(() => ({
    total: escalamientos.length,
    enviado: escalamientos.filter(e => e.estado === "Enviado").length,
    respondido: escalamientos.filter(e => e.estado === "Respondido").length,
    cerrado: escalamientos.filter(e => e.estado === "Cerrado").length,
  }), [escalamientos]);

  return (
    <>
      <title>Historial de Escalamientos | Operador</title>
      <PageHeader
        title="Historial de Escalamientos"
        breadcrumbItems={breadcrumbs}
        actionButton={
          <Group gap="sm">
            <Button size="xs" component={Link} href={PATH_OPERADOR.escalamiento}>+ Nuevo escalamiento</Button>
            <Button size="xs" variant="default" onClick={handleExport}>Exportar</Button>
          </Group>
        }
      />

      <Stack gap="md" mt="md">
        {/* Metricas */}
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          {[
            { label: "Total escalamientos", value: counts.total, color: undefined },
            { label: "Pendientes respuesta", value: counts.enviado, color: "yellow" },
            { label: "Respondidos", value: counts.respondido, color: "green" },
            { label: "Cerrados", value: counts.cerrado, color: "gray" },
          ].map((m) => (
            <Surface key={m.label} p="md">
              <Title order={3} c={m.color as any}>{loading ? "—" : m.value}</Title>
              <Text size="xs" c="dimmed">{m.label}</Text>
            </Surface>
          ))}
        </SimpleGrid>

        {/* Filtros */}
        <Group gap="sm" wrap="wrap">
          {[
            { key: "todos", label: `Todos (${counts.total})` },
            { key: "Enviado", label: `Pendientes (${counts.enviado})` },
            { key: "Respondido", label: `Respondidos (${counts.respondido})` },
            { key: "Cerrado", label: `Cerrados (${counts.cerrado})` },
          ].map(f => (
            <Button key={f.key} size="xs" variant={filtEstado === f.key ? "filled" : "default"}
              onClick={() => { setFiltEstado(f.key); setPage(1); setSelected(null); }}>
              {f.label}
            </Button>
          ))}
          <Box style={{ width: 1, height: 20, background: "var(--mantine-color-default-border)" }} />
          <Select size="xs" placeholder="Toda urgencia" data={["Critica","Alta","Normal"]} value={filtUrg} onChange={v => { setFiltUrg(v || ""); setPage(1); }} clearable style={{ width: 130 }} />
          <TextInput size="xs" placeholder="Buscar codigo, motivo..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} style={{ width: 200 }} />
        </Group>

        {/* Error */}
        {error && (
          <Surface p="md">
            <Text c="red" size="sm">Error al cargar escalamientos: {error.message}</Text>
            <Button size="xs" mt="xs" onClick={refetch}>Reintentar</Button>
          </Surface>
        )}

        {/* Tabla */}
        <Surface style={{ overflow: "hidden" }}>
          {loading ? (
            <Group justify="center" p="xl"><Loader size="sm" /></Group>
          ) : (
            <Box style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: 130 }} /><col style={{ width: 80 }} /><col />
                  <col style={{ width: 90 }} /><col style={{ width: 110 }} /><col style={{ width: 110 }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: "0.5px solid var(--mantine-color-default-border)", background: "var(--mantine-color-default-hover)" }}>
                    {["ID / Fecha","Urgencia","Motivo","Estado","Respuesta","Creado por"].map(h => (
                      <th key={h} style={{ fontSize: 11, color: "var(--mantine-color-dimmed)", fontWeight: 500, textAlign: "left", padding: "8px 10px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slice.map((r, i) => (
                    <tr key={r.id} onClick={() => setSelected(prev => prev?.id === r.id ? null : r)}
                      style={{ cursor: "pointer", background: selected?.id === r.id ? "#E6F1FB" : i % 2 === 1 ? "var(--mantine-color-default-hover)" : "transparent", borderBottom: "0.5px solid var(--mantine-color-default-border)" }}>
                      <td style={{ padding: "8px 10px" }}>
                        <Text size="xs" fw={500} c="blue">{r.codigo}</Text>
                        {r.createdAt && <Text size="xs" c="dimmed">{new Date(r.createdAt).toLocaleDateString("es-PE")}</Text>}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <Badge color={(URG_COLOR as any)[r.urgencia] ?? "gray"} variant="light" size="xs">{r.urgencia}</Badge>
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <Text size="xs" lineClamp={2}>{r.motivo}</Text>
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <Badge color={ESTADO_COLOR[r.estado]} variant="light" size="xs">{r.estado}</Badge>
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        {r.respuesta_fecha
                          ? <Text size="xs" c="dimmed">{new Date(r.respuesta_fecha).toLocaleDateString("es-PE")}</Text>
                          : <Text size="xs" c="dimmed">—</Text>
                        }
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <Text size="xs" c="dimmed">{r.creado_por_nombre ?? (r.creado_por === user?.id ? user?.name : null) ?? (r.auto_generado ? "Sistema TRM" : r.creado_por ? `${r.creado_por.slice(0, 8)}…` : "—")}</Text>
                      </td>
                    </tr>
                  ))}
                  {slice.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--mantine-color-dimmed)", fontSize: 13 }}>
                        No se encontraron escalamientos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          )}

          <Group justify="space-between" p="sm" style={{ borderTop: "0.5px solid var(--mantine-color-default-border)" }}>
            <Text size="xs" c="dimmed">
              Mostrando {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length} escalamientos
            </Text>
            <Group gap={4}>
              {page > 1 && <Button size="xs" variant="default" onClick={() => setPage(p => p - 1)}>←</Button>}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} size="xs" variant={p === page ? "filled" : "default"} onClick={() => setPage(p)}>{p}</Button>
              ))}
              {page < totalPages && <Button size="xs" variant="default" onClick={() => setPage(p => p + 1)}>→</Button>}
            </Group>
          </Group>
        </Surface>

        {/* Panel de detalle */}
        <Collapse in={!!selected}>
          {selected && (
            <DetailPanel
              esc={selected}
              onClose={() => setSelected(null)}
              onRefetch={refetch}
            />
          )}
        </Collapse>

        {/* Footer */}
        <Group justify="space-between" pt="xs" style={{ borderTop: "0.5px solid var(--mantine-color-default-border)" }}>
          <Text size="xs" c="dimmed">Terminal Risk Monitor · Escalamientos automaticos activos</Text>
          <Group gap="sm">
            <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.seguimientoPlanes}>Tablero Kanban</Button>
          </Group>
        </Group>
      </Stack>
    </>
  );
}
