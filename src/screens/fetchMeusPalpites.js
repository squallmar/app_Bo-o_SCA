// Função para buscar palpites do usuário para uma rodada
import axios from 'axios';

export async function fetchMeusPalpites(API_URL, rodadaId, userToken) {
  const res = await axios.get(`${API_URL}/palpite/meus/${rodadaId}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  // Retorna um map: partida_id -> palpite
  const arr = Array.isArray(res.data) ? res.data : [];
  const map = {};
  for (const p of arr) map[p.partida_id] = String(p.palpite || '').toLowerCase();
  return map;
}
