export interface Evento {
  id: string;
  user_id: string;
  titulo: string;
  fecha: string;
  hora: string;
  descripcion?: string;
  asistencia?: "asistio" | "no_asistio" | "" | null;
  sync_status: string;
  deleted: number;
  created_at: string;
  updated_at: string;
}

export type ModoAgenda = "registrar" | "editar";
export type AmPm = "AM" | "PM";

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];