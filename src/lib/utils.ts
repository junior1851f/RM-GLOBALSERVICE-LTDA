import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MASTER_PASSWORD = "1851";

export interface User {
  id: string;
  name: string;
  pin: string;
}

export interface Remanejamento {
  id?: string;
  solicitante: string;
  nome: string;
  drt: string;
  origem: string;
  destino: string;
  fiscal: string;
  turno: 'Diurno' | 'Noturno';
  dataServico: string;
  dataFolga: string;
  escala: '12x36' | '5x2' | '6x1';
  motivo: string;
  timestamp: any;
}

export interface Config {
  whatsappNumber: string;
}
