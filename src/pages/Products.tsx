import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import SearchBar from "../components/SearchBar";
import NavigationBar, { RootStackParamList } from "../components/NavigationBar";
import Decimal from "decimal.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProducts } from "../context/products";
import { useRef, useState } from "react";
import BottomSheet, { BottomSheetHandle } from "../components/BottomSheet";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useNavigation } from "@react-navigation/native";
import { useGroceryList } from "../context/grocerylist";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { quadSize } from "react-native-executorch/cv";


const { height: screenHeight} = Dimensions.get('screen');

type CategoryButtonProps = {
    name: string,
    selected: boolean,
    onPress: () => void,
}

function CategoryButton({ name, selected, onPress }: CategoryButtonProps) {
    return (
        <TouchableOpacity onPress={onPress} style={[
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
    calories: number,
    unit: string,
    category: string,
    onPress: () => void
}

function Product({ name, price, category, calories, unit, onPress }: ProductProps) {
    return (
        <TouchableOpacity className="rounded-lg border-gray-600 border p-4 flex-row items-center w-full" onPress={onPress}>
            <View className="flex-1 justify-center">
                <Text className="font-bold text-lg">{name}</Text>
                <Text className="text-green-600 text-sm">{category}</Text>

                <Text className="mt-2">₱{price.toFixed(2)} / {unit}</Text>
            </View>

            <View className="w-[2px] h-full bg-gray-200 mx-3 rounded-xl"/>

            <View className="justify-center gap-2">
                <View className="min-w-14">
                    <Text className="text-gray-500 text-xs">Calories</Text>
                    <Text className="text-green-600 text-sm">{calories} kcal</Text>
                </View>

                <View>
                    <Text className="text-gray-500 text-xs">Stock</Text>
                    <Text className="text-green-600 text-sm">24 kg</Text>
                </View>
            </View>

        </TouchableOpacity>
    )
}

type ProductListProps = {
    popup: boolean,
    groceryListID?: string
}

type ProductAddViewProps = {
    groceryListID?: string,
    productID: number,
    onBack: () => void; 
}

function ProductAddView({ onBack, productID, groceryListID }: ProductAddViewProps) {
    const [quantity, setQuantity] = useState('');
    const groceryListState = useGroceryList();

    const addProduct = async () => {
        let realQuantity = +quantity;
        if (realQuantity === 0) {
            realQuantity = 1;
        }

        if (groceryListID) {
            groceryListState.addProduct(groceryListID, productID, realQuantity);
        }

        onBack();
        await groceryListState.saveGroceryList();
    }

    return (
        <View className="justify-center items-center gap-4">
            <View className="flex-row items-center gap-4">
                <TouchableOpacity onPress={() => setQuantity(x => {
                    const num = +x;
                    if (num == 0) {
                        return '0';
                    }
                    return (num - 1).toString();
                })}>
                    <MaterialDesignIcons name="minus" size={20} />
                </TouchableOpacity>

                <TextInput 
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    className="p-4 bg-gray-200 rounded-xl w-14 text-center text-black"
                    placeholder="0" />

                <TouchableOpacity onPress={() => setQuantity(x => (+x + 1).toString())}>
                    <MaterialDesignIcons name="plus" size={20} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                className="rounded-lg bg-green-700 border-green-700 border-2 border-solid p-2 flex-row items-center text-center"
                onPress={addProduct}>
                <Text className="font-bold text-white">Add Product</Text>
            </TouchableOpacity>
        </View>
    )
}

type ProductPopupProps = NativeStackScreenProps<RootStackParamList, 'AddProduct'>;

export function ProductPopup({ route }: ProductPopupProps) {
    const p = route.params;
    const groceryListID = p?.groceryListID ?? undefined;

    return <ProductList popup={true} groceryListID={groceryListID}/>
}

export function ProductList({ popup, groceryListID }: ProductListProps) {
    const products = useProducts(x => x.products);
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetHandle>(null);
    const navigation = useNavigation();
    
    const [productID, setProductID] = useState(0);
    const [category, setCategory] = useState([
        {
            "name": "All",
            "selected": true
        },
        {
            "name": "Vegetables",
            "selected": false
        },
        {
            "name": "Meat",
            "selected": false
        },
        {
            "name": "Dairy",
            "selected": false
        },
        {
            "name": "Grains",
            "selected": false
        },
    ]);

    const bottomPadding = 80 + (insets.bottom > 0 ? insets.bottom : 20) + 20;

    const productPressed = (id: number) => {
        setProductID(id);
        bottomSheetRef.current?.openSheet();
    }

    const goBack = () => {
        navigation.goBack();
    }

    return (
        <>
        <View className="px-4 pt-10 gap-6 flex-1">
            <View className="items-center">
                <Text className="text-2xl font-bold">Products</Text>
            </View>

            <View className="flex-row items-center gap-2">
                <SearchBar placeholder="Search products"/>
            </View>

            <ScrollView contentContainerStyle={{flexDirection: 'row', gap: 8}} style={{flexGrow: 0}} horizontal={true} showsHorizontalScrollIndicator={false}>
                {category.map((x, i) => (
                    <CategoryButton key={i} name={x.name} selected={x.selected} onPress={() => {
                        setCategory(category => {
                            return category.map(y => {
                                if (y.name === x.name) {
                                    y.selected = true;
                                    return y;
                                }

                                y.selected = false;
                                return y;
                            })
                        })
                    }}/>
                ))}
            </ScrollView>

            <View className="flex-1 gap-4" style={{paddingBottom: !popup ? bottomPadding : 30}}>
                <View>
                    <Text className="font-bold text-xl">All Products</Text>
                    <Text className="color-gray-400">{products.length} Products</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4">
                {products.map((x, i) => {
                    return <Product 
                        onPress={() => productPressed(x.productID)}
                        key={i} name={x.name} category={x.category} price={x.price} unit={x.unit} calories={x.calories}/>
                })}
                </ScrollView>
            </View>

        </View>

        {popup ?
        <BottomSheet ref={bottomSheetRef}
            activeHeight={screenHeight * 0.45}
            backdropColor="rgba(0,0,0,0.5)"
            closeHeight={150}
            backgroundColor="white"
        >
            <ProductAddView onBack={goBack} productID={productID} groceryListID={groceryListID}/>
        </BottomSheet> : null}
        </>
    )
}

function ProductPage() {
    return (
        <>
        <ProductList popup={false}/>

        <NavigationBar currentRoute="Products"/>
        </>
    )
}

export default ProductPage;

const productStyles = StyleSheet.create({

})
