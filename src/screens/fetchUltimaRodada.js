// Função utilitária para buscar a última rodada e seus jogos
import axios from 'axios';

export async function fetchUltimaRodadaComJogos(API_URL, userToken) {
  // Busca todas as rodadas
  const rodadasRes = await axios.get(`${API_URL}/bolao/rodadas-todas`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const rodadas = Array.isArray(rodadasRes.data) ? rodadasRes.data : (rodadasRes.data.rodadas || []);
  if (!rodadas.length) return { rodada: null, jogos: [] };
  // Pega a de maior id
  const ultimaRodada = rodadas.reduce((acc, cur) => (Number(cur.id) > Number(acc.id) ? cur : acc), rodadas[0]);
  // Busca os jogos dessa rodada
  const jogosRes = await axios.get(`${API_URL}/bolao/rodada/${ultimaRodada.id}/partidas`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const jogos = Array.isArray(jogosRes.data) ? jogosRes.data : (jogosRes.data.partidas || []);
  return { rodada: ultimaRodada, jogos };
}
