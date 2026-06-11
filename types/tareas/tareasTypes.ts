export type Prioridad = "Baja" | "Media" | "Alta";
export type Filtro = "Todas" | "Pendientes" | "Completadas";

export interface Tarea {
  id: string;
  user_id: string;
  titulo: string;
  descripcion?: string;
  fechaLimite?: string;
  prioridad: Prioridad;
  completada: number;
  sync_status: string;
  deleted: number;
  created_at: string;
  updated_at: string;
}

export const PRIORIDADES: Prioridad[] = ["Baja", "Media", "Alta"];
export const FILTROS: Filtro[] = ["Todas", "Pendientes", "Completadas"];