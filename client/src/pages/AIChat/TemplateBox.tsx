import Lucide, { LucideIconName } from "@react-native-vector-icons/lucide";
import { Text, TouchableOpacity, View } from "react-native";

function TemplateBox(props: {
    title: string,
    description: string,
    icon: LucideIconName,
    template: string,
    onPress: (x: string) => void
}) {
    function prefill() {
        props.onPress(props.template)
    }

    return (
        <TouchableOpacity 
            onPress={prefill}
            className="flex-row gap-6 border-green-500 border border-solid rounded-2xl px-4 py-2 bg-white shadow-black shadow-lg elevation-2xl items-center">
            <View className="bg-green-200 rounded-lg justify-center items-center p-2">
                <Lucide name={props.icon} color="#15803d" size={30}/>
            </View>

            <View>
                <Text className="font-bold">{props.title}</Text>
                <Text className="text-gray-500 text-xs">{props.description}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default TemplateBox;
