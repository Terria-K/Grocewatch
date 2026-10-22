import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Dimensions, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import type { RootStackParamList } from "../../components/NavigationBar";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import SearchBar from "../../components/SearchBar";
import { useGroceryList, type OnCartProduct } from "../../context/grocerylist";
import { type Product, useProducts } from "../../context/products";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetHandle } from "../../components/BottomSheet";
import { useCallback, useMemo, useRef, useState } from "react";
import Checkbox from "../../components/Checkbox";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import Confirmation, { ConfirmationHandle } from "../../components/Confirmation";
import Decimal from "decimal.js";
import Lucide from "@react-native-vector-icons/lucide";

const { height: screenHeight} = Dimensions.get('screen');


type ProductCardProps = {
    products: Product[],
    product: OnCartProduct,
    onPress: (onCartProduct: OnCartProduct) => void,
    onCheck: (onCartProduct: OnCartProduct) => void,
    onRemove: (onCartProduct: OnCartProduct) => void,
}

function ProductCard({ products, product, onPress, onCheck, onRemove }: ProductCardProps) {
    const prod = products.filter(x => x.productID === product.productID).at(0)

    const onProductCheck = (_: boolean) => {
        onCheck(product)
    }

    const removeProduct = () => {
        onRemove(product);
    }

    return (
        <Animated.View layout={LinearTransition.springify().damping(100).stiffness(0)}>
            <TouchableNativeFeedback onPress={() => onPress(product)}>
                <View className="flex-row w-full bg-gray-100 border-b border-t border-gray-400 p-4 gap-2">
                    <Checkbox active={product.checked} onToggle={onProductCheck}/>
                    <View className="w-[40%] justify-center" style={{ opacity: product.checked ? 0.5 : 1 }}>
                        <Text className="font-bold">{prod?.name}</Text>
                        <Text className="text-sm">{prod?.category}</Text>
                    </View>

                    <View className="flex-1 justify-center items-center w-[60%]" style={{ opacity: product.checked ? 0.5 : 1 }}>
                        <Text>{product.quantity} {prod?.unit}</Text>
                        <Text className="text-green-700 font-bold">₱{prod ? (prod.price.mul(product.quantity)).toFixed(2) : 0}</Text>
                    </View>

                    <View className="flex-row items-center gap-4">
                        <TouchableOpacity>
                            <MaterialDesignIcons name="pencil-outline" size={20} color="#16a34a"/>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <MaterialDesignIcons name="trash-can-outline" size={20} color="#dc2626" onPress={removeProduct}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </Animated.View>
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

type GroceryListCardProps = {
    name: string,
    products: OnCartProduct[],
    budget: Decimal,
    calorie: number,
    onPress: () => void
}

function GroceryListCard({ name, products, budget, calorie, onPress }: GroceryListCardProps) {
    const baseProducts = useProducts(x => x.products);

    const pr = products.filter(x => x.checked).map(x => {
        const product = baseProducts.filter(p => p.productID === x.productID).at(0);
        if (!product) {
            return new Decimal(0);
        }

        return product.price.mul(x.quantity);
    });

    let spent: Decimal;
    if (pr.length != 0) {
        spent = pr.reduce((x, y) => x.add(y));
    } else {
        spent = new Decimal(0);
    }

    const percentage = (1-((budget.sub(spent)).div(budget).toNumber())) * 100;

    return <TouchableNativeFeedback onPress={onPress}>
            <View className="bg-gray-100 rounded-xl border-2 border-gray-400 p-4 px-6 shadow-sm shadow-black elevation-xl flex-row justify-between">
                <View className="flex-1 gap-4">
                    <View>
                        <Text className="font-bold text-xl">{name}</Text>
                        <Text className="color-gray-400">{products.length} items</Text>
                    </View>

                    <View className="gap-1" style={{opacity: budget.equals(new Decimal(0)) ? 0 : 1}}>

                        <View className="flex-row max-w-96 gap-1">
                            <View className="flex-row gap-1">
                                <Text className="color-gray-400 text-xs">Budget:</Text> 
                                <Text className="font-semibold color-green-600 text-xs">₱{budget.toFixed(2)}</Text>
                            </View>

                            <View className="flex-row gap-1">
                                <Text className="color-gray-400 text-xs">Spent:</Text> 
                                <Text className="color-red-600 font-semibold text-xs">₱{spent.toFixed(2)}</Text>
                            </View>

                            { calorie > 0 
                                ? <View className="flex-row gap-1">
                                    <Text className="color-gray-400 text-xs">Calorie:</Text> 
                                    <Text className="font-semibold text-xs">{calorie} kcal</Text>
                                </View>
                                : null}

                        </View>
                        <View className="h-2 bg-gray-300 w-full rounded" >
                            <View className="h-2 rounded" style={{
                                backgroundColor: budget.greaterThan(spent) ? "#16a34a" : "#dc2626",
                                width: `${Math.min(percentage, 100)}%`,
                            }}/>
                        </View>
                    </View>
                </View>

                <View className="left-4 flex-col justify-between items-end">
                        <TouchableOpacity className="h-[30px] w-[30px] items-end">
                            <Lucide name="menu" size={16}/>
                        </TouchableOpacity>

                    <Text className="top-4 text-sm font-bold" style={{
                        opacity: budget.equals(new Decimal(0)) ? 0 : 1
                    }}>{!Number.isNaN(percentage) ? percentage.toFixed(0) : 0}%</Text>
                </View>
            </View>
        </TouchableNativeFeedback>
}

type GroceryListSettingsProps = {
    onSave: (budget: string, calorie: string) => void,
    budget: number,
    calorie: number
}

function GroceryListSettings({ budget, calorie, onSave }: GroceryListSettingsProps) {
    const [budgetState, setBudgetState] = useState(budget === 0 ? '' : budget.toString());
    const [calorieState, setCalorieState] = useState(calorie === 0 ? '' : calorie.toString());

    return (
    <View className="p-4 gap-3">
        <View className="flex-row items-center gap-2">
            <Lucide name="settings-2" size={30}/>
            <Text className="font-bold text-lg">List Settings</Text>
        </View>

        <View className="flex-row rounded-xl bg-slate-100 border-2 border-slate-200 p-4 gap-4">
            <View>
                <View className="bg-green-300 rounded-full p-4">
                    <Lucide name="wallet" size={20} color="#16a34a"/>
                </View>
            </View>
            
            <View className="flex-1 w-full">
                <Text className="font-bold text-lg">Budget Limit</Text>
                <Text className="text-gray-500 text-sm">Set a spending limit for this list</Text>

                <View className="bg-white rounded-xl border-slate-200 border-2">
                    <TextInput className="px-4" placeholder="0" keyboardType="numeric" onChangeText={setBudgetState} value={budgetState}/>
                </View>
            </View>
        </View>

        <View className="flex-row rounded-xl bg-slate-100 border-2 border-slate-200 p-4 gap-4">
            <View>
                <View className="bg-green-300 rounded-full p-4">
                    <Lucide name="wallet" size={20} color="#16a34a"/>
                </View>
            </View>
            
            <View className="flex-1 w-full">
                <Text className="font-bold text-lg">Calorie Limit</Text>
                <Text className="text-gray-500 text-sm">Set a calorie goal for this list</Text>

                <View className="bg-white rounded-xl border-slate-200 border-2">
                    <TextInput className="px-4" placeholder="0" keyboardType="numeric" onChangeText={setCalorieState} value={calorieState}/>
                </View>
            </View>
        </View>

        <TouchableOpacity className="bg-green-600 rounded-xl p-4" onPress={() => {
            onSave(budgetState, calorieState);
        }}>
            <Text className="text-white font-bold text-lg text-center">Save Changes</Text>
        </TouchableOpacity>
    </View>)
}

type ManageGroceryListProps = NativeStackScreenProps<RootStackParamList, 'ManageGroceryList'>;

function ManageGroceryList({ route }: ManageGroceryListProps) {
    const p = route.params;
    const groceryListID = p?.groceryListID;

    const groceryList = useGroceryList(x => x.groceryList.filter(x => x.grocerylistID === groceryListID).at(0));
    const groceryListState = useGroceryList();

    const handleRef = useRef<ConfirmationHandle>(null);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedProduct, setSelectedProduct] = useState<OnCartProduct>();

    const products = useProducts(x => x.products);
    const insets = useSafeAreaInsets();

    const bottomPadding = 30 + (insets.bottom > 0 ? insets.bottom : 16) + 16;

    const addButton = () => {
        if (groceryList) {
            navigation.navigate("AddProduct", { groceryListID: groceryList.grocerylistID })
        }
    }

    const onChecked = useCallback(async (product: OnCartProduct) => {
        groceryListState.toggleCheckProduct(groceryList!.grocerylistID, product.productID);

        await groceryListState.saveGroceryList();
    }, []);

    const onView = useCallback((product: OnCartProduct) => {
        bottomSheetRef.current?.openSheet();

        setSelectedProduct(product);
        setQuantity(product.quantity.toString());
    }, []);

    const onRemove = (product: OnCartProduct) => {
        setSelectedProduct(product);

        handleRef.current?.openDialog();
    }

    const onProductRemove = async () => {
        if (!handleRef.current) {
            return;
        }

        if (!handleRef.current.shouldHandleInput()) {
            return
        }

        if (!selectedProduct) {
            return;
        }

        groceryListState.removeProduct(groceryList!.grocerylistID, selectedProduct.productID);
        await groceryListState.saveGroceryList();
        handleRef.current.closeDialog();
    }

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
    const manageHandleRef = useRef<BottomSheetHandle>(null);

    const sortedCheckedProducts = useMemo(() => {
        if (!groceryList?.products) { return [] }

        return [...groceryList.products].sort((a, b) => {
            if (a.checked) {
                return 1;
            }

            if (b.checked) {
                return -1;
            }

            if (a.checked && b.checked) {
                return a.onCartID.localeCompare(b.onCartID);
            }

            return a.onCartID.localeCompare(b.onCartID);
        })
    }, [groceryList?.products])

    return (
    <>
    <View className="px-4 pt-10 gap-8 flex-1" style={{paddingBottom: bottomPadding}}>
        <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialDesignIcons name="keyboard-backspace" size={30}/>
            </TouchableOpacity>
            <Text className="font-bold text-2xl">Manage Grocery List</Text>
        </View>


        <GroceryListCard name={groceryList?.name ?? ""} budget={new Decimal(groceryList?.budgetLimit ?? 0)} calorie={groceryList?.calorieLimit ?? 0} products={sortedCheckedProducts} onPress={() => {
            manageHandleRef.current?.openSheet();
        }}/>
        <View className="flex-row gap-2">

            <View className="flex-1 bg-gray-100 border-2 rounded-xl border-gray-400 px-2 py-4 flex-row justify-between items-center">
                <Text className="text-sm text-green-700 font-bold">Share Grocery List</Text>
                <MaterialDesignIcons name="chevron-right" size={20}/>
            </View>

            <View className="flex-1 bg-gray-100 border-2 rounded-xl border-gray-400 px-2 py-4 flex-row justify-between items-center">
                <Text className="text-sm text-green-700 font-bold">Analyze Grocery List</Text>
                <MaterialDesignIcons name="chevron-right" size={20}/>
            </View>
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

            <Animated.ScrollView entering={FadeIn} exiting={FadeOut} className="rounded-xl border flex-1 gap-8" showsVerticalScrollIndicator={false}>
            <View>
                {sortedCheckedProducts.map(
                    (item) => <ProductCard onRemove={onRemove} onPress={onView} products={products} product={item} key={item.productID.toString()} onCheck={onChecked}/>)}
            </View>

            </Animated.ScrollView>
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

         <BottomSheet
            ref={manageHandleRef}
            activeHeight={screenHeight * 0.55}
            backdropColor="rgba(0,0,0,0.5)"
            closeHeight={150}
            backgroundColor="white"
        >
            <GroceryListSettings budget={groceryList?.budgetLimit ?? 0} calorie={groceryList?.calorieLimit ?? 0} onSave={ async(budget, calorie) => {
                groceryListState.setState(groceryList!.grocerylistID, +budget, +calorie);
                await groceryListState.saveGroceryList();
                manageHandleRef.current?.closeSheet();
            }}/>
        </BottomSheet>       

        <Confirmation ref={handleRef}>
            <Text className="font-bold text-lg">Remove Product</Text>
            <View className="w-full">
                <Text className="text-sm">Are you sure you want to remove this product from this grocery list?</Text>
            </View>

            <View className="w-full gap-4">
                <TouchableOpacity className="rounded-xl border-green-600 border-2 p-4 w-full items-center" onPress={onProductRemove}>
                    <Text className="font-bold">Remove Product</Text> 
                </TouchableOpacity>

                <TouchableOpacity className="rounded-xl border-green-600 bg-green-600 border-2 p-4 w-full items-center" onPress={
                    () => handleRef.current?.closeDialog()}>
                    <Text className="text-white font-bold">Close</Text> 
                </TouchableOpacity>
            </View>
        </Confirmation>
    </>)
}

export default ManageGroceryList;
