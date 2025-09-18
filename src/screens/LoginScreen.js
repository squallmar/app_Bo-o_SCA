import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Substitua pela URL da sua API
const API_URL = 'https://bolaosca4-0.onrender.com';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }

    try {
      // 1. Buscar o token CSRF (com withCredentials)
      const csrfResponse = await axios.get(`${API_URL}/csrf-token`, { withCredentials: true });
      const csrfToken = csrfResponse.data.csrfToken;

      // 2. Enviar o token no header do login (com withCredentials)
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, senha: password },
        { headers: { 'X-CSRF-Token': csrfToken }, withCredentials: true }
      );

      if (response.status === 200 && response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        navigation.replace('Palpite');
      } else {
        Alert.alert('Erro', 'E-mail ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (error.response?.status === 401) {
        Alert.alert('Erro', 'E-mail ou senha incorretos.');
      } else if (error.response?.data) {
        Alert.alert('Erro', JSON.stringify(error.response.data));
      } else {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acessar Minha Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Entrar" onPress={handleLogin} />

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Ainda não tem conta?</Text>
        <Button
          title="Cadastrar"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
  },
});

export default LoginScreen;
