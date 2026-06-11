export interface Medicamento {
  id: string;
  user_id: string;
  nombre: string;
  dosisMg: string;
  cadaHoras: string;
  cantidad: string;
  umbral: string;
  photoUri?: string;
  lastTaken?: number;
  sync_status: string;
  deleted: number;
  created_at: string;
  updated_at: string;
}