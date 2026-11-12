import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { images, ProductImage, useProducts } from "../../context/products";
import { makeNameFirstCharacterUppercase } from "../../utils/utils";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../components/NavigationBar";

type ProductProps = {
    id: string,
    name: string,
    price: number,
    calories: number,
    unit: string,
    category: string,
    onPress: () => void
}

function Product({ id, name, price, category, calories, unit, onPress }: ProductProps) {
    return (
        <TouchableOpacity className="rounded-lg border-gray-600 border p-4 flex-row items-center w-full gap-4 bg-white" onPress={onPress}>
            <View>
                <Image 
                    source={images[id as ProductImage]}
                    style={productStyles.product}
                    className="rounded-xl"
                />
            </View>
            <View className="flex-1 justify-center">

                <Text className="font-bold text-lg">{name}</Text>
                <Text className="text-green-600 text-sm">{makeNameFirstCharacterUppercase(category)}</Text>
            </View>

            <View className="w-[2px] h-full bg-gray-200 mx-3 rounded-xl"/>

            <View className="justify-center gap-2">

                <View>
                    <Text className="text-gray-500 text-xs">Price</Text>
                    {
                        !price ? <Text>Not Available</Text>
                        : 
                            <View>
                                <Text className="mt-2 font-bold">₱{price?.toFixed(2)}</Text>
                                <Text className="text-sm"> / {unit}</Text>
                            </View>
                    }
                </View>

                <View className="min-w-14">
                    <Text className="text-gray-500 text-xs">Calories</Text>
                    <Text className="text-green-600 text-sm">{calories} kcal</Text>
                </View>
            </View>

        </TouchableOpacity>
    )
}

const productStyles = StyleSheet.create({
    product: {
        width: 80,
        height: 80
    }
})

function AdminProducts() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const products = useProducts(x => x.products);

    return <View className="px-4 pt-10 gap-6 flex-1">
            <View className="items-center">
                <Text className="text-2xl font-bold">Products</Text>
            </View>

            <TouchableOpacity className="p-4 flex-row justify-center items-center bg-green-300 rounded-xl mx-4" onPress={() => navigation.navigate("AdminAddOrViewProduct", {})}>
                <MaterialDesignIcons name="plus" size={20} color="#15803d"/>
                <Text className="font-bold text-green-700">Create Product</Text>
            </TouchableOpacity>
                
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4">
                {products.map((x, i) => {
                    return <Product 
                        onPress={() => navigation.navigate("AdminAddOrViewProduct", { product: x })}
                        key={i} id={x.productID} name={x.name} category={x.category} price={x.price} unit={x.unit} calories={x.calories}/>
                })}
            </ScrollView>
    </View>
}

export default AdminProducts;
