import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SearchBar from "../components/SearchBar";
import NavigationBar from "../components/NavigationBar";

type CategoryButtonProps = {
    name: string,
    selected: boolean
}

function CategoryButton({ name, selected }: CategoryButtonProps) {
    return (
        <TouchableOpacity style={[
            categoryStyles.button,
            {
                backgroundColor: selected ? "#22c55e" : "#d1d5db",
                borderColor: selected ? "#16a34a" : "#4b5563",
            }
        ]}>
            <Text style={[{color: selected ? 'white' : 'black'}, categoryStyles.text]}>{name}</Text>
        </TouchableOpacity>
    )
}

const categoryStyles = StyleSheet.create({
    button: {
        padding: 12,
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 16
    },
    text: {
        fontWeight: 700
    }
})

function Product() {
    return (
        <>

        </>
    )
}

function ProductList() {
    return (
        <>
        <View className="px-4 pt-10 gap-6 flex-1">
            <View className="items-center">
                <Text className="text-2xl font-bold">Products</Text>
            </View>

            <View className="flex-row items-center gap-2">
                <SearchBar placeholder="Search products"/>
                <TouchableOpacity className="px-1 flex-row items-center rounded-lg bg-gray-300 border-green-600 border-2 border-solid shadow-sm shadow-black elevation-2xl">
                    <MaterialDesignIcons name="filter-outline" size={35} color="#16a34a"/>
                    <Text className="font-bold" style={{color: '#16a34a'}}>Filter</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{flexDirection: 'row', gap: 8}} style={{flexGrow: 0}} horizontal={true} showsHorizontalScrollIndicator={false}>
                <CategoryButton name="All" selected={true}/>
                <CategoryButton name="Vegetables" selected={false}/>
                <CategoryButton name="Fruits" selected={false}/>
                <CategoryButton name="Meat" selected={false}/>
                <CategoryButton name="Dairy" selected={false}/>
                <CategoryButton name="Grains" selected={false}/>
            </ScrollView>

            <View>
                <Text className="font-bold text-xl">All Products</Text>
                <Text className="color-gray-400">0 Products</Text>
            </View>

            {/* TODO: add the products */}

        </View>

        <NavigationBar currentRoute="Products"/>
        </>
    )
}

export default ProductList;

const productStyles = StyleSheet.create({

})
