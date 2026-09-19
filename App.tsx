import "./src/global.css";

import { StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import NavigationBar from "./src/components/NavigationBar";
import GroceryList from "./src/pages/GroceryList";
import ProductList from "./src/pages/Products";
import AIChat from "./src/pages/AIChat";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createNavigationContainerRef } from "@react-navigation/native";
import { GemmaAgentProvider } from "react-native-gemma-agent";
import { calculatorSkill } from "./src/pages/calculator";
import { GestureHandlerRootView } from "react-native-gesture-handler";


const Stack = createNativeStackNavigator()
const navigationRef = createNavigationContainerRef();


function App() {
    const isDarkMode = useColorScheme() === 'dark';


    return (
        <NavigationContainer ref={navigationRef}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <GestureHandlerRootView>
                <SafeAreaProvider>
                    <GemmaAgentProvider model={{
                            repoId: 'unsloth/gemma-4-E2B-it-GGUF',
                            filename: 'gemma-4-E2B-it-Q4_K_M.gguf'
                        }}
                        skills={[calculatorSkill]}
                        systemPrompt="Become a grocery app"
                    >
                        <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="List">
                            <Stack.Screen name="List" component={GroceryList}/>
                            <Stack.Screen name="Products" component={ProductList}/>
                            <Stack.Screen name="AIChat" component={AIChat}/>
                        </Stack.Navigator>
                    </GemmaAgentProvider>

                    <NavigationBar navigationRef={navigationRef}/>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </NavigationContainer>
    );
}

export default App;
