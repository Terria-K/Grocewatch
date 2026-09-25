import Lucide from "@react-native-vector-icons/lucide";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { useGroceryList } from "../../context/grocerylist";
import { useState } from "react";
import Decimal from "decimal.js";
import { BottomSheetHandle } from "../../components/BottomSheet";

type CreateGroceryListProp = {
    bs: React.RefObject<BottomSheetHandle | null>
}

function CreateGroceryList({ bs }: CreateGroceryListProp) {
    const [name, setName] = useState('');
    const [budgetLimit, setBudgetLimit] = useState('0');
    const [calorieLimit, setCalorieLimit] = useState('0');
    const groceryList = useGroceryList();

    const cancel = () => {
        setName('')
        setBudgetLimit('')
        setCalorieLimit('')

        bs.current?.closeSheet();
    }

    const create = () => {
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

        groceryList.add({
            grocerylistID: "blah",
            name: name,
            budgetLimit: new Decimal(+budgetLimit),
            calorieLimit: +calorieLimit,
            createdAt: new Date(),
            modifiedAt: new Date(),
            products: [],
            defaultInviteRole: 'Viewer'
        })


        setName('')
        setBudgetLimit('0')
        setCalorieLimit('0')

        bs.current?.closeSheet();
    }

    const numericTextChangeBudgetLimit = (text: string) => {
        const cleanNumber = text.replace(/[^0-9]/g, '')
        setBudgetLimit(cleanNumber)
    }

    const numericTextChangeCalorieLimit = (text: string) => {
        const cleanNumber = text.replace(/[^0-9]/g, '')
        setCalorieLimit(cleanNumber)
    }

    return (
        <View className="px-4 pt-10 gap-8 flex-1">
            <Text className="font-bold text-2xl">Create Grocery List</Text>

            <View className="border-gray-500 border border-solid rounded-lg p-4 gap-4">
                <Text className="text-green-600 font-bold">List Details</Text>

                <View className="flex-row gap-4">
                    <View className="justify-center">
                        <View className="bg-green-400 p-3 justify-center rounded-lg">
                            <Lucide name="list-checks" size={30} color="#16a34a"/>
                        </View>
                    </View>

                    <View className="flex-1 w-full gap-2">
                        <Text>Grocery List Name *</Text>
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

            <View className="border-gray-500 border border-solid rounded-lg p-4">
                <Text className="text-green-600 font-bold">
                    Add Initial Product
                    <Text className="text-gray-300">  (Optional)</Text>
                </Text>
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
    );
}

export default CreateGroceryList;
