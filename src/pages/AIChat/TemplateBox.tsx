import Lucide, { LucideIconName } from "@react-native-vector-icons/lucide";
import { Text, TouchableNativeFeedback, View } from "react-native";

function TemplateBox(props: {
    title: string,
    description: string,
    icon: LucideIconName
}) {
    return (
        <TouchableNativeFeedback>
            <View className="flex-row gap-6 border-green-500 border-2 border-solid rounded-lg px-4 py-4 bg-white shadow-black shadow-lg elevation-2xl items-center">
                <View className="bg-green-200 rounded-lg justify-center items-center p-2">
                    <Lucide name={props.icon} color="#15803d" size={30}/>
                </View>

                <View>
                    <Text className="font-bold text-md">{props.title}</Text>
                    <Text className="text-gray-500 text-xs">{props.description}</Text>
                </View>
            </View>
        </TouchableNativeFeedback>
    )
}

export default TemplateBox;
