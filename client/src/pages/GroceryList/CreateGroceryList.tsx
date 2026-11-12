import Lucide from "@react-native-vector-icons/lucide";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Dimensions, Image, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { OnCartProduct, useGroceryList } from "../../context/grocerylist";
import { useRef, useState } from "react";
import { ulid } from "react-native-ulid-jsi";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../components/NavigationBar";
import { useUser } from "../../context/user";
import { images, Product, ProductImage, useProducts } from "../../context/products";
import { makeNameFirstCharacterUppercase } from "../../utils/utils";
import { ProductAddParam } from "../AddProduct";
import BottomSheet, { BottomSheetHandle } from "../../components/BottomSheet";

const { height: screenHeight} = Dimensions.get('screen');

type ProductCardProps = {
    products: Product[],
    product: OnCartProduct,
    onRemove: (id: OnCartProduct) => void,
    onModify: (id: OnCartProduct) => void
}

function ProductCard({ products, product, onRemove, onModify }: ProductCardProps) {
    const prod = products.filter(x => x.productID === product.productID).at(0)

    if (!prod) {
        return <View></View>;
    }

    const removeProduct = () => {
        onRemove(product);
    }

    return (
        <TouchableOpacity onPress={() => onModify(product)}>
            <View className="flex-row w-full bg-gray-100 border-b border-t border-gray-400 p-4 gap-2 items-center">
                <View className="justify-center rounded-xl">
                    <Image 
                        source={images[prod.productID as ProductImage]}
                        className="w-12 h-12 rounded-xl"
                    />
                </View>

                <View className="flex-1 w-[40%] justify-center" style={{ opacity: product.checked ? 0.5 : 1 }}>
                    <Text className="font-bold">{prod?.name}</Text>
                    <Text className="text-sm">{makeNameFirstCharacterUppercase(prod.category)}</Text>
                </View>

                <View className="flex-1 flex-row justify-between">
                    <View className="justify-center items-start w-[60%]" style={{ opacity: product.checked ? 0.5 : 1 }}>
                        <Text>{product.quantity} {prod?.unit}</Text>
                        <Text className="text-green-700 text-sm font-bold">₱{prod ? (prod.price * product.quantity).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }) : 0}</Text>
                        <Text className="text-green-700 text-xs font-bold">{prod ? (prod.calories * product.quantity).toLocaleString('en-US') : 0} kcal</Text>
                    </View>


                     <View className="flex-row items-center gap-4">
                        <TouchableOpacity>
                            <MaterialDesignIcons name="trash-can-outline" size={20} color="#dc2626" onPress={removeProduct}/>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </TouchableOpacity>
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

