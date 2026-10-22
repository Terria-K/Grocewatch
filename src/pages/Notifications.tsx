import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../components/NavigationBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

function Notifications() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return <View className="px-4 pt-10 gap-8 flex-1">
        <View className="flex-row gap-2">
            <TouchableOpacity className="justify-center" onPress={() => navigation.goBack()}>
                <MaterialDesignIcons name="arrow-left" size={26}/>
            </TouchableOpacity>
            <Text className="font-bold text-2xl">Notification</Text>
        </View>
    </View>
}

export default Notifications;
