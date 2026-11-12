import { BackHandler, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { images, ProductImage, useProducts } from "../context/products";
import React, { useEffect, useRef, useState } from "react";
import BottomSheet, { BottomSheetHandle } from "../components/BottomSheet";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../components/NavigationBar";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import SearchBar from "../components/SearchBar";
import Checkbox, { CheckboxHandle } from "../components/Checkbox";
import { makeNameFirstCharacterUppercase } from "../utils/utils";

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
    id: string,
    name: string,
    price: number,
    calories: number,
    unit: string,
    category: string,
    inMultipleSelect: boolean,
    selected: boolean,
    onPress: () => void,
    onLongPress: () => void,
    index: number,
    checkboxRef: React.RefObject<{ [key: string]: CheckboxHandle }>,
    toggleSelect: (id: string) => void
}

function Product({ id, name, price, category, calories, unit, inMultipleSelect, selected, index, onLongPress, onPress, checkboxRef, toggleSelect }: ProductProps) {
    return (

        <TouchableOpacity 
            className="rounded-lg border-gray-600 border px-4 py-2 flex-row items-center w-full gap-4 bg-white" 
            onPress={onPress}
            onLongPress={onLongPress}>

            {
                inMultipleSelect 
                ? <Checkbox 
                        ref={(el) => {
                            if (el) {
                                checkboxRef.current[index] = el;
                            } else {
                                delete checkboxRef.current[index];
                            }
                        }}
                        active={selected} 
                        onToggle={() => toggleSelect(id)} 
                        size={20}/>
                : null
            }

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

            <View className="justify-center gap-1">
                <View>
                    {
                        !price ? <Text>Not Available</Text>
                        : 
                            <View>
                                <Text className="mt-2 font-bold">₱{price?.toFixed(2)} / {unit}</Text>
                            </View>
                    }
                </View>

                <View className="min-w-14">
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

export type ProductAddParam = {
    productID: string,
    quantity: number
}

type ProductAddViewProps = {
    groceryListID?: string,
    productID: string,
    onBack: () => void; 
    onAdd: (products: ProductAddParam[]) => Promise<void>
}

function ProductAddView({ onBack, productID,  onAdd }: ProductAddViewProps) {
    const [quantity, setQuantity] = useState('1');

    const addProduct = async () => {
        let realQuantity = +quantity;
        if (realQuantity == 0) {
            realQuantity = 1;
        }

        onAdd([
            {productID, quantity: realQuantity}
        ]);

        onBack();
    }

    return (
        <View className="justify-center items-center gap-4">
            <View className="flex-row items-center gap-4">
                <TouchableOpacity onPress={() => setQuantity(x => {
                    const num = +x;
                    if ((num - 1) === 0) {
                        return '-1';
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
                    placeholder="1" />

                <TouchableOpacity onPress={() => setQuantity(x => {
                    const num = +x;
                    if ((num + 1) === 0) {
                        return '1';
                    }

                    return (num + 1).toString();
                })}>
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

type AddProductProps = NativeStackScreenProps<RootStackParamList, 'AddProduct'>;

function AddProduct({ route }: AddProductProps) {
    const products = useProducts(x => x.products);
    const [selected, setSelected] = useState<string[]>([]);
    const checkboxRef = useRef<{ [key: string]: CheckboxHandle }>({});
    const bottomSheetRef = useRef<BottomSheetHandle>(null);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    
    const [multiSelectOn, setMultiSelectOn] = useState(false);
    const [productID, setProductID] = useState('');
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
            "name": "Fruits",
            "selected": false
        },
        {
            "name": "Grains",
            "selected": false
        },
        {
            "name": "Sugar",
            "selected": false
        },
    ]);

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (!multiSelectOn) {
                return false;
            }

            setMultiSelectOn(false);
            return true;
        });

        return () => subscription.remove();
    }, [multiSelectOn])

    const [selectedCategory, setSelectedCategory] = useState("All");

    const productPressed = (id: string, index: number) => {
        if (multiSelectOn) {
            const isSelected = selected.includes(id);
            toggleSelect(id);
            if (isSelected) {
                checkboxRef.current[index].deactivate();
            } else {
                checkboxRef.current[index].activate();
            }
            return;
        }


        setProductID(id);
        bottomSheetRef.current?.openSheet();
    }

    const onSearch = (text: string) => {
    }

    function toggleSelect(id: string) {
        setSelected(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id) 
                : [...prev, id]
        );
    }

    return (
        <>
        <View className="px-4 pt-10 gap-6 flex-1" style={{
            backgroundImage: 'white' 
        }}>
            <View className="items-center">
                <Text className="text-2xl font-bold">Products</Text>
            </View>

            <View className="flex-row items-center gap-2">
                <SearchBar placeholder="Search products" onInput={onSearch}/>
            </View>

            <ScrollView contentContainerStyle={{flexDirection: 'row', gap: 8}} style={{flexGrow: 0}} horizontal={true} showsHorizontalScrollIndicator={false}>
                {category.map((x, i) => (
                    <CategoryButton key={i} name={x.name} selected={x.selected} onPress={() => {
                        setCategory(category => {
                            return category.map(y => {
                                if (y.name === x.name) {
                                    y.selected = true;
                                    setSelectedCategory(y.name);
                                    return y;
                                }

                                y.selected = false;
                                return y;
                            })
                        })
                    }}/>
                ))}
            </ScrollView>

            <View className="flex-1 gap-4" style={{paddingBottom: 30}}>
                <View>
                    <Text className="font-bold text-xl">All Products</Text>
                    <Text className="color-gray-400">{products.length} Products</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4">
                {products.filter(x => {
                    if (selectedCategory === "All") {
                        return true;
                    }

                    return x.category === selectedCategory.toLowerCase();
                }).map((x, i) => {
                    return <Product 
                        toggleSelect={toggleSelect}
                        onPress={() => productPressed(x.productID, i)}
                        onLongPress={() => { 
                                setMultiSelectOn(true) 
                                toggleSelect(x.productID);
                            } 
                        }
                        inMultipleSelect={multiSelectOn}
                        selected={selected.includes(x.productID)}
                        index={i}
                        checkboxRef={checkboxRef}
                        key={i} id={x.productID} name={x.name} category={x.category} price={x.price} unit={x.unit} calories={x.calories}/>
                })}
                </ScrollView>

                {
                    multiSelectOn ? <View>
                        <TouchableOpacity 
                            onPress={() => {
                                route.params.addCallback(selected.map(x => ({ productID: x, quantity: 1} satisfies ProductAddParam)));
                                navigation.goBack();
                            }}
                            className="absolute bottom-0 w-full bg-green-400 px-4 py-2 items-center justify-between rounded-2xl flex-row">
                            <View className="flex-row justify-center items-center gap-2">
                                <MaterialDesignIcons name="check-circle" color="#15803d" size={30}/>
                                <Text className="font-semibold">{selected.length} items selected</Text>
                            </View>

                            <View className="bg-green-700 py-3 px-10 rounded-full flex-row items-center gap-2">
                                <View className="bg-white rounded-full">
                                    <MaterialDesignIcons name="plus" color="#15803d" size={20}/>
                                </View>
                                <Text className="text-white font-semibold">Add</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    : null
                }
            </View>

        </View>

        <BottomSheet ref={bottomSheetRef}
            activeHeight={screenHeight * 0.45}
            backdropColor="rgba(0,0,0,0.5)"
            closeHeight={150}
            backgroundColor="white"
        >
            <ProductAddView onBack={navigation.goBack} productID={productID} onAdd={route.params.addCallback}/>
        </BottomSheet>
        </>
    )
}

export default AddProduct;
