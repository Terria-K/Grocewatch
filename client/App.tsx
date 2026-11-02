import "./src/global.css";

import { Alert, Appearance, Linking, StatusBar, ToastAndroid, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import GroceryList from "./src/pages/GroceryList/GroceryList";
import AIChat from "./src/pages/AIChat/AIChat";

import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
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
import { loadProduct } from "./src/context/products";
import EditProfile from "./src/pages/Profiles/EditProfile";
import PrivacyAndSecurity from "./src/pages/Profiles/PrivacyAndSecurity";
import ModelSettings from "./src/pages/AIChat/ModelSettings";
import SharingConfirmScreen from "./src/pages/SharingConfirmScreen";

const Stack = createNativeStackNavigator<RootStackParamList>()


function InviteHandler({ children }: { children: React.ReactNode}) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        loadProduct().catch(() => {
            ToastAndroid.show("Products are not loaded at first load, make sure you have internet connection.", ToastAndroid.LONG);
        });

        Linking.getInitialURL().then(url => {
            if (url) {
                handleIncomingUrl(url)
            }
        });

        const subscription = Linking.addEventListener('url', ({ url }) => {
            handleIncomingUrl(url);
        });

        return () => subscription.remove();
    }, [])

    function handleIncomingUrl(url: string) {
        const searchParams = new URLSearchParams(new URL(url).search);
        const id = searchParams.get("id");

        if (!id) {
            return;
        }

        navigation.navigate("SharingConfirmScreen", { inviteId: id });
    }

    
    return <>
        {children}
    </>
}

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
                <InviteHandler>

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

                        <Stack.Screen name="EditProfile" component={EditProfile} options={{
                            animation: 'slide_from_bottom'
                        }}/>

                        <Stack.Screen name="PrivacyAndSecurity" component={PrivacyAndSecurity} options={{
                            animation: 'slide_from_bottom'
                        }}/>

                        <Stack.Screen name="ModelSettings" component={ModelSettings} options={{
                            animation: 'slide_from_bottom'
                        }}/>

                        <Stack.Screen name="SharingConfirmScreen" component={SharingConfirmScreen} options={{
                            animation: 'slide_from_bottom'
                        }}/>
                    </Stack.Navigator>

                </InviteHandler>
                </MessageProvider>
                </AIProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </NavigationContainer>
    );
}

export default App;
