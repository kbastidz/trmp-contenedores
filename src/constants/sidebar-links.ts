import {
  IconBook2,
  IconBrandAuth0,
  IconBriefcase,
  IconCalendar,
  IconChartArcs3,
  IconChartBar,
  IconChartInfographic,
  IconExclamationCircle,
  IconFileInvoice,
  IconFiles,
  IconLayersSubtract,
  IconLifebuoy,
  IconList,
  IconListDetails,
  IconLogin2,
  IconMessages,
  IconPackages,
  IconReceipt2,
  IconRotateRectangle,
  IconUserCircle,
  IconUserCode,
  IconUserPlus,
  IconUserShield,
  IconShoppingCart,
  IconUsers,
  IconCoin,
  IconSpeakerphone,
  IconStethoscope,
  IconSchool,
  IconTruckDelivery,
  IconUserCog,
  IconBuilding,
  IconRobot,
  IconBell,
  IconLayoutDashboard,
  IconAlertTriangle,
  IconClipboardList,
  IconShieldCheck,
  IconChecklist,
  IconReportAnalytics,
  IconPlus,
} from '@tabler/icons-react';

import { PATH_ADMIN, PATH_AUTH, PATH_DASHBOARD, PATH_OPERADOR } from '@/routes';

export const SIDEBAR_LINKS = [
  {
    title: 'Dashboard',
    links: [
      { label: 'Dashboard Riesgos', icon: IconLayoutDashboard, link: PATH_OPERADOR.dashboard },
    ],
  },
  {
    title: 'Operador',
    links: [
      
      { label: 'Gestión Incidentes', icon: IconAlertTriangle, link: PATH_OPERADOR.gestionIncidentes },
      //{ label: 'Registrar Incidente', icon: IconClipboardList, link: PATH_OPERADOR.registroIncidente },
      //{ label: 'Registrar Riesgo', icon: IconShieldCheck, link: PATH_OPERADOR.registroRiesgo },
      { label: 'Gestión de Riesgos', icon: IconFiles, link: PATH_OPERADOR.gestionRiesgos },
      //{ label: 'Nuevo Plan', icon: IconPlus, link: PATH_OPERADOR.nuevoPlan },
      { label: 'Seguimiento Planes', icon: IconChecklist, link: PATH_OPERADOR.seguimientoPlanes },
      { label: 'Historial Escalamientos', icon: IconList, link: PATH_OPERADOR.historialEscalamientos },
      
      //{ label: 'Configuración', icon: IconUserCog, link: PATH_OPERADOR.configuracion },
    ],
  },
  {
    title: 'Admin',
    links: [
      { label: 'Users', icon: IconUserCog, link: PATH_ADMIN.users },
    ],
  },
  {
    title: 'REPORTE',
    links: [
      { label: 'Reporte Ejecutivo', icon: IconReportAnalytics, link: PATH_OPERADOR.reporteEjecutivo }
    ],
  }
  
];
