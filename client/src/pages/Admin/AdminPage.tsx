import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Text, TouchableOpacity, View } from "react-native";
import HorizontalSeparator from "../../components/HorizontalSeparator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../components/NavigationBar";

function AdminPage() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return <View className="px-4 pt-10 gap-6 flex-1">
        <View className="flex-row gap-2">
            <TouchableOpacity className="justify-center" onPress={() => navigation.goBack()}>
                <MaterialDesignIcons name="arrow-left" size={26}/>
            </TouchableOpacity>
            <Text className="font-bold text-2xl">Admin Panel</Text>
        </View>

        <View className="gap-2">
            <TouchableOpacity className="flex-row justify-between items-center" onPress={() => navigation.navigate("AdminProduct")}>
                <View className="flex-row items-center gap-2">

                    <View>
                        <Text className="font-bold">Products</Text>
                    </View>
                </View>

                <MaterialDesignIcons name="chevron-right" size={30}/>
            </TouchableOpacity>

            <HorizontalSeparator gap={8}/>

            <TouchableOpacity className="flex-row justify-between items-center" onPress={() => navigation.navigate("AdminUser")}>
                <View className="flex-row items-center gap-2">

                    <View>
                        <Text className="font-bold">Users</Text>
                    </View>
                </View>

                <MaterialDesignIcons name="chevron-right" size={30}/>
            </TouchableOpacity>
        </View>

    </View>
}

export default AdminPage;
