import "./src/global.css";

import { Appearance, StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import GroceryList from "./src/pages/GroceryList/GroceryList";
import AIChat from "./src/pages/AIChat/AIChat";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createNavigationContainerRef } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MessageProvider } from "./src/context/messages";
import { AIProvider } from "./src/context/ai";
import Profiles from "./src/pages/Profiles/Profiles";
import ManageGroceryList from "./src/pages/GroceryList/ManageGroceryList";
import ProductPage, { ProductPopup } from "./src/pages/Products";
import type { RootStackParamList } from "./src/components/NavigationBar";


const Stack = createNativeStackNavigator<RootStackParamList>()


function App() {
    Appearance.setColorScheme("light");
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
                        <Stack.Screen name="Products" component={ProductPage}/>
                        <Stack.Screen name="AIChat" component={AIChat}/>
                        <Stack.Screen name="Profile" component={Profiles}/>
                        <Stack.Screen name="ManageGroceryList" component={ManageGroceryList} options={{
                            animation: 'slide_from_bottom'
                        }}/>
                        <Stack.Screen name="AddProduct" component={ProductPopup} options={{
                            animation: 'slide_from_bottom'
                        }}/>
                    </Stack.Navigator>

                </MessageProvider>
                </AIProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </NavigationContainer>
    );
}

export default App;
