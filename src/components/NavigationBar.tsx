import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type RootStackParamList = {
  List: undefined;
  Products: undefined;
  Profile: undefined;
  AIChat: undefined;
};

type NavigationProp = {
    currentRoute: keyof RootStackParamList
}


function NavigationBar({ currentRoute }: NavigationProp) {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    
    return (
        <View style={[
            { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 },
            styles.container
        ]}>
            <TouchableOpacity style={styles.navigationButton} onPress={() => navigation.navigate("List")}>
                <FontAwesome5 name="clipboard-list" iconStyle="solid" size={35} color={currentRoute === "List" ? '#16a34a' : null}/>
                <Text style={[{color: currentRoute === "List" ? "#16a34a" : null}, styles.navigationText]}>{"List"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navigationButton} onPress={() => navigation.navigate("Products")}>
                <FontAwesome5 name="shopping-basket" iconStyle="solid" size={35} color={currentRoute === "Products" ? '#16a34a' : null}/>
                <Text style={[{color: currentRoute === "Products" ? "#16a34a" : null}, styles.navigationText]}>{"Products"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navigationButton} onPress={() => navigation.navigate("AIChat")}>
                <FontAwesome5 name="robot" iconStyle="solid" size={35} color={currentRoute === "AIChat" ? '#16a34a' : null}/>
                <Text style={[{color: currentRoute === "AIChat" ? "#16a34a" : null}, styles.navigationText]}>{"AI Chat"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navigationButton} onPress={() => navigation.navigate("Profile")}>
                <FontAwesome5 name="user-circle" iconStyle="solid" size={35} color={currentRoute === "Profile" ? '#16a34a' : null}/>
                <Text style={[{color: currentRoute === "Profile" ? "#16a34a" : null}, styles.navigationText]}>{"Profile"}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default NavigationBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 25
        },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 24
    },

    navigationButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 4
    },

    navigationText: {
        fontWeight: 700,
    }
});
