import "./src/global.css";

import { StatusBar, useColorScheme, View } from 'react-native';
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


const Stack = createNativeStackNavigator()
const navigationRef = createNavigationContainerRef();


function App() {
    const isDarkMode = useColorScheme() === 'dark';


    return (
        <NavigationContainer ref={navigationRef}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <SafeAreaProvider>
                <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="List">
                    <Stack.Screen name="List" component={GroceryList}/>
                    <Stack.Screen name="Products" component={ProductList}/>
                    <Stack.Screen name="AIChat" component={AIChat}/>
                </Stack.Navigator>

                <NavigationBar navigationRef={navigationRef}/>
            </SafeAreaProvider>
        </NavigationContainer>
    );
}

export default App;
