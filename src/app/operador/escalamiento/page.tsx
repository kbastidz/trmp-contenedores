"use client";

import { useState } from "react";
import Link from 'next/link';
import {
  Anchor, Badge, Box, Button, Checkbox, Group, Loader, Progress,
  Select, SimpleGrid, Stack, Text, Textarea, TextInput, Title,
} from "@mantine/core";
import { PageHeader, Surface } from "@/components";
import { PATH_DASHBOARD, PATH_OPERADOR } from "@/routes";
import { usePlanes } from "@/lib/hooks/useApi";
import { useCurrentUser } from "@/lib/hooks/useApi";
import { escalamientosService } from "@/lib/trm";
import type { UrgenciaEscalamiento } from "@/types/trm";
import { TERMINAL_ID } from "@/lib/constants";

const breadcrumbs = [
  { title: "Dashboard", href: PATH_DASHBOARD.default },
  { title: "Operador", href: PATH_OPERADOR.dashboard },
  { title: "Escalamiento", href: "#" },
].map((item, i) => <Anchor href={item.href} key={i}>{item.title}</Anchor>);

const URGENCIAS: { id: number; tiempo: string; label: UrgenciaEscalamiento; sub: string; color: string }[] = [
  { id: 1, tiempo: "48h",       label: "Normal",  sub: "Atencion en 2 dias", color: "green"  },
  { id: 2, tiempo: "24h",       label: "Alta",    sub: "Respuesta hoy",      color: "yellow" },
  { id: 3, tiempo: "Inmediata", label: "Critica", sub: "Accion ahora",       color: "red"    },
];

const MOTIVOS = [
  "Incumplimiento de fecha limite sin justificacion",
  "Falta de recursos para ejecutar la accion",
  "Bloqueo por decision que requiere autoridad superior",
  "Riesgo que se ha materializado parcialmente",
  "Responsable no disponible / cambio de cargo",
];

