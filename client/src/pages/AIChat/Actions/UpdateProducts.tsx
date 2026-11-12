import React, { Fragment } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import HorizontalSeparator from "../../../components/HorizontalSeparator";
import { useAIChat } from "../../../context/ai";

export type UpdateProductsProps = {
    action_id: string,
    name: string,
    budget: number,
    calorieLimit: number,
    children: React.ReactNode
}

function UpdateProducts({ action_id, name, budget, calorieLimit, children }: UpdateProductsProps) {
    const ai = useAIChat();

    const save = async () => {

        ai.captureAction(action_id);
    }

    return (
        <View className="gap-2">
            <Text className="font-bold text-xl">{name + "                                           "}</Text>

            <View className="bg-white p-4 rounded-xl">
            {
                React.Children.map(children, (child, i) => {
                    return <Fragment key={i}>
                            {child}
                            <HorizontalSeparator gap={10}/>
                        </Fragment>;
                })
            }

            {
                ai.capturedActions.includes(action_id) ?
                <View className="flex-2 flex-row gap-2">
                    <View className="flex-1 w-full py-2 items-center">
                        <Text className="text-green-700 font-bold">Thank You!</Text>
                    </View>
                </View>
                    :
                <View className="flex-2 flex-row gap-2">
                    <TouchableOpacity className="flex-1 bg-green-600 text-green-600 w-full py-2 rounded-lg items-center" onPress={save}>
                        <Text className="text-white font-bold">Save List</Text>
                    </TouchableOpacity>
                </View>
            }

            </View>
        </View>
    )
}

export default UpdateProducts;
