import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

// URL da sua API
const API_URL = 'https://bolaosca4-0.onrender.com';

const RegisterScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contato, setContato] = useState('');
  const [tipo, setTipo] = useState('Jogador');
  const [avatar, setAvatar] = useState('');

  const handleRegister = async () => {
    if (!nome || !apelido || !email || !password || !confirmPassword || !contato || !tipo || !avatar) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    // Simple email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      Alert.alert('Atenção', 'E-mail inválido.');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/register`, {
        nome,
        apelido,
        email,
        password,
        contato,
        tipo,
        avatar,
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
        placeholder="Nome completo"
        value={nome}
        onChangeText={setNome}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Apelido (nome de exibição)"
        value={apelido}
        onChangeText={setApelido}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Contato (WhatsApp)"
        value={contato}
        onChangeText={setContato}
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipo}
          onValueChange={(itemValue) => setTipo(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Jogador" value="Jogador" />
          <Picker.Item label="Administrador" value="Administrador" />
        </Picker>
      </View>
      <TextInput
        style={styles.input}
        placeholder="URL do Avatar (Cloudinary)"
        value={avatar}
        onChangeText={setAvatar}
        placeholderTextColor="#888"
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#222',
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
