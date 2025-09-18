import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

// URL da sua API
const API_URL = 'https://bolaosca4-0.onrender.com';

const RegisterScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!nome || !email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/register`, {
        nome,
        email,
        password,
      });

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Cadastro realizado! Faça login agora.');
        navigation.replace('Login');
      } else {
        Alert.alert('Erro', 'Não foi possível cadastrar.');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        Alert.alert('Erro', error.response.data.message || 'Dados inválidos.');
      } else {
        Alert.alert('Erro', 'Falha ao conectar ao servidor.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />

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

      <Button title="Cadastrar" onPress={handleRegister} />

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Já tem conta?</Text>
        <Button
          title="Entrar"
          onPress={() => navigation.replace('Login')}
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
  loginContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
  },
});

export default RegisterScreen;
