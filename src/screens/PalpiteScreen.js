import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUltimaRodadaComJogos } from './fetchUltimaRodada';
import { fetchMeusPalpites } from './fetchMeusPalpites';
import { fetchLockStatus } from './fetchLockStatus';

// URL da API no Render
const API_URL = 'https://bolaosca4-0.onrender.com';

const PalpiteScreen = ({ navigation }) => {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [palpites, setPalpites] = useState({});
  const [rodada, setRodada] = useState(null);
  const [lockStatus, setLockStatus] = useState({ locked: false, weekend: false, pending: false });
  const [editando, setEditando] = useState({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const userToken = await AsyncStorage.getItem('userToken');
  const ultimaRodadaComJogos = await fetchUltimaRodadaComJogos(API_URL, userToken);
  setRodada(ultimaRodadaComJogos.rodada);
  setJogos(ultimaRodadaComJogos.jogos);
        if (ultimaRodadaComJogos.rodada && ultimaRodadaComJogos.rodada.id) {
          const meusPalpites = await fetchMeusPalpites(API_URL, ultimaRodadaComJogos.rodada.id, userToken);
          setPalpites(meusPalpites);
        }
        // Busca status de bloqueio global
        const lock = await fetchLockStatus(API_URL);
        setLockStatus(lock || { locked: false });
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível carregar os jogos da última rodada.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePalpiteChange = (jogoId, tipo, valor) => {
    setPalpites((prevPalpites) => ({
      ...prevPalpites,
      [jogoId]: tipo === 'palpite' ? valor : prevPalpites[jogoId],
    }));
  };

  const enviarPalpite = async (jogoId) => {
    const palpite = palpites[jogoId];
    if (!palpite) {
      Alert.alert('Atenção', 'Selecione um palpite para este jogo.');
      return;
    }
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      await axios.post(
        `${API_URL}/api/palpites`,
        {
          jogoId,
          palpite,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      Alert.alert('Sucesso', 'Palpite salvo com sucesso!');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o palpite.');
    }
  };

  const renderJogo = ({ item }) => {
    const palpite = palpites[item.id];
    const time1 = item.time1 || item.timeA || 'Time 1';
    const time2 = item.time2 || item.timeB || 'Time 2';
    const escudo1 = item.escudo1 || item.time1_escudo || item.timeA_escudo || null;
    const escudo2 = item.escudo2 || item.time2_escudo || item.timeB_escudo || null;
    const bloqueado = lockStatus.locked;
    // Cadeado unicode: \uD83D\uDD12
    const cadeado = ' \uD83D\uDD12';
    return (
      <View style={styles.jogoCard}>
        <View style={styles.teamsRow}>
          <View style={styles.teamBlock}>
            {escudo1 ? (
              <Image source={{ uri: escudo1 }} style={styles.escudoImg} resizeMode="contain" />
            ) : null}
            <Text style={styles.teamName}>{time1}</Text>
          </View>
          <Text style={styles.xLabel}>X</Text>
          <View style={styles.teamBlock}>
            {escudo2 ? (
              <Image source={{ uri: escudo2 }} style={styles.escudoImg} resizeMode="contain" />
            ) : null}
            <Text style={styles.teamName}>{time2}</Text>
          </View>
        </View>
        <View style={styles.palpiteRow}>
          <View style={styles.palpiteBtnCol}>
            <Button
              title={bloqueado ? `Vence${cadeado}` : 'Vence'}
              color={palpite === 'timeA' || palpite === 'time1' ? '#3a86ff' : '#ccc'}
              onPress={() => handlePalpiteChange(item.id, 'palpite', 'timeA')}
              disabled={bloqueado}
            />
          </View>
          <View style={styles.palpiteBtnCol}>
            <Button
              title={bloqueado ? `Empate${cadeado}` : 'Empate'}
              color={palpite === 'empate' ? '#f59e0b' : '#ccc'}
              onPress={() => handlePalpiteChange(item.id, 'palpite', 'empate')}
              disabled={bloqueado}
            />
          </View>
          <View style={styles.palpiteBtnCol}>
            <Button
              title={bloqueado ? `Vence${cadeado}` : 'Vence'}
              color={palpite === 'timeB' || palpite === 'time2' ? '#ff006e' : '#ccc'}
              onPress={() => handlePalpiteChange(item.id, 'palpite', 'timeB')}
              disabled={bloqueado}
            />
          </View>
        </View>
        <View style={styles.salvarBtnWrapper}>
          <Button
            title={bloqueado ? `Salvar${cadeado}` : 'Salvar'}
            onPress={() => enviarPalpite(item.id)}
            disabled={bloqueado}
            color={bloqueado ? '#aaa' : '#1976d2'}
          />
        </View>
        <View style={styles.editarBtnWrapper}>
          <Button
            title={bloqueado ? `Editar Palpite${cadeado}` : 'Editar Palpite'}
            onPress={() => setEditando(e => ({ ...e, [item.id]: true }))}
            disabled={bloqueado}
            color={bloqueado ? '#aaa' : '#e53935'}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando jogos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>
        {rodada ? `Rodada ${rodada.nome || rodada.id}` : 'Faça seus Palpites'}
      </Text>
      {lockStatus.locked && (
        <View style={{ backgroundColor: '#fff3cd', borderRadius: 8, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#ffeeba' }}>
          <Text style={{ color: '#856404', fontWeight: 'bold', textAlign: 'center' }}>
            Palpites e edições já encerradas para essa rodada!
          </Text>
        </View>
      )}
      <FlatList
        data={jogos}
        keyExtractor={(item, index) => (item && item.id ? item.id.toString() : index.toString())}
        renderItem={renderJogo}
      />
      <Button
        title="Ver o Ranking"
        onPress={() => navigation.navigate('Ranking')}
        color="#43a047"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  teamBlock: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  escudoImg: {
    width: 40,
    height: 40,
    marginBottom: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  maxWidth: 120,
  flexWrap: 'wrap',
  lineHeight: 18,
  minHeight: 20,
  paddingHorizontal: 2,
  },
  xLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 8,
    color: '#888',
  },
  jogoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jogoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  palpiteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  palpiteBtnCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  salvarBtnWrapper: {
    marginTop: 8,
    marginBottom: 6,
  },
  editarBtnWrapper: {
    marginTop: 0,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
});

export default PalpiteScreen;
