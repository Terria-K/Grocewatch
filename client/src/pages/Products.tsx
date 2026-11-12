import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SearchBar from "../components/SearchBar";
import NavigationBar, { RootStackParamList } from "../components/NavigationBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { images, ProductImage, useProducts } from "../context/products";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { makeNameFirstCharacterUppercase } from "../utils/utils";

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

export function ProductList() {
    const products = useProducts(x => x.products);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    
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

    const [selectedCategory, setSelectedCategory] = useState("All");

    const bottomPadding = 80 + (insets.bottom > 0 ? insets.bottom : 20) + 20;

    const productPressed = (id: string) => {
        navigation.navigate("ProductHistory", { productID: id });
    }

    const onSearch = (text: string) => {
        console.log(text);
    }

    return (
        <>
        <View className="px-4 pt-10 gap-6 flex-1" style={{
            backgroundImage: 'linear-gradient(0deg, #FFFFFF, #F5FAF2, #D7EBD5, #A8CFA8)'
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

            <View className="flex-1 gap-4" style={{paddingBottom: bottomPadding }}>
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
                        onPress={() => productPressed(x.productID)}
                        key={i} id={x.productID} name={x.name} category={x.category} price={x.price} unit={x.unit} calories={x.calories}/>
                })}
                </ScrollView>
            </View>

        </View>
        </>
    )
}

function ProductPage() {
    return (
        <>
        <ProductList />

        <NavigationBar currentRoute="Products"/>
        </>
    )
}

export default ProductPage;

const productStyles = StyleSheet.create({
    product: {
        width: 80,
        height: 80
    }
})
