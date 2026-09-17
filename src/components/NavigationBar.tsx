import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { NavigationContainerRefWithCurrent, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type RootStackParamList = {
  List: undefined;
  Products: undefined;
  Profile: undefined;
  AIChat: undefined;
};


function NavigationBar(props: {
    navigationRef: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>
}) {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    
    var state = props.navigationRef.getCurrentRoute() as unknown as {name: string} | undefined;

    const name = state?.name ?? "List";

    return (
        <View className="flex-row justify-around items-center absolute bottom-0 bg-white shadow-2xl shadow-black rounded-2xl p-8" style={{
            paddingBottom: insets.bottom > 0 ? insets.bottom : 16
        }}>
            <TouchableOpacity className="items-center justify-center flex-1" onPress={() => navigation.navigate("List")}>
                <FontAwesome5 name="clipboard-list" iconStyle="solid" size={40} color={name === "List" ? '#16a34a' : null}/>
                <Text className="font-bold text-lg" style={{color: name === "List" ? "#16a34a" : null}}>{"List"}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center justify-center flex-1" onPress={() => navigation.navigate("Products")}>
                <FontAwesome5 name="shopping-basket" iconStyle="solid" size={40} color={name === "Products" ? '#16a34a' : null}/>
                <Text className="font-bold text-lg" style={{color: name === "Products" ? "#16a34a" : null}}>{"Products"}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center justify-center flex-1" onPress={() => navigation.navigate("AIChat")}>
                <FontAwesome5 name="robot" iconStyle="solid" size={40} color={name === "AIChat" ? '#16a34a' : null}/>
                <Text className="font-bold text-lg" style={{color: name === "AIChat" ? "#16a34a" : null}}>{"AI Chat"}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center justify-center flex-1" onPress={() => navigation.navigate("Profile")}>
                <FontAwesome5 name="user-circle" iconStyle="solid" size={40} color={name === "Profile" ? '#16a34a' : null}/>
                <Text className="font-bold text-lg" style={{color: name === "Profile" ? "#16a34a" : null}}>{"Profile"}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default NavigationBar;
