function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = '/dashboard';
const ROOTS_AUTH = '/auth';

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  default: path(ROOTS_DASHBOARD, '/default')
};

const ROOT_OPERADOR = '/operador';

export const PATH_OPERADOR = {
  root: ROOT_OPERADOR,
  dashboard: path(ROOT_OPERADOR, '/dashboard'),
  gestionIncidentes: path(ROOT_OPERADOR, '/gestion-incidentes'),
  registroIncidente: path(ROOT_OPERADOR, '/registro-incidente'),
  registroRiesgo: path(ROOT_OPERADOR, '/registro-riesgo'),
  nuevoPlan: path(ROOT_OPERADOR, '/nuevo-plan'),
  seguimientoPlanes: path(ROOT_OPERADOR, '/seguimiento-planes'),
  reporteEjecutivo: path(ROOT_OPERADOR, '/reporte-ejecutivo'),
  gestionRiesgos: path(ROOT_OPERADOR, '/gestion-riesgos'),
  detalleRiesgo: path(ROOT_OPERADOR, '/detalle-riesgo'),
  escalamiento: path(ROOT_OPERADOR, '/escalamiento'),
  configuracion: path(ROOT_OPERADOR, '/configuracion'),
  editarIncidente: path(ROOT_OPERADOR, '/editar-incidente'),
  editarRiesgo: path(ROOT_OPERADOR, '/editar-riesgo'),
  editarPlan: path(ROOT_OPERADOR, '/editar-plan'),
  historialEscalamientos: path(ROOT_OPERADOR, '/historial-escalamientos'),
};

const ROOTS_ADMIN = '/admin';

export const PATH_ADMIN = {
  root: ROOTS_ADMIN,
  users: path(ROOTS_ADMIN, '/users'),
};

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  signin: path(ROOTS_AUTH, '/signin'),
  signup: path(ROOTS_AUTH, '/signup'),
  passwordReset: path(ROOTS_AUTH, '/password-reset'),
  clerk: path(ROOTS_AUTH, '/clerk'),
  auth0: path(ROOTS_AUTH, '/auth0'),
};
