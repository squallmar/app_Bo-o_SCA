import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importando as telas
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PalpiteScreen from './src/screens/PalpiteScreen';
import RankingScreen from './src/screens/RankingScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Login' }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Cadastro' }} 
        />
        <Stack.Screen 
          name="Palpite" 
          component={PalpiteScreen} 
          options={{ title: 'Fazer um Palpite' }} 
        />
        <Stack.Screen 
          name="Ranking" 
          component={RankingScreen} 
          options={{ title: 'Ranking do Bolão' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
