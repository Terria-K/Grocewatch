import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../../components/NavigationBar";
import { useState } from "react";
import ComboBox from "../../components/ComboBox";
import { collection, doc, getFirestore, setDoc, updateDoc } from "@react-native-firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { loadProduct } from "../../context/products";

type AdminProductsCreateOrViewProps = NativeStackScreenProps<RootStackParamList, 'AdminAddOrViewProduct'>;

const categories = [
    { id: "0", data: "vegetables", label: "Vegetables" },
    { id: "1", data: "meat", label: "Meat" },
    { id: "2", data: "fruits", label: "Fruits" },
    { id: "3", data: "rice", label: "Rice" },
]

function AdminProductsCreateOrView({ route }: AdminProductsCreateOrViewProps) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const product = route.params.product;

    const [name, setName] = useState(product ? product.name : '');
    const [price, setPrice] = useState(product ? product.price.toString() : '');
    const [calories, setCalories] = useState(product ? product.calories.toString() : '');
    const [unit, setUnit] = useState(product ? product.unit as string :  'kg');
    const [id, setID] = useState(product ? product.productID : '');
    const [category, setCategory] = useState(product ? product.category : '')

    async function save() {
        const db = getFirestore();
        const productDoc = doc(collection(db, "products"), id);

        if (product) {
            await updateDoc(productDoc, {
                price: +price,
                name: name,
                calories: +calories,
                category: category,
                productID: id,
                unit: unit
            })

        } else {
            await setDoc(productDoc, {
                name: name,
                price: +price,
                currentPrices: {
                    prevailing_price: price,
                    highest_price: price,
                    lowest_price: price,
                },
                calories: +calories,
                category: category,
                productID: id,
                unit: unit
            });
        }

        try {
            await loadProduct()
        }
        catch {
            ToastAndroid.show("Products are not loaded at first load, make sure you have internet connection.", ToastAndroid.LONG);
        }

        navigation.goBack();
    }


    return <View className="px-4 pt-10 gap-6 flex-1">
        <View className="items-center">
            <Text className="text-2xl font-bold">{!product ? "Add Product" : "View Product"}</Text>
        </View>

        <View className="flex-1 gap-4">
            <View className="w-full gap-2">
                <Text className="font-bold">ID</Text>
                <TextInput 
                    value={id}
                    onChangeText={setID}
                    className="border-gray-600 border border-solid rounded-lg"/>
            </View>

            <View className="w-full gap-2">
                <Text className="font-bold">Commodity Name</Text>
                <TextInput 
                    value={name}
                    onChangeText={setName}
                    className="border-gray-600 border border-solid rounded-lg"/>
            </View>

            <View className="w-full">
                <Text className="font-bold">Category</Text>
                <ComboBox items={categories} selectFirstIndex={categories.findIndex(x => x.data === category)} onSelect={(x) => { setCategory(x.data) }}/>
            </View>

            <View className="w-full gap-2">
                <Text className="font-bold">Price</Text>
                <TextInput 
                    value={price}
                    onChangeText={setPrice}
                    maxLength={10}
                    keyboardType="number-pad"
                    className="border-gray-600 border border-solid rounded-lg"/>
            </View>

            <View className="w-full gap-2">
                <Text className="font-bold">Calories</Text>
                <TextInput 
                    value={calories}
                    onChangeText={setCalories}
                    maxLength={10}
                    keyboardType="number-pad"
                    className="border-gray-600 border border-solid rounded-lg"/>
            </View>

            <View className="w-full gap-2">
                <Text className="font-bold">Unit (kg/pc)</Text>
                <TextInput 
                    value={unit}
                    onChangeText={setUnit}
                    className="border-gray-600 border border-solid rounded-lg"/>
            </View>

            <TouchableOpacity className="p-4 flex-row justify-center items-center bg-green-300 rounded-xl mx-4" onPress={save}>
                <Text className="font-bold text-green-700">{product ? "Save" : "Create Product"}</Text>
            </TouchableOpacity>
        </View>



    </View>
}

export default AdminProductsCreateOrView;
