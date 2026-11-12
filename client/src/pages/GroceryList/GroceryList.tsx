import Lucide from "@react-native-vector-icons/lucide";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { ActivityIndicator, BackHandler, Image, ScrollView, Text, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import SearchBar from "../../components/SearchBar";
import { useEffect, useRef, useState } from "react";
import NavigationBar, { RootStackParamList } from "../../components/NavigationBar";
import { fetchGroceryList, GroceryListState, OnCartProduct, useGroceryList } from "../../context/grocerylist";
import Popover from "react-native-popover-view";
import { Placement } from "react-native-popover-view/dist/Types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useProducts } from "../../context/products";
import HorizontalSeparator from "../../components/HorizontalSeparator";
import Confirmation, { ConfirmationHandle } from "../../components/Confirmation";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import Checkbox, { CheckboxHandle } from "../../components/Checkbox";
import { collection, doc, getDoc, getFirestore } from "@react-native-firebase/firestore";
import { getAuth } from "@react-native-firebase/auth";
import { useTranslation } from "react-i18next";

type GroceryProps = {
    id: string,
    name: string,
    count: number,
    budget: number,
    isShared: boolean,
    products: OnCartProduct[],
    onPress: () => void,
    onLongPress: () => void,
    remove: (id: string) => void,
}

function Grocery({ id, name, count, budget, products, isShared, onLongPress, onPress, remove }: GroceryProps) {
    const baseProducts = useProducts(x => x.products);

    const pr = products.filter(x => x.checked).map(x => {
        const product = baseProducts.filter(p => p.productID === x.productID).at(0);
        if (!product) {
            return 0;
        }

        return product.price * x.quantity;
    });

    let spent: number;
    if (pr.length != 0) {
        spent = pr.reduce((x, y) => x + y);
    } else {
        spent = 0;
    }

    const percentage = (1-((budget - spent) / budget)) * 100;
    const popoverRef = useRef<Popover>(null);

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
                borderColor: spent > budget ? "#dc2626" : "#16a34a"
            }}
            className="bg-white rounded-3xl border-2 py-4 px-6 shadow-sm shadow-black elevation-md flex-row justify-between">
            <View className="flex-1 gap-4">
                <View>
                    <View className="flex-row gap-2">
                        <Text className="font-bold text-xl">
                            {name}
                        </Text>
                    </View>
                    <Text className="color-gray-400">{count} items</Text>
                </View>

                <View className="gap-1" style={{opacity: budget == 0 ? 0 : 1}}>

                    <View className="flex-row justify-between max-w-96">
                        <View className="flex-row gap-3">
                            <Text className="color-gray-400">Budget:</Text> 
                            <Text className="font-semibold color-green-600">₱{budget.toFixed(2)}</Text>
                        </View>

                        <View className="flex-row gap-3">
                            <Text className="color-gray-400">Spent:</Text> 
                            <Text className="color-red-600 font-semibold">₱{spent.toFixed(2)}</Text>
                        </View>
                    </View>
                    <View className="h-2 bg-gray-300 w-full rounded" >
                        <View className="h-2 rounded" style={{
                            backgroundColor: spent > budget ? "#dc2626" : "#16a34a",
                            width: `${Math.min(percentage, 100)}%`,
                        }}/>
                    </View>
                </View>
            </View>

            <View className="left-4 flex-col justify-between items-end">
                <Popover
                    placement={Placement.BOTTOM}
                    offset={-50}
                    backgroundStyle={{backgroundColor: 'transparent'}}
                    arrowSize={{ width: 0, height: 0}}
                    ref={popoverRef}
                    from={(
                        <TouchableOpacity className="h-[30px] w-[30px] items-end">
                            <Lucide name="ellipsis-vertical" size={16}/>
                        </TouchableOpacity>
                    )}>
                    <View style={{padding: 8}}>
                        <TouchableNativeFeedback onPress={() => {
                            onPress();
                            popoverRef.current?.requestClose();
                        }}>
                            <View className="p-2">
                                <Text className="font-bold">Manage</Text>
                            </View>
                        </TouchableNativeFeedback>

                        <HorizontalSeparator gap={2}/>

                        {
                            !isShared
                            ?<TouchableNativeFeedback onPress={() => {
                                remove(id);
                                popoverRef.current?.requestClose();
                            }}>
                                <View className="p-2">
                                    <Text className="font-bold">Delete</Text>
                                </View>
                            </TouchableNativeFeedback>
                            :
                            <TouchableNativeFeedback onPress={() => {
                                remove(id);
                                popoverRef.current?.requestClose();
                            }}>
                                <View className="p-2">
                                    <Text className="font-bold">Leave</Text>
                                </View>
                            </TouchableNativeFeedback>
                        }



                    </View>

                </Popover>

                <Text className="top-3 text-sm font-bold" style={{
                    opacity: budget == 0 ? 0 : 1
                }}>{!Number.isNaN(percentage) ? (Math.min(percentage, 100).toFixed(0)) : 0}%</Text>
            </View>
        </TouchableOpacity>
    );
}

