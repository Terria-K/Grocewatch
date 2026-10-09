import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import {  Dimensions, ScrollView, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import type { RootStackParamList } from "../../components/NavigationBar";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import SearchBar from "../../components/SearchBar";
import { useGroceryList, type OnCartProduct } from "../../context/grocerylist";
import { type Product, useProducts } from "../../context/products";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetHandle } from "../../components/BottomSheet";
import { useCallback, useRef, useState } from "react";

const { height: screenHeight} = Dimensions.get('screen');


type ProductCardProps = {
    products: Product[],
    product: OnCartProduct,
    onPress: (onCartProduct: OnCartProduct) => void
}

function ProductCard({ products, product, onPress }: ProductCardProps) {
    const prod = products.filter(x => x.productID === product.productID).at(0)


    return (
        <TouchableNativeFeedback onPress={() => onPress(product)}>
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
        </TouchableNativeFeedback>
    )
}

type ProductViewProps = {
    selectedProduct: OnCartProduct,
    setQuantity: (text: string) => void
}

function ProductView({ selectedProduct, setQuantity } : ProductViewProps) {

    return (
        <View className="items-center">
            <Text className="font-bold">Quantity</Text> 
            <View className="justify-center items-center gap-4">
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity onPress={() => {
                        if (selectedProduct.quantity == 0) {
                            setQuantity('0');
                            return
                        }

                        setQuantity((selectedProduct.quantity - 1).toString())
                    }}>
                        <MaterialDesignIcons name="minus" size={20} />
                    </TouchableOpacity>

                    <TextInput 
                        value={selectedProduct.quantity.toString()}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                        className="p-4 bg-gray-200 rounded-xl w-14 text-center text-black"
                        placeholder="0" />

                    <TouchableOpacity onPress={() => setQuantity((selectedProduct.quantity + 1).toString())}>
                        <MaterialDesignIcons name="plus" size={20} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

type ManageGroceryListProps = NativeStackScreenProps<RootStackParamList, 'ManageGroceryList'>;

function ManageGroceryList({ route }: ManageGroceryListProps) {
    const p = route.params;
    const groceryListID = p?.groceryListID;

    const groceryList = useGroceryList(x => x.groceryList.filter(x => x.grocerylistID === groceryListID).at(0));
    const groceryListState = useGroceryList();

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedProduct, setSelectedProduct] = useState<OnCartProduct>();

    const products = useProducts(x => x.products);
    const insets = useSafeAreaInsets();

    const bottomPadding = 90 + (insets.bottom > 0 ? insets.bottom : 16) + 16;

    const addButton = () => {
        if (groceryList) {
            navigation.navigate("AddProduct", { groceryListID: groceryList.grocerylistID })
        }
    }

    const onView = useCallback((product: OnCartProduct) => {
        bottomSheetRef.current?.openSheet();

        console.log(product);

        setSelectedProduct(product);
        setQuantity(product.quantity.toString());
    }, []);

    const setQuantity = async (num: string) => {
        if (!selectedProduct) {
            return;
        }

        groceryListState.setProductQuantity(groceryList!.grocerylistID, selectedProduct.productID, +num)
        setSelectedProduct(x => ({
            ...x!,
            quantity: +num
        }))

        await groceryListState.saveGroceryList();
    }

    const bottomSheetRef = useRef<BottomSheetHandle>(null);

    return (
    <>
    <View className="px-4 pt-10 gap-8 flex-1" style={{paddingBottom: bottomPadding}}>
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
            {groceryList!.products.map((x, i) => <ProductCard onPress={onView} products={products} product={x} key={i}/>)}
            </ScrollView>
        </View>
    </View>

        <BottomSheet
            ref={bottomSheetRef}
            activeHeight={screenHeight * 0.55}
            backdropColor="rgba(0,0,0,0.5)"
            closeHeight={150}
            backgroundColor="white"
        >
            {selectedProduct ?
                <ProductView selectedProduct={selectedProduct} setQuantity={setQuantity}/>
                : null
            }
        </BottomSheet>
    </>)
}

export default ManageGroceryList;
