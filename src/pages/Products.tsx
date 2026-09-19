import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Text, TouchableOpacity, View } from "react-native";
import SearchBar from "../components/SearchBar";

function ProductList() {
    return (
        <View className="px-4 pt-10 gap-8 flex-1">
            <View className="items-center">
                <Text className="text-2xl font-bold">Products</Text>
            </View>

            <View className="flex-row items-center gap-2">
                <SearchBar placeholder="Search products"/>
                <TouchableOpacity className="rounded-lg bg-green-300 border-green-600 border-2 border-solid shadow-sm shadow-black elevation-2xl">
                    <MaterialDesignIcons name="plus" size={35} color="#16a34a"/>
                </TouchableOpacity>
            </View>

            <View>

            </View>

        </View>
    )
}

export default ProductList;