type GroceryListViewProps = {
    confirmationHandle: React.RefObject<ConfirmationHandle | null>,
    leaveConfirmationHandle: React.RefObject<ConfirmationHandle | null>,
    state: GroceryListState,
    toggleRemoval: boolean,
    setToggleRemoval: (toggle: boolean) => void,
    toRemove: (id: string[]) => void
}

function GroceryListView({ state, leaveConfirmationHandle, confirmationHandle, toggleRemoval, setToggleRemoval, toRemove }: GroceryListViewProps) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string[]>([]);

    const checkboxRef = useRef<{ [key: string]: CheckboxHandle }>({});

    const removeGroceryList = (id: string) => {
        confirmationHandle.current?.openDialog();
        toRemove([id]);
    }

    const leaveGroceryList = (id: string) => {
        leaveConfirmationHandle.current?.openDialog();
        toRemove([id]);
    }

    useEffect(() => {
        fetchGroceryList().then((data) => {
            state.set(data);
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (!toggleRemoval) {
                return false;
            }

            setToggleRemoval(false);
            return true;
        });

        return () => subscription.remove();
    }, [toggleRemoval])

    function toggleSelect(id: string) {
        setSelected(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id) 
                : [...prev, id]
        );
    }

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large"/>
            </View>
        )
    }

    return (
        <>
        {
            state.groceryList.length === 0 && 
            <View className="justify-center items-center h-[50%]">
                <Text className="font-bold text-2xl text-gray-500 text-center">Tap "+" to create your first grocery list.</Text>
            </View>
        }
        <ScrollView contentContainerClassName="gap-4 pb-40" className="rounded-xl flex-1" showsVerticalScrollIndicator={false}>
            {state.groceryList.map((x, i) => {
                const isSelected = selected.includes(x.grocerylistID)
                return <View className="flex-row flex-1 items-center gap-2" key={i}>
                {
                    toggleRemoval && !x.isShared
                        ? <Checkbox 
                            ref={(el) => {
                                if (el) {
                                    checkboxRef.current[i] = el;
                                } else {
                                    delete checkboxRef.current[i];
                                }
                            }}
                            active={isSelected} onToggle={(_) => toggleSelect(x.grocerylistID)} size={20}/>
                        : null
                }
                <Grocery 
                    id={x.grocerylistID} 
                    name={x.name} 
                    isShared={x.isShared ?? false}
                    count={x.products?.length ?? 0} 
                    budget={x.budgetLimit} 
                    products={x.products}
                    remove={() => x.isShared ? leaveGroceryList(x.grocerylistID) : removeGroceryList(x.grocerylistID)} 
                    onPress={() => {
                            if (toggleRemoval && !x.isShared) {
                                if (isSelected) {
                                    checkboxRef.current[i].deactivate();
                                } else {
                                    checkboxRef.current[i].activate();
                                }

                                toggleSelect(x.grocerylistID);
                                return;
                            }
                            navigation.navigate("ManageGroceryList", { groceryListID: x.grocerylistID })
                        }}
                    onLongPress={() => { 
                        if (toggleRemoval) {
                            return;
                        }
                        setToggleRemoval(true);
                        setSelected([x.grocerylistID]);
                    }}/>
                </View>
            })}

        </ScrollView>
        {
            toggleRemoval ? <View>
                <TouchableOpacity 
                    onPress={() => {
                        confirmationHandle.current?.openDialog();
                        toRemove(selected);
                    }}
                    className="absolute bottom-0 w-full bg-red-400 mb-[90px] px-4 py-2 items-center justify-between rounded-2xl flex-row">
                    <View className="flex-row justify-center items-center gap-2">
                        <MaterialDesignIcons name="check-circle" color="#b91c1c" size={30}/>
                        <Text className="font-semibold">{selected.length} items selected</Text>
                    </View>

                    <View className="bg-red-700 py-3 px-10 rounded-full flex-row items-center gap-2">
                        <View className="bg-white rounded-full">
                            <MaterialDesignIcons name="trash-can" color="#b91c1c" size={20}/>
                        </View>
                        <Text className="text-white font-semibold">Delete</Text>
                    </View>
                </TouchableOpacity>
            </View>
            : null
        }

        </>
    )
}


