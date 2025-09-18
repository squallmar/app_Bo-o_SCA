// Função para buscar o status de bloqueio global de apostas
import axios from 'axios';

export async function fetchLockStatus(API_URL) {
  const res = await axios.get(`${API_URL}/palpite/lock`);
  // Espera: { locked: boolean, weekend: boolean, pending: boolean }
  return res.data;
}