function CreateGroceryList() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const user = useUser();

    const [name, setName] = useState('');
    const [budgetLimit, setBudgetLimit] = useState('');
    const [calorieLimit, setCalorieLimit] = useState('');
    const [upcomingProducts, setUpcomingProducts] = useState<OnCartProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<OnCartProduct>();

    const groceryList = useGroceryList();
    const products = useProducts(x => x.products);

    const bottomSheetRef = useRef<BottomSheetHandle>(null);

    function cancel() {
        setName('')
        setBudgetLimit('')
        setCalorieLimit('')

        navigation.goBack();
    }

    async function create() {
        if (name === '') {
            ToastAndroid.show('Name field is required!', ToastAndroid.SHORT);
            return;
        }

        if (budgetLimit === '') {
            setBudgetLimit('0')
        }

        if (calorieLimit === '') {
            setCalorieLimit('0')
        }

        const lid = ulid();

        groceryList.add({
            grocerylistID: lid,
            name: name,
            budgetLimit: +budgetLimit,
            calorieLimit: +calorieLimit,
            createdAt: new Date(),
            modifiedAt: new Date(),
            products: upcomingProducts,
            defaultInviteRole: 'Viewer',
            inviteToken: null,
            users: []
        })

        user.increaseListCreated();

        await groceryList.saveGroceryList(lid);
        await user.save();


        setName('')
        setBudgetLimit('')
        setCalorieLimit('')
        navigation.goBack();
    }

    function numericTextChangeBudgetLimit(text: string) {
        const cleanNumber = text.replace(/[^0-9]/g, '')
        setBudgetLimit(cleanNumber)
    }

    function numericTextChangeCalorieLimit(text: string) {
        const cleanNumber = text.replace(/[^0-9]/g, '')
        setCalorieLimit(cleanNumber)
    }

    async function addProductToList(list: ProductAddParam[]) {
        for (let l of list) {
            setUpcomingProducts(x => [...x, { productID: l.productID, quantity: l.quantity, onCartID: ulid(), checked: false }])
        }
    }

    function addProduct() {
        navigation.navigate("AddProduct", { addCallback: addProductToList})
    }

    function removeProduct(id: OnCartProduct) {
        setUpcomingProducts(x => x.filter(x => x.onCartID !== id.onCartID))
    }

    const setQuantity = async (num: string) => {
        if (!selectedProduct) {
            return;
        }

        setUpcomingProducts(x => x.map(x => (
            x.productID === selectedProduct.productID
                ? { ...x, quantity: +num }
                : x
        )))

        setSelectedProduct(x => ({
            ...x!,
            quantity: +num
        }))
    }

    return (
        <>
        <View className="px-4 pt-10 gap-4 pb-4 flex-1">
            <View className="flex-row gap-2">
                <TouchableOpacity className="justify-center" onPress={() => navigation.goBack()}>
                    <MaterialDesignIcons name="arrow-left" size={26}/>
                </TouchableOpacity>
                <Text className="font-bold text-2xl">Create Grocery List</Text>
            </View>

            <View className="border-gray-500 border border-solid rounded-lg p-4 gap-4">
                <Text className="text-green-600 font-bold">List Details</Text>

                <View className="flex-row gap-4">
                    <View className="justify-center">
                        <View className="bg-green-400 p-3 justify-center rounded-lg">
                            <Lucide name="list-checks" size={30} color="#16a34a"/>
                        </View>
                    </View>

                    <View className="flex-1 w-full gap-2">
                        <Text>Grocery List Name <Text className="text-red-500">*</Text></Text>
                        <TextInput 
                            value={name}
                            onChangeText={setName}
                            className="border-gray-600 border border-solid rounded-lg text-black"/>
                    </View>
                </View>

                <View className="flex-row gap-4">
                    <View className="justify-center">
                        <View className="bg-green-400 p-3 justify-center rounded-lg">
                            <Lucide name="wallet" size={30} color="#16a34a"/>
                        </View>
                    </View>

                    <View className="flex-1 w-full gap-2">
                        <Text>Budget Limit <Text className="text-gray-300">  (Optional)</Text></Text>
                        <TextInput 
                            value={budgetLimit}
                            onChangeText={numericTextChangeBudgetLimit}
                            maxLength={10}
                            keyboardType="number-pad"
                            className="border-gray-600 border border-solid rounded-lg"/>
                    </View>
                </View>

                <View className="flex-row gap-4">
                    <View className="justify-center">
                        <View className="bg-green-400 p-3 justify-center rounded-lg">
                            <MaterialDesignIcons name="fire" size={30} color="#16a34a"/>
                        </View>
                    </View>

                    <View className="flex-1 w-full gap-2">
                        <Text>Calorie Limit <Text className="text-gray-300">  (Optional)</Text></Text>
                        <TextInput 
                            value={calorieLimit}
                            onChangeText={numericTextChangeCalorieLimit}
                            maxLength={10}
                            keyboardType="number-pad"
                            className="border-gray-600 border border-solid rounded-lg"/>
                    </View>
                </View>
            </View>

            <View className="flex-1 border-gray-500 border border-solid rounded-lg p-4 gap-5">
                <View className="gap-3">
                    <Text className="text-green-600 font-bold">
                        Add Initial Product
                        <Text className="text-gray-300">  (Optional)</Text>
                    </Text>

                    <View className="flex-row items-center gap-2">
                        <View className="flex-1 flex-row items-center">
                            <View className="bg-green-200 p-1 rounded-l-xl border border-green-500 z-[10]">
                                <MaterialDesignIcons name="magnify" size={30}/>
                            </View>
                            <View className="bg-white flex-1">
                                <TextInput 
                                    maxLength={10}
                                    className="border-gray-600 border border-solid rounded-r-xl"/>
                            </View>
                        </View>

                        <TouchableOpacity className="bg-green-600 p-4 rounded-xl" onPress={addProduct}>
                            <Text className="text-white font-bold">Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {
                    upcomingProducts.length === 0
                        ? <View>
                            <Text className="font-bold text-lg">
                                No products added yet
                            </Text>
                            <Text className="text-gray-500 text-sm">
                                Add products to get started.
                            </Text>
                        </View>
                        : 
                            <ScrollView className="flex-1">
                            {upcomingProducts.map((x, i) => (
                                <ProductCard key={i} products={products} product={x} onRemove={removeProduct} onModify={(p) => {
                                    setSelectedProduct(p);
                                    bottomSheetRef.current?.openSheet();
                                }}/>
                            ))}
                            </ScrollView>
                       
                }

            </View>

            <View className="flex-row gap-2 justify-center">
                <TouchableOpacity className="flex-1 border-gray-600 border border-solid w-full py-4 rounded-lg items-center" onPress={cancel}>
                    <Text className="text-green-700 font-bold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-1 bg-green-600 text-green-600 w-full py-4 rounded-lg items-center" onPress={create}>
                    <Text className="text-white font-bold">Create List</Text>
                </TouchableOpacity>
            </View>
        </View>

        <BottomSheet
            ref={bottomSheetRef}
            activeHeight={(screenHeight * 0.25)}
            backdropColor="rgba(0,0,0,0.5)"
            closeHeight={150}
            backgroundColor="white"
        >
            {selectedProduct ?
                <ProductView selectedProduct={selectedProduct} setQuantity={setQuantity}/>
                : null
            }
        </BottomSheet>
        </>
    );
}

export default CreateGroceryList;