export default function Escalamiento() {
  const { user } = useCurrentUser();
  const { data: planes, loading: loadingPlanes } = usePlanes();

  // Solo planes vencidos o en riesgo
  const planesVencidos = planes.filter(p => {
    if (p.estado === "Completado" || p.estado === "Cancelado") return false;
    if (!p.fecha_limite) return false;
    return p.fecha_limite < new Date().toISOString().split("T")[0];
  });

  const [step, setStep] = useState(1);
  const [urgencia, setUrgencia] = useState(2);
  const [selPlanes, setSelPlanes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createdCodigo, setCreatedCodigo] = useState<string | null>(null);

  const [form, setForm] = useState({
    motivo: MOTIVOS[0],
    contexto: "",
    nuevaFecha: "",
    recursos: "",
  });
  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const togglePlan = (id: string) =>
    setSelPlanes(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const urgLabel = URGENCIAS.find(u => u.id === urgencia)?.label ?? "Alta";
  const urgTiempo = URGENCIAS.find(u => u.id === urgencia)?.tiempo ?? "24h";

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const codigo = `ESC-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
      const result = await escalamientosService.create({
        terminal_id: TERMINAL_ID,
        creado_por: user?.id || undefined,
        codigo,
        motivo: form.motivo,
        urgencia: urgLabel as UrgenciaEscalamiento,
        estado: "Enviado",
        nivel_escalamiento: 1,
        auto_generado: false,
        contexto: form.contexto || undefined,
        recursos_requeridos: form.recursos || undefined,
        nueva_fecha_propuesta: form.nuevaFecha || undefined,
        canal: "Email + Registro TRM",
      });
      setCreatedCodigo(result.codigo);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al enviar escalamiento");
      setSaving(false);
    }
  };

  if (createdCodigo) {
    return (
      <>
        <title>Escalamiento Enviado | Operador</title>
        <PageHeader title="Escalamiento de Acciones" breadcrumbItems={breadcrumbs} />
        <Surface p="xl" mt="md" style={{ textAlign: "center" }}>
          <Box style={{ width: 48, height: 48, borderRadius: "50%", background: "#EAF3DE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </Box>
          <Title order={4} mb={6}>Escalamiento enviado exitosamente</Title>
          <Text size="sm" c="dimmed" mb={4}>Referencia: <strong>{createdCodigo}</strong></Text>
          <Text size="xs" c="dimmed" mb="lg">Tiempo de respuesta esperado: <strong>{urgTiempo}</strong></Text>
          <Group justify="center" gap="sm" wrap="wrap">
            <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.historialEscalamientos}>Ver historial</Button>
            <Button size="xs" variant="default" component={Link} href={PATH_OPERADOR.seguimientoPlanes}>Tablero de planes</Button>
            <Button size="xs" component={Link} href={PATH_OPERADOR.dashboard}>Dashboard</Button>
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
        {planesVencidos.length > 0 && (
          <Box p="sm" style={{ background: "#FAEEDA", border: "0.5px solid #FAC775", borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <Text size="xs" c="yellow">{planesVencidos.length} plan(es) vencido(s) sin avance significativo. Se recomienda escalamiento formal.</Text>
          </Box>
        )}

        {saveError && (
          <Box p="sm" style={{ background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 8 }}>
            <Text size="xs" c="red">{saveError}</Text>
          </Box>
        )}

        {/* Paso 1 */}
        {step === 1 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Planes a escalar</Text>
              {loadingPlanes ? (
                <Group justify="center" p="md"><Loader size="sm" /></Group>
              ) : planesVencidos.length === 0 ? (
                <Text size="xs" c="dimmed" fs="italic">No hay planes vencidos en este momento.</Text>
              ) : (
                <Stack gap="sm" style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
                  {planesVencidos.map((p) => {
                    const diasVencido = p.fecha_limite
                      ? Math.floor((Date.now() - new Date(p.fecha_limite).getTime()) / 86400000)
                      : 0;
                    return (
                      <Box key={p.id} p="sm" onClick={() => togglePlan(p.id)}
                        style={{ border: `${selPlanes.includes(p.id) ? "2px solid #185FA5" : "0.5px solid #F09595"}`, borderRadius: 8, cursor: "pointer", background: selPlanes.includes(p.id) ? "#E6F1FB" : "transparent" }}>
                        <Group justify="space-between" mb={4}>
                          <Group gap="xs">
                            <Checkbox checked={selPlanes.includes(p.id)} readOnly size="xs" />
                            <Text size="xs" c="red" fw={500}>{p.codigo}</Text>
                          </Group>
                          <Badge color="red" variant="light" size="xs">{diasVencido} dias vencida</Badge>
                        </Group>
                        <Text size="xs" fw={500} mb={6}>{p.titulo}</Text>
                        <Group gap="xs" mb={6}>
                          {p.area && <Badge color="blue" variant="light" size="xs">{p.area}</Badge>}
                          {p.responsable_nombre && <Text size="xs" c="dimmed">Resp: {p.responsable_nombre}</Text>}
                        </Group>
                        <Group gap="sm">
                          <Progress value={p.progreso} color="red" size="xs" style={{ flex: 1 }} />
                          <Text size="xs" c="red" fw={500}>{p.progreso}%</Text>
                        </Group>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Surface>

            <Surface p="md">
              <Text fw={500} size="sm" mb="md">Motivo y urgencia del escalamiento</Text>
              <Select label="Motivo del escalamiento *" mb="sm" value={form.motivo} onChange={v => update("motivo", v || "")} data={MOTIVOS} />

              <Text size="xs" c="dimmed" mb="xs">Nivel de urgencia *</Text>
              <SimpleGrid cols={3} mb="sm">
                {URGENCIAS.map((u) => (
                  <Box key={u.id} onClick={() => setUrgencia(u.id)}
                    style={{ border: urgencia === u.id ? "2px solid #185FA5" : "0.5px solid var(--mantine-color-default-border)", borderRadius: 8, padding: "10px 8px", textAlign: "center", cursor: "pointer", background: urgencia === u.id ? "#E6F1FB" : "transparent" }}>
                    <Title order={4} c={u.color}>{u.tiempo}</Title>
                    <Text size="xs" fw={500} c={u.color}>{u.label}</Text>
                    <Text size="xs" c="dimmed">{u.sub}</Text>
                  </Box>
                ))}
              </SimpleGrid>

              <Textarea label="Contexto adicional para gerencia *" minRows={4} value={form.contexto} onChange={e => update("contexto", e.target.value)} mb="sm" />
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput label="Nueva fecha limite propuesta" type="date" value={form.nuevaFecha} onChange={e => update("nuevaFecha", e.target.value)} />
                <TextInput label="Recursos o decision requerida" placeholder="Ej: Presupuesto $15,000 para tecnico externo" value={form.recursos} onChange={e => update("recursos", e.target.value)} />
              </SimpleGrid>
            </Surface>

            <Group justify="space-between">
              <Text size="xs" c="dimmed">Paso 1 de 2 — Configuracion</Text>
              <Button size="sm" onClick={() => setStep(2)}>Siguiente → Previsualizar</Button>
            </Group>
          </Stack>
        )}

        {/* Paso 2 — Preview */}
        {step === 2 && (
          <Stack gap="md">
            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Vista previa de la notificacion</Text>
              <Box p="md" style={{ background: "var(--mantine-color-default-hover)", borderRadius: 8, border: "0.5px solid var(--mantine-color-default-border)", fontSize: 12, lineHeight: 1.7 }}>
                <Text size="xs" fw={500}>ESCALAMIENTO FORMAL DE ACCIONES VENCIDAS</Text>
                <Text size="xs" c="dimmed">Fecha: {new Date().toLocaleDateString("es-PE")}</Text>
                <br />
                <Text size="xs"><strong>Motivo:</strong> {form.motivo}</Text>
                <Text size="xs"><strong>Urgencia:</strong> {urgLabel} ({urgTiempo})</Text>
                {selPlanes.length > 0 && (
                  <>
                    <br />
                    <Text size="xs"><strong>Planes escalados:</strong></Text>
                    {selPlanes.map(pid => {
                      const p = planesVencidos.find(x => x.id === pid);
                      return p ? <Text key={pid} size="xs">· {p.codigo} — {p.titulo}</Text> : null;
                    })}
                  </>
                )}
                {form.contexto && <><br /><Text size="xs"><strong>Contexto:</strong> {form.contexto}</Text></>}
                {form.recursos && <Text size="xs"><strong>Se solicita:</strong> {form.recursos}</Text>}
                {form.nuevaFecha && <Text size="xs"><strong>Nueva fecha propuesta:</strong> {form.nuevaFecha}</Text>}
                <br />
                <Text size="xs" c="dimmed">— Terminal Risk Monitor</Text>
              </Box>
            </Surface>

            <Surface p="md">
              <Text fw={500} size="sm" mb="sm">Resumen del escalamiento</Text>
              <Stack gap={0}>
                {[
                  ["Motivo", form.motivo],
                  ["Urgencia", `${urgLabel} (${urgTiempo})`],
                  ["Planes seleccionados", selPlanes.length > 0 ? selPlanes.map(pid => planesVencidos.find(p => p.id === pid)?.codigo ?? pid).join(" · ") : "Ninguno seleccionado"],
                  ["Nueva fecha propuesta", form.nuevaFecha || "Por definir"],
                  ["Canal", "Email + Registro TRM"],
                ].map(([k, v]) => (
                  <Group key={k} justify="space-between" style={{ padding: "6px 0", borderBottom: "0.5px solid var(--mantine-color-default-border)" }}>
                    <Text size="xs" c="dimmed" style={{ minWidth: 180 }}>{k}</Text>
                    <Text size="xs" fw={500} ta="right">{v}</Text>
                  </Group>
                ))}
              </Stack>
            </Surface>

            <Group justify="space-between">
              <Button variant="default" size="sm" onClick={() => setStep(1)}>← Editar</Button>
              <Text size="xs" c="dimmed">Paso 2 de 2 — Confirmacion</Text>
              <Button size="sm" color="red" loading={saving} onClick={handleSubmit}>Enviar escalamiento</Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </>
  );
}
