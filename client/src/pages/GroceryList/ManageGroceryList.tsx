import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Dimensions, Image, Keyboard, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import type { RootStackParamList } from "../../components/NavigationBar";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import SearchBar from "../../components/SearchBar";
import { useGroceryList, UserRole, type OnCartProduct } from "../../context/grocerylist";
import { type Product, useProducts, images, ProductImage } from "../../context/products";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetHandle } from "../../components/BottomSheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Checkbox from "../../components/Checkbox";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import Confirmation, { ConfirmationHandle } from "../../components/Confirmation";
import Lucide from "@react-native-vector-icons/lucide";
import CircularProgress from "../../components/CircularProgress";
import GroceryListSettings from "./GroceryListSettings";
import ShareGroceryList from "./ShareGroceryList";
import { getAuth } from "@react-native-firebase/auth";
import { useUser } from "../../context/user";
import { ProductAddParam } from "../AddProduct";
import { makeNameFirstCharacterUppercase } from "../../utils/utils";

const { height: screenHeight} = Dimensions.get('screen');


type ProductCardProps = {
    products: Product[],
    product: OnCartProduct,
    onPress: (onCartProduct: OnCartProduct) => void,
    onCheck: (onCartProduct: OnCartProduct) => void,
    onRemove: (onCartProduct: OnCartProduct) => void,
    role: UserRole
}

