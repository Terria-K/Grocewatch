import Lucide from "@react-native-vector-icons/lucide";
import { useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { UserRole } from "../../context/grocerylist";
import { getAuth } from "@react-native-firebase/auth";

type GroceryListSettingsProps = {
    onSave: (budget: string, calorie: string) => void,
    onShare: () => void,
    onAnalyze: () => void,
    budget: number,
    calorie: number,
    role: UserRole
}

function GroceryListSettings({ role, budget, calorie, onSave, onShare, onAnalyze }: GroceryListSettingsProps) {
    const [budgetState, setBudgetState] = useState(budget === 0 ? '' : budget.toString());
    const [calorieState, setCalorieState] = useState(calorie === 0 ? '' : calorie.toString());

    const isNotLogin = useMemo(() => {
        const auth = getAuth();

        return !auth.currentUser;
    }, []);

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

                <View 
                    style={{ backgroundColor: role === "Viewer" ? "#e2e8f0" : "white" }}
                    className="rounded-xl border-slate-200 border-2">
                    <TextInput 
                        readOnly={role === 'Viewer'} 
                        className="px-4" 
                        placeholder="0" 
                        keyboardType="numeric" 
                        onChangeText={setBudgetState} 
                        value={budgetState}/>
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

                <View 
                    style={{ backgroundColor: role === "Viewer" ? "#e2e8f0" : "white" }}
                    className="rounded-xl border-slate-200 border-2">
                    <TextInput 
                        readOnly={role === 'Viewer'} className="px-4" placeholder="0" keyboardType="numeric" onChangeText={setCalorieState} value={calorieState}/>
                </View>
            </View>
        </View>

        <View className="flex-row gap-1">
            <TouchableOpacity className="flex-1 border rounded-lg px-2 py-4 text-gray-200" 
                style={{ backgroundColor: isNotLogin ? '#e5e7eb' : 'white'}} onPress={onShare} disabled={isNotLogin}>
                <View className="flex-row items-center gap-1">
                    <View className="bg-green-300 p-2 rounded-xl">
                        <Lucide name="share-2" size={12}/>
                    </View>
                    <Text className="text-sm" style={{color: isNotLogin ? 'gray' : 'black'}}>Share Grocery List</Text>
                    <Lucide name="chevron-right" size={14} color={isNotLogin ? 'gray' : 'black'}/>
                </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 border rounded-lg px-2 py-4 bg-white" onPress={onAnalyze}>
                <View className="flex-row items-center gap-1">
                    <View className="bg-green-300 p-2 rounded-xl">
                        <Lucide name="share-2" size={12}/>
                    </View>
                    <Text className="text-xs">Analyze Grocery List</Text>
                    <Lucide name="chevron-right" size={14}/>
                </View>
            </TouchableOpacity>
        </View>


        {
            role !== 'Viewer'
            ? <TouchableOpacity className="bg-green-600 rounded-xl p-4" onPress={() => {
                onSave(budgetState, calorieState);
            }}>
                <Text className="text-white font-bold text-lg text-center">Save Changes</Text>
            </TouchableOpacity>
            : null
        }

    </View>)
}

export default GroceryListSettings;