function GroceryList() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const handleRef = useRef<ConfirmationHandle>(null);
    const leaveHandleRef = useRef<ConfirmationHandle>(null);
    const state = useGroceryList();

    const [groceryListToRemove, setGroceryListToRemove] = useState<string[]>([]);
    const [toggleRemoval, setToggleRemoval] = useState(false);

    const toRemove = (groceryListID: string[]) => {
        setGroceryListToRemove(groceryListID);
    }

    const remove = async () => {
        if (!handleRef.current) {
            return;
        }

        if (!handleRef.current.shouldHandleInput()) {
            return;
        }

        for (let g of groceryListToRemove) {
            state.remove(g)

            await state.saveGroceryList(g);
        }

        handleRef.current.closeDialog();
        setToggleRemoval(false);
    }

    const leave = async () => {
        if (!leaveHandleRef.current) {
            return;
        }

        if (!leaveHandleRef.current.shouldHandleInput()) {
            return;
        }

        const listID = groceryListToRemove[0];

        state.leave(listID);

        leaveHandleRef.current.closeDialog();
        await state.saveGroceryList(listID);
    }

    function onSearch(searchText: string) {

    }

    const [userName, setUserName] = useState('User');

    useEffect(() => {
        const user = getAuth().currentUser;

        if (!user) {
            return;
        }

        const docRef = doc(collection(getFirestore(), "users"), user.uid);
        getDoc(docRef).then(snapshot => {
            const firstName = snapshot.get("firstName");
            setUserName(firstName);
        });
    }, []);

    const { t } = useTranslation();

    return (
        <>
        <View className="px-4 pt-10 gap-8 flex-1" style={{
            backgroundImage: 'linear-gradient(0deg, #FFFFFF, #F5FAF2, #D7EBD5, #A8CFA8)'
        }}>
            <View className="flex flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <View>
                        <Image source={require("../../assets/grocewatch_icon_no_text.png")} className="w-20 h-20"/>
                    </View>
                    <View>
                        <Text className="font-bold text-green-600 text-2xl">Grocewatch</Text>
                        <Text>{t("WELCOME")}, {userName}!</Text>
                    </View>
                </View>
                <TouchableOpacity className="w-10 h-10 rounded justify-center items-center" onPress={() => navigation.navigate("Notifications")}>
                    <FontAwesome5 name="bell" size={25} iconStyle="solid" />
                </TouchableOpacity>
            </View>

            <View> 
                <Text className="font-bold text-2xl">{t("MY_GROCERY_LIST")}</Text>

                <View className="flex-row items-center gap-2 justify-center">
                    <SearchBar placeholder="Search grocery lists..." onInput={onSearch}/>

                    <TouchableOpacity className="rounded-3xl bg-white border-green-600 border-2 px-1 border-solid shadow-sm shadow-black elevation-2xl" 
                        onPress={() => {
                            navigation.navigate("CreateGroceryList")
                    }}>
                        <MaterialDesignIcons name="plus" size={35} color="#16a34a"/>
                    </TouchableOpacity>
                </View>
            </View>

            <GroceryListView 
                setToggleRemoval={setToggleRemoval} toggleRemoval={toggleRemoval}
                state={state} confirmationHandle={handleRef} leaveConfirmationHandle={leaveHandleRef} toRemove={toRemove} />
        </View>
        
        <NavigationBar currentRoute="List"/>


        <Confirmation ref={handleRef} padding={30}>
            <Text className="font-bold text-lg">Delete Grocery List Permanently</Text>
            <View className="w-full">
                <Text className="text-sm">Are you sure you want to permanently delete this grocery list? This is irreversible and cannot be undone.</Text>
            </View>

            <View className="w-full gap-4">
                <TouchableOpacity className="rounded-xl border-green-600 border-2 p-4 w-full items-center" onPress={remove}>
                    <Text className="font-bold">Delete Grocery List</Text> 
                </TouchableOpacity>

                <TouchableOpacity className="rounded-xl border-green-600 bg-green-600 border-2 p-4 w-full items-center" onPress={
                    () => handleRef.current?.closeDialog()}>
                    <Text className="text-white font-bold">Close</Text> 
                </TouchableOpacity>
            </View>
        </Confirmation>

        <Confirmation ref={leaveHandleRef} padding={30}>
            <Text className="font-bold text-lg">Leave this Grocery List</Text>
            <View className="w-full">
                <Text className="text-sm">Are you sure you want to leave this grocery list? The user may still invite you back.</Text>
            </View>

            <View className="w-full gap-4">
                <TouchableOpacity className="rounded-xl border-green-600 border-2 p-4 w-full items-center" onPress={leave}>
                    <Text className="font-bold">Leave</Text> 
                </TouchableOpacity>

                <TouchableOpacity className="rounded-xl border-green-600 bg-green-600 border-2 p-4 w-full items-center" onPress={
                    () => leaveHandleRef.current?.closeDialog()}>
                    <Text className="text-white font-bold">Close</Text> 
                </TouchableOpacity>
            </View>
        </Confirmation>
        </>
    )
}

export default GroceryList;
