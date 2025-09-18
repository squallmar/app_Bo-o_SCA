import React, { useState, useEffect } from 'react';
import goldMedal from '../imagens/gold.png';
import silverMedal from '../imagens/silver.png';
import bronzeMedal from '../imagens/bronze.png';
import pessoasImg from '../imagens/4pessoas.png';
import pangareImg from '../imagens/pangare.jpg';
import { Picker } from '@react-native-picker/picker';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL da API no Render
const API_URL = 'https://bolaosca4-0.onrender.com';

const RankingScreen = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modo, setModo] = useState('rodada'); // 'rodada' ou 'geral'
  const [rodadas, setRodadas] = useState([]);
  const [rodadaId, setRodadaId] = useState('');
  const [rodadaNome, setRodadaNome] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const userToken = await AsyncStorage.getItem('userToken');
        // Busca rodadas
        const rodadasRes = await axios.get(`${API_URL}/bolao/rodadas-todas`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        const rodadasArr = Array.isArray(rodadasRes.data) ? rodadasRes.data : (rodadasRes.data.rodadas || []);
        setRodadas(rodadasArr);
        // Seleciona a última rodada por padrão
        if (rodadasArr.length && !rodadaId) {
          const ultima = rodadasArr.reduce((acc, cur) => (Number(cur.id) > Number(acc.id) ? cur : acc), rodadasArr[0]);
          setRodadaId(ultima.id.toString());
          setRodadaNome(ultima.nome || `Rodada ${ultima.id}`);
        }
      } catch (e) {
        setRodadas([]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodadaId]);

  useEffect(() => {
    fetchRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, rodadaId]);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      let response;
      if (modo === 'geral') {
        response = await axios.get(`${API_URL}/palpite/ranking/geral`, {
          headers: { Authorization: `Bearer ${userToken}` },
          // params: { bolaoId, campeonatoId, ano } // descomente se precisar passar filtros
        });
        // Se a resposta for HTML (erro), não tente processar
        if (typeof response.data === 'string' && response.data.startsWith('<!doctype html')) {
          console.error('Erro: resposta HTML recebida no ranking geral');
          setRanking([]);
          setRodadaNome('Ranking Geral');
          Alert.alert('Erro', 'Não foi possível carregar o ranking geral.');
          return;
        }
        // Normaliza para array
        const arr = Array.isArray(response.data) ? response.data : response.data.ranking || [];
        setRanking(Array.isArray(arr) ? arr : []);
        setRodadaNome('Ranking Geral');
      } else {
        // Ranking da rodada
        if (!rodadaId) return;
        response = await axios.get(`${API_URL}/palpite/ranking/rodada/${rodadaId}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        // Se a resposta for HTML (erro), não tente processar
        if (typeof response.data === 'string' && response.data.startsWith('<!doctype html')) {
          console.error('Erro: resposta HTML recebida no ranking da rodada');
          setRanking([]);
          const rodada = rodadas.find(r => String(r.id) === String(rodadaId));
          setRodadaNome(rodada ? (rodada.nome || `Rodada ${rodada.id}`) : `Rodada ${rodadaId}`);
          Alert.alert('Erro', 'Não foi possível carregar o ranking da rodada.');
          return;
        }
        const arr = Array.isArray(response.data) ? response.data : response.data.ranking || [];
        setRanking(Array.isArray(arr) ? arr : []);
        // Atualiza nome da rodada
        const rodada = rodadas.find(r => String(r.id) === String(rodadaId));
        setRodadaNome(rodada ? (rodada.nome || `Rodada ${rodada.id}`) : `Rodada ${rodadaId}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar o ranking.');
    } finally {
      setLoading(false);
    }
  };

  // Medalha/top3/pangaré
  const getMedal = (pos, isLast) => {
    if (pos === 1) {
      return <Image source={goldMedal} style={styles.medalIcon} />;
    } else if (pos === 2) {
      return <Image source={silverMedal} style={styles.medalIcon} />;
    } else if (pos === 3) {
      return <Image source={bronzeMedal} style={styles.medalIcon} />;
    } else if (pos === 4) {
      return <Image source={pessoasImg} style={styles.medalIcon} />;
    } else if (isLast) {
      return <Image source={pangareImg} style={styles.medalIcon} />;
    } else {
      return <Text style={styles.itemPosition}>{pos}º</Text>;
    }
  };

  // Avatar: mostra imagem se houver, senão iniciais
  const getInitials = (nome = '') => {
    const parts = String(nome).trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() || '').join('') || 'U';
  };
  const renderAvatar = (item) => {
    const fotoUrl = item.foto_url || item.fotoUrl || item.avatar_url || item.avatarUrl || '';
    if (fotoUrl && fotoUrl.startsWith('http')) {
      return <Image source={{ uri: fotoUrl }} style={styles.avatarImg} />;
    }
    return (
      <View style={styles.avatarInitials}>
        <Text style={styles.avatarInitialsText}>{getInitials(item.apelido || item.nomeUsuario || item.nome || item.usuario || item.user || '')}</Text>
      </View>
    );
  };

  // Status
  const renderStatus = (item) => {
    if (item.banido) return <Text style={styles.statusBanido}>Banido</Text>;
    if (item.desistiu) return <Text style={styles.statusDesistiu}>Desistiu</Text>;
    return null;
  };

  const renderRankingItem = ({ item, index }) => {
    try {
      if (!item || typeof item !== 'object') return null;
      const pos = index + 1;
      const isTop3 = pos <= 3;
      const isLastFixed = index === ranking.length - 1;
      // Debug: mostrar o objeto item completo para identificar o campo de pontos
      console.log('Ranking item:', JSON.stringify(item));
      return (
        <View style={[styles.itemContainer, isTop3 && styles.topThree, pos === 4 && styles.pangare, isLastFixed && styles.pangare]}>
          <View style={styles.medalCol}>{getMedal(pos, isLastFixed)}</View>
          <View style={styles.avatarCol}>{renderAvatar(item)}</View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item?.apelido || item?.nome || item?.nomeUsuario || item?.usuario || item?.user || 'Usuário'}</Text>
            {renderStatus(item)}
          </View>
          <View style={styles.scoreCol}>
            <Text style={styles.itemScore}>
              {item?.pontos !== undefined ? Number(item.pontos) : 0} pts
            </Text>
          </View>
        </View>
      );
    } catch (err) {
      console.error('Erro ao renderizar ranking item:', err);
      return (
        <View style={styles.itemContainer}>
          <Text style={{ color: 'red' }}>Erro ao exibir ranking</Text>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando ranking...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.modoBtnRow}>
        <Text
          style={[styles.modoBtn, modo === 'rodada' && styles.modoBtnAtivo]}
          onPress={() => setModo('rodada')}
        >
          Ranking da Rodada
        </Text>
        <Text
          style={[styles.modoBtn, modo === 'geral' && styles.modoBtnAtivo]}
          onPress={() => setModo('geral')}
        >
          Ranking Geral
        </Text>
      </View>
      {modo === 'rodada' && rodadas.length > 0 && (
        <View style={styles.rodadaPickerContainer}>
          <Text style={styles.rodadaPickerLabel}>Selecione a Rodada:</Text>
          <Picker
            selectedValue={rodadaId}
            onValueChange={value => setRodadaId(value)}
            style={styles.rodadaPicker}
            itemStyle={styles.rodadaPickerItem}
          >
            {rodadas.map(item => (
              <Picker.Item
                key={item.id}
                label={item.nome || `Rodada ${item.id}`}
                value={item.id.toString()}
              />
            ))}
          </Picker>
        </View>
      )}
      <Text style={styles.title}>{rodadaNome}</Text>
      {ranking.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 30, color: '#888' }}>
          Sem ranking para esta rodada.
        </Text>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
          renderItem={renderRankingItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rodadaPickerContainer: {
    marginBottom: 10,
  },
  rodadaPickerLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rodadaPicker: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  rodadaPickerItem: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medalCol: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    marginRight: 2,
  },
  avatarCol: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
  },
  avatarInitials: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffe0b2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b26a00',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  itemScore: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  scoreCol: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  topThree: {
    borderWidth: 2,
    borderColor: '#ffd700',
    backgroundColor: '#fffde7',
  },
  pangare: {
    borderWidth: 2,
    borderColor: '#ff7043',
    backgroundColor: '#fff3e0',
  },
  statusBanido: {
    color: '#fff',
    backgroundColor: '#b71c1c',
    fontWeight: 'bold',
    borderRadius: 6,
    paddingHorizontal: 6,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  statusDesistiu: {
    color: '#fff',
    backgroundColor: '#616161',
    fontWeight: 'bold',
    borderRadius: 6,
    paddingHorizontal: 6,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  modoBtn: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginHorizontal: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  modoBtnAtivo: {
    color: '#fff',
    backgroundColor: '#1976d2',
  },
  rodadaBtn: {
    fontSize: 15,
    color: '#1976d2',
    backgroundColor: '#e3f2fd',
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rodadaBtnAtivo: {
    backgroundColor: '#1976d2',
    color: '#fff',
  },
});

export default RankingScreen;
