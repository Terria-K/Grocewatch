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
import CreateGroceryList from "./src/pages/GroceryList/CreateGroceryList";
import Notifications from "./src/pages/Notifications";
import PriceHistory from "./src/pages/PriceHistory";
import CreateAccount from "./src/pages/Profiles/CreateAccount";
import Login from "./src/pages/Profiles/Login";
import { useEffect } from "react";
import { loadProduct, useProducts } from "./src/context/products";

const Stack = createNativeStackNavigator<RootStackParamList>()


function App() {
    Appearance.setColorScheme("light");
    const isDarkMode = useColorScheme() === 'dark';
    const navigationRef = createNavigationContainerRef();

    const products = useProducts();

    useEffect(() => {
        loadProduct().then(x => {
            console.log(x);
            products.load(x);
        });
    }, [])

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
                        <Stack.Screen name="CreateGroceryList" component={CreateGroceryList} options={{
                            animation: 'slide_from_bottom'
                        }}/>
                        <Stack.Screen name="ManageGroceryList" component={ManageGroceryList} options={{
                            animation: 'slide_from_bottom'
                        }}/>
                        <Stack.Screen name="AddProduct" component={ProductPopup} options={{
                            animation: 'slide_from_bottom'
                        }}/>

                        <Stack.Screen name="ProductHistory" component={PriceHistory} options={{
                            animation: 'slide_from_bottom'
                        }}/>

                        <Stack.Screen name="CreateAccount" component={CreateAccount} options={{
                            animation: 'slide_from_bottom'
                        }}/>

                        <Stack.Screen name="Login" component={Login} options={{
                            animation: 'slide_from_bottom'
                        }}/>

                        <Stack.Screen name="Notifications" component={Notifications} options={{
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
