import { Text, TouchableOpacity, View } from "react-native";
import ComboBox from "../../components/ComboBox";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../components/NavigationBar";
import ChipAI from "../../assets/chip-ai.svg";
import { ModelType, useAIChat } from "../../context/ai";
import { useState } from "react";

const GEMINI_FLASH_3_5_LITE: ModelType = "gemini-3.5-flash-lite";
const GEMINI_FLASH_3_8 : ModelType = "gemini-3.8-flash";

function ModelSettings() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const ai = useAIChat();


    const [modelName, setModelName] = useState(ai.modelName);
    const [thinkingLevel, setThinkingLevel] = useState(ai.thinkingLevel);


    const index = modelName === "gemini-3.8-flash" ? 1 : 0;

    function save() {
        ai.settings(modelName, thinkingLevel);
        navigation.goBack();
    }

    return <View className="px-4 pt-10 gap-8 flex-1">
        <View className="flex-row gap-2">
            <TouchableOpacity className="justify-center" onPress={() => navigation.goBack()}>
                <MaterialDesignIcons name="arrow-left" size={26}/>
            </TouchableOpacity>
            <View>
                <Text className="font-bold text-2xl">Model Settings</Text>
                <Text>Choose how GroceAI responds.</Text>
            </View>
        </View>

        <View className="rounded-2xl border border-slate-700 px-4 py-4">
            <View className="flex-row items-center gap-4">
                <View className="bg-green-300 p-2 rounded-full">
                    <ChipAI width={30} height={30}/>
                </View>

                <Text className="font-bold text-xl">AI Model</Text>
            </View>

            <ComboBox items={[
                { id: '0', label: 'Gemini 3.5 Flash Lite', data: GEMINI_FLASH_3_5_LITE },
                { id: '1', label: 'Gemini 3.8 Flash', data: GEMINI_FLASH_3_8 },
            ]} selectFirstIndex={index}
                onSelect={(item) => setModelName(item.data)}/>

        </View>

        <View className="rounded-2xl border border-slate-700 px-4 py-4 gap-4">
            <View className="flex-row items-center gap-4">
                <View className="bg-green-300 p-2 rounded-full">
                    <MaterialDesignIcons name="speedometer" size={30}/>
                </View>

                <Text className="font-bold text-xl">Response Quality</Text>

            </View>

            <View className="flex-row">
                <TouchableOpacity className="flex-1 border rounded-xl px-2 py-3 bg-white" 
                    onPress={() => setThinkingLevel("minimal")} style={{
                    borderColor: thinkingLevel === "minimal" ? "#16a34a" : "#cbd5e1"
                }}>
                    <Text className="text-center font-bold">Low</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 border border-green-600 rounded-xl px-2 py-3 bg-white" 
                    onPress={() => setThinkingLevel("medium")} style={{
                    borderColor: thinkingLevel === "medium" ? "#16a34a" : "#cbd5e1"
                }}>
                    <Text className="text-center font-bold">Medium</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 border rounded-xl px-2 py-3 bg-white" 
                    onPress={() => setThinkingLevel("high")} style={{
                    borderColor: thinkingLevel === "high" ? "#16a34a" : "#cbd5e1"
                }}>
                    <Text className="text-center font-bold">High</Text>
                </TouchableOpacity>
            </View>

            <Text className="text-gray-500">Higher quality may take longer to respond.</Text>
        </View>

        <View className="gap-2">
            <TouchableOpacity className="bg-green-700 px-8 py-4 rounded-full items-center" onPress={save}>
                <Text className="font-extrabold text-center text-white">Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity className="px-8 py-4 rounded-full items-center" onPress={save}>
                <Text className="font-extrabold text-center text-green-700">Reset to Default</Text>
            </TouchableOpacity>
        </View>
    </View>
}

export default ModelSettings;