function ProductCard({ products, product, onPress, onCheck, onRemove, role }: ProductCardProps) {
    const prod = products.filter(x => x.productID === product.productID).at(0)

    if (!prod) {
        return <View></View>;
    }

    const onProductCheck = (_: boolean) => {
        onCheck(product)
    }

    const removeProduct = () => {
        onRemove(product);
    }

    return (
        <Animated.View layout={LinearTransition.springify().damping(100).stiffness(0)}>
            <TouchableNativeFeedback onPress={() => onPress(product)}>
                <View className="flex-row w-full bg-gray-100 border-b border-t border-gray-400 p-4 gap-2 items-center">
                    <Checkbox active={product.checked} onToggle={onProductCheck} size={30}/> 
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

                        {
                            role !== 'Viewer'
                            ?  <View className="flex-row items-center gap-4">
                                    <TouchableOpacity>
                                        <MaterialDesignIcons name="trash-can-outline" size={20} color="#dc2626" onPress={removeProduct}/>
                                    </TouchableOpacity>
                                </View>
                            : null
                        }

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
    budget: number,
    calorie: number,
    onPress: () => void
}

function GroceryListCard({ name, products, budget, calorie, onPress }: GroceryListCardProps) {
    const baseProducts = useProducts(x => x.products);

    const budgetAndCalorie = products.filter(x => x.checked).map(x => {
        const product = baseProducts.filter(p => p.productID === x.productID).at(0);
        if (!product) {
            return {
                spent: 0,
                calorie: 0
            };
        }

        return { 
            spent: product.price * x.quantity,
            calorie: product.calories * x.quantity
        };
    });

    let productData: {
        spent: number,
        calorie: number
    };
    if (budgetAndCalorie.length != 0) {
        productData = budgetAndCalorie.reduce((x, y) => ({
            spent: x.spent + y.spent,
            calorie: x.calorie + y.calorie
        }));
    } else {
        productData = {
            spent: 0,
            calorie: 0
        };
    }

    const spentPercentage = (1-((budget - productData.spent) / budget)) * 100;
    const caloriePercentage = (1-((calorie - productData.calorie) / calorie)) * 100;

    return <TouchableOpacity
            onPress={onPress}
            style={{
                borderColor: productData.spent > budget ? "#dc2626" : "#16a34a"
            }}
            className="bg-white rounded-3xl border-2 p-4 px-6 shadow-sm shadow-black elevation-xl flex-row justify-between">
            <View className="absolute right-10 bottom-7">
                {calorie == 0 
                    ? null
                    : <CircularProgress 
                        percentage={Math.min(caloriePercentage, 100)} 
                        duration={1000} color={caloriePercentage > 100 ? "#dc2626" : "#16a34a"}>
                        <View>
                            <Text className="text-sm text-center text-green-800 font-bold">{productData.calorie.toLocaleString('en-US')}</Text>
                            <Text className="text-xs text-center text-green-700">/ {calorie.toLocaleString('en-US')} kcal</Text>
                        </View>
                    </CircularProgress>
                }

            </View>

            <View className="flex-1 gap-4">
                <View>
                    <Text className="font-bold text-xl">{name}</Text>
                    <Text className="color-gray-400">{products.length} items</Text>

                </View>

                <View className="flex-row">
                    <View className="gap-1" style={{opacity: budget === 0 ? 0 : 1}}>
                        <View className="flex-row max-w-96 gap-1">
                            <View className="flex-row gap-1">
                                <Text className="color-gray-400 text-xs">Budget:</Text> 
                                <Text className="font-semibold color-green-600 text-xs">₱{budget.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}</Text>
                            </View>

                            <View className="flex-row gap-1">
                                <Text className="color-gray-400 text-xs">Spent:</Text> 
                                <Text className="color-red-600 font-semibold text-xs">₱{productData.spent.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="h-2 bg-gray-300 w-full rounded">
                    <Animated.View className="h-2 rounded" style={{
                        backgroundColor: productData.spent > budget ? "#dc2626" : "#16a34a",
                        width: `${Math.min(spentPercentage, 100)}%`,
                    }} layout={LinearTransition.springify().damping(100).stiffness(0)}/>
                </View>

            </View>


            <View className="left-4 flex-col justify-between items-end">
                    <TouchableOpacity className="h-[30px] w-[30px] items-end" onPress={onPress}>
                        <Lucide name="menu" size={16}/>
                    </TouchableOpacity>

                <Text className="top-3 text-sm font-bold" style={{
                    opacity: budget === 0 ? 0 : 1
                }}>{!Number.isNaN(spentPercentage) ? Math.min(spentPercentage, 100).toFixed(0) : 0}%</Text>
            </View>
        </TouchableOpacity>
}

type ManageGroceryListProps = NativeStackScreenProps<RootStackParamList, 'ManageGroceryList'>;

function ManageGroceryList({ route }: ManageGroceryListProps) {
    const p = route.params;
    const groceryListID = p?.groceryListID;

    const groceryList = useGroceryList(x => x.groceryList.filter(x => x.grocerylistID === groceryListID).at(0));
    const groceryListState = useGroceryList();

    const handleRef = useRef<ConfirmationHandle>(null);
    const shareHandleRef = useRef<ConfirmationHandle>(null);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedProduct, setSelectedProduct] = useState<OnCartProduct>();
    const [searchText, setSearchText] = useState('');
    const [keyboardUp, setKeyboardUp] = useState(0);
    const [role, setRole] = useState<UserRole>('Admin');

    const products = useProducts(x => x.products);
    const insets = useSafeAreaInsets();

    const bottomPadding = 30 + (insets.bottom > 0 ? insets.bottom : 16) + 16;

    const addButton = () => {
        if (groceryList) {
            navigation.navigate("AddProduct", { addCallback: onProductAdd })
        }
    }

    const onChecked = useCallback(async (product: OnCartProduct) => {
        groceryListState.toggleCheckProduct(groceryList!.grocerylistID, product.productID);

        await groceryListState.saveGroceryList(groceryList!.grocerylistID);
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

    const user = useUser();

    async function onProductAdd(products: ProductAddParam[]) {
        for (let product of products) {
            if (groceryListID) {
                groceryListState.addProduct(groceryListID, product.productID, product.quantity);
                user.increasedProductTracked();
            }
        }

        if (groceryListID) {
            await groceryListState.saveGroceryList(groceryListID);
        }

        await user.save();
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
        await groceryListState.saveGroceryList(groceryList!.grocerylistID);
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

        await groceryListState.saveGroceryList(groceryList!.grocerylistID);
    }

    useEffect(() => {
        const keyboardDidShow = Keyboard.addListener(
            'keyboardDidShow',
            () => trigger(false)
        )

        const keyboardDidHide = Keyboard.addListener(
            'keyboardDidHide',
            () => trigger(true)
        )

        return () => {
            keyboardDidShow.remove();
            keyboardDidHide.remove();
        }
    }, []);

    useEffect(() => {
        manageHandleRef.current?.refreshSheet();
        bottomSheetRef.current?.refreshSheet();

    }, [keyboardUp])

    useEffect(() => {
        if (!groceryList?.users) {
            return;
        }

        const user = getAuth().currentUser;

        if (!user) {
            return;
        }

        const role = groceryList.users.map(x => {
            if (x.userID === user.uid)  {
                return x.role;
            }

            return undefined;
        }).at(0);

        if (!role) {
            return;
        }

        setRole(role);
    }, []);

    const trigger = useCallback((reverse: boolean) => {
        if (reverse) {
            setKeyboardUp(0);
        }
        else {
            setKeyboardUp(300);
        }

    }, [keyboardUp])

    const bottomSheetRef = useRef<BottomSheetHandle>(null);
    const manageHandleRef = useRef<BottomSheetHandle>(null);

    const sortedCheckedProducts = useMemo(() => {
        if (!groceryList?.products) { return [] }

        if (searchText === '') {
            return [...groceryList.products]
                .sort((a, b) => {
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
            });
        }

        return [...groceryList.products].map(x => {
            const product = products.filter(product => product.productID === x.productID).at(0);
            if (!product) {
                return { score: 0, x: x};
            }

            const trimmedSearch = searchText.trim().toLowerCase();

            const loweredName = product.name.toLowerCase();

            let score = 1.0 - (levenshteinDistance(loweredName, trimmedSearch) / Math.max(loweredName.length, searchText.length));
            if (loweredName.includes(trimmedSearch)) {
                score = Math.max(score, 0.8);
            }

            return {
                score,
                x
            }
        }).filter(x => {
            const trimmedSearch = searchText.trim().toLowerCase();
            return !trimmedSearch || x.score > 0.5;
        }).sort((a, b) => {
            return b.score - a.score;
        }).map(x => x.x);


    }, [searchText, groceryList?.products])

    function openShare() {
        manageHandleRef.current?.closeSheet();
        shareHandleRef.current?.openDialog();
    }

    function analyze() {
        manageHandleRef.current?.closeSheet();
    }

    return (
    <>
    <View className="px-4 pt-10 gap-8 flex-1" style={{paddingBottom: bottomPadding}}>
        <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialDesignIcons name="keyboard-backspace" size={30}/>
            </TouchableOpacity>
            <Text className="font-bold text-2xl">Manage Grocery List</Text>
        </View>

        <GroceryListCard 
            name={groceryList?.name ?? ""} 
            budget={groceryList?.budgetLimit ?? 0} 
            calorie={groceryList?.calorieLimit ?? 0} 
            products={groceryList?.products ?? []} onPress={() => {
            manageHandleRef.current?.openSheet();
        }}/>

        <View className="flex-1">
            <View className="bg-gray-100 border-2 rounded-xl border-gray-400 p-4">
                <Text className="font-bold text-xl">Products</Text>

                <View className="flex-row items-center gap-2 justify-center">
                    <SearchBar placeholder="Search Products..." onInput={setSearchText}/>
                </View>
            </View>

            <View className="flex-1 gap-4">
                <Animated.ScrollView entering={FadeIn} exiting={FadeOut} className="rounded-xl border flex-1 gap-8" showsVerticalScrollIndicator={false}>
                    <View>
                        {sortedCheckedProducts.map(
                            (item) => <ProductCard role={role} onRemove={onRemove} onPress={onView} products={products} product={item} key={item.productID.toString()} onCheck={onChecked}/>)}
                    </View>

                </Animated.ScrollView>

                {
                    role !== 'Viewer'
                    ?
                    <TouchableOpacity className="p-4 flex-row justify-center items-center bg-green-300 rounded-xl mx-4" onPress={addButton}>
                        <MaterialDesignIcons name="plus" size={20} color="#15803d"/>
                        <Text className="font-bold text-green-700">Add Product</Text>
                    </TouchableOpacity>
                    : null
                }

            </View>


        </View>
    </View>

        <BottomSheet
            ref={bottomSheetRef}
            activeHeight={(screenHeight * 0.25) + keyboardUp}
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
            activeHeight={(screenHeight * 0.60) + keyboardUp}
            backdropColor="rgba(0,0,0,0.5)"
            closeHeight={150}
            backgroundColor="white"
        >
            <GroceryListSettings 
                role={role}
                budget={groceryList?.budgetLimit ?? 0} 
                calorie={groceryList?.calorieLimit ?? 0} 
                onShare={openShare} 
                onAnalyze={analyze}
                onSave={ async(budget, calorie) => {
                    groceryListState.setState(groceryList!.grocerylistID, +budget, +calorie);
                    await groceryListState.saveGroceryList(groceryList!.grocerylistID);
                    manageHandleRef.current?.closeSheet();
                    Keyboard.dismiss();
            }}/>
        </BottomSheet>       

        <Confirmation ref={shareHandleRef} padding={10}>
            <ShareGroceryList shareHandleRef={shareHandleRef} groceryList={groceryList} role={role}/>
        </Confirmation>

        <Confirmation ref={handleRef} padding={30}>
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

function levenshteinDistance(target: string, search: string) {
    if (target === search) {
        return 0;
    }

    if (target.length === 0) {
        return search.length;
    }

    if (search.length === 0) {
        return target.length;
    }

    const distance = Array.from({ length: target.length + 1 }, () => 
        new Array(search.length + 1).fill(0)
    );

    for (let i = 0; i <= target.length; i += 1) {
        distance[i][0] = i;
    }

    for (let j = 0; j <= search.length; j += 1) {
        distance[0][j] = j;
    }

    for (let i = 1; i <= target.length; i += 1) {
        for (let j = 1; j <= search.length; j += 1) {
            const cost = (target[i - 1] === search[j - 1]) ? 0 : 1;
            distance[i][j] = Math.min(
                Math.min(distance[i - 1][j] + 1, distance[i][j - 1] + 1),
                distance[i - 1][j - 1] + cost
            );
        }
    }

    return distance[target.length][search.length];
}

export default ManageGroceryList;
