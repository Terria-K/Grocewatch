import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SearchBar from "../components/SearchBar";
import NavigationBar from "../components/NavigationBar";
import Decimal from "decimal.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";


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

type ProductProps = {
    name: string,
    price: Decimal,
    unit: string,
    category: string
}

function Product({ name, price, category, unit }: ProductProps) {
    return (
        <View className="rounded-lg border-gray-600 border p-4 flex-row items-center w-full">
            <View className="flex-1 justify-center">
                <Text className="font-bold text-lg">{name}</Text>
                <Text className="text-green-600 text-sm">{category}</Text>

                <Text className="mt-2">₱{price.toFixed(2)} / {unit}</Text>

            </View>

            <View className="w-[2px] h-full bg-gray-200 mx-3 rounded-xl"/>

            <View className="items-end justify-center gap-2">
                <View>
                    <Text className="text-gray-500 text-xs">Calories</Text>
                    <Text className="text-green-600 text-sm">89 kcal</Text>
                </View>

                <View>
                    <Text className="text-gray-500 text-xs">Stock</Text>
                    <Text className="text-green-600 text-sm">24 kg</Text>
                </View>
            </View>

        </View>
    )
}

function ProductList() {
    const insets = useSafeAreaInsets();

    const bottomPadding = 80 + (insets.bottom > 0 ? insets.bottom : 20) + 20;

    const getProducts = () => {
        return [
        {
            name: "Apple",
            price: new Decimal(50),
            category: "Fruits",
            unit: "pc"
        },
        {
            name: "Avocado",
            price: new Decimal(100),
            category: "Fruits",
            unit: "pc"
        },
        {
            name: "Avocado",
            price: new Decimal(100),
            category: "Fruits",
            unit: "pc"
        },
        {
            name: "Avocado",
            price: new Decimal(100),
            category: "Fruits",
            unit: "pc"
        },
        {
            name: "Avocado",
            price: new Decimal(100),
            category: "Fruits",
            unit: "pc"
        },
        ]
    }

    const products = getProducts()

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

            <View className="flex-1 gap-4" style={{paddingBottom: bottomPadding}}>
                <View>
                    <Text className="font-bold text-xl">All Products</Text>
                    <Text className="color-gray-400">{products.length} Products</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName=" gap-4">
                {products.map((x, i) => {
                    return <Product key={i} name={x.name} category={x.category} price={x.price} unit={x.unit}/>
                })}
                </ScrollView>
            </View>

        </View>

        <NavigationBar currentRoute="Products"/>
        </>
    )
}

export default ProductList;

const productStyles = StyleSheet.create({

})
