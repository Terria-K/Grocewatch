import "./src/global.css";

import { StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import GroceryList from "./src/pages/GroceryList/GroceryList";
import ProductList from "./src/pages/Products";
import AIChat from "./src/pages/AIChat/AIChat";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createNavigationContainerRef } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MessageProvider } from "./src/context/messages";
import { AIProvider } from "./src/context/ai";


const Stack = createNativeStackNavigator()


function App() {
    const isDarkMode = useColorScheme() === 'dark';
    const navigationRef = createNavigationContainerRef();


    return (
        <NavigationContainer ref={navigationRef}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <GestureHandlerRootView>
                <SafeAreaProvider>
                <AIProvider>
                <MessageProvider>

                    <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="List">
                        <Stack.Screen name="List" component={GroceryList}/>
                        <Stack.Screen name="Products" component={ProductList}/>
                        <Stack.Screen name="AIChat" component={AIChat}/>
                    </Stack.Navigator>

                </MessageProvider>
                </AIProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </NavigationContainer>
    );
}

export default App;
