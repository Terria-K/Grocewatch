import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Button, ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { RootStackParamList } from "../../components/NavigationBar";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import SearchBar from "../../components/SearchBar";
import { useGroceryList, type OnCartProduct } from "../../context/grocerylist";
import { type Product, useProducts } from "../../context/products";
import { useSafeAreaInsets } from "react-native-safe-area-context";


type ProductViewProps = {
    products: Product[],
    product: OnCartProduct
}

function ProductView({ products, product }: ProductViewProps) {
    const prod = products.filter(x => x.productID === product.productID).at(0)


    return (
        <View className="flex-row w-full bg-gray-100 border-b border-gray-400 p-4">
            <View className="w-[40%]">
                <Text className="font-bold text-lg">{prod?.name}</Text>
                <Text>{prod?.category}</Text>
            </View>

            <View className="justify-center items-center w-[60%]">
                <Text className="text-lg">{product.quantity} {prod?.unit}</Text>
                <Text>₱{prod?.price.toFixed(2)}</Text>
            </View>
        </View>
    )
}

type ManageGroceryListProps = NativeStackScreenProps<RootStackParamList, 'ManageGroceryList'>;

function ManageGroceryList({ route }: ManageGroceryListProps) {
    const p = route.params;
    const groceryListID = p?.groceryListID;

    const groceryList = useGroceryList(x => x.groceryList.filter(x => x.grocerylistID === groceryListID).at(0));

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const products = useProducts(x => x.products);
    const insets = useSafeAreaInsets();

    const bottomPadding = 90 + (insets.bottom > 0 ? insets.bottom : 16) + 16;

    const addButton = () => {
        if (groceryList) {
            navigation.navigate("AddProduct", { groceryListID: groceryList.grocerylistID })
        }
    }

    return (
    <>
    <View className="px-4 pt-10 gap-8 flex-1">
        <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialDesignIcons name="keyboard-backspace" size={30}/>
            </TouchableOpacity>
            <Text className="font-bold text-2xl">Manage Grocery List</Text>
        </View>

        <View className="flex-1">
            <View className="bg-gray-100 border-2 rounded-xl border-gray-400 p-4">
                <Text className="font-bold text-xl">Products</Text>

                <View className="flex-row items-center gap-2 justify-center">
                    <SearchBar placeholder="Search Products..."/>

                    <TouchableOpacity 
                    className="rounded-lg bg-green-700 border-green-700 border-2 border-solid shadow-sm shadow-black elevation-2xl p-2 flex-row items-center"
                    onPress={addButton}>
                        <MaterialDesignIcons name="plus" size={20} color="#FFFFFF"/>
                        <Text className="text-white font-bold">Add</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="rounded-xl border h-auto" showsVerticalScrollIndicator={false}>
            {groceryList!.products.map((x, i) => <ProductView products={products} product={x} key={i}/>)}
            </ScrollView>
        </View>


        <View className="flex-2" style={{paddingBottom: bottomPadding}}>
            <Button title="Save"/>
        </View>
    </View>
    </>)
}

export default ManageGroceryList;
