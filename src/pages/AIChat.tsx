import { Animated, DimensionValue, Keyboard, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import Lucide, { LucideIconName } from "@react-native-vector-icons/lucide";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useEffect, useRef, useState } from "react";

function TemplateBox(props: {
    title: string,
    description: string,
    icon: LucideIconName
}) {
    return (
    <TouchableNativeFeedback>
    <View className="flex-row gap-8 border-green-500 border-2 border-solid rounded-lg px-4 py-2 bg-white shadow-black shadow-lg elevation-2xl">
        <View className="bg-green-200 rounded-lg justify-center items-center">
            <Lucide style={{marginRight: 8, marginLeft: 8}} name={props.icon} color="#15803d" size={30}/>
        </View>

        <View>
            <Text className="font-bold text-xl">{props.title}</Text>
            <Text className="text-gray-500">{props.description}</Text>
        </View>
    </View>
    </TouchableNativeFeedback>
    )
}

function AIChat() {
    const chatHeight = useRef(new Animated.Value(0)).current;
    const [hasInput, setHasInput] = useState(false);

    useEffect(() => {
        const keyboardDidShow = Keyboard.addListener(
            'keyboardDidShow',
            () => trigger(false)
        )

        const keyboardDidHide = Keyboard.addListener(
            'keyboardDidHide',
            () => trigger(true)
        )

        return () => {
            keyboardDidShow.remove();
            keyboardDidHide.remove();
        }
    }, []);

    const trigger = (reverse: boolean) => {
        Animated.timing(chatHeight, {
            toValue: reverse ? 0 : 1,
            duration: 100,
            useNativeDriver: false
        }).start()
    }

    const heightPercentage = chatHeight.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '30%']
    })

    return (
    <View className="px-10 pt-10 gap-8 flex-1">
        <Animated.View className="gap-4 h-full" style={{bottom: heightPercentage}}>
            <View className="flex-row justify-between flex-2">
                <Lucide name="settings" size={30} />
                <Lucide name="history" size={30} />
            </View>

            <View className="items-center flex-2">
                <Text className="font-bold text-4xl text-green-600">AI Chat</Text>
            </View>

            {
                !hasInput ? (
                     <View className="gap-4 flex-4 justify-end">
                        <TemplateBox title="Plan your Groceries" description="Get suggestions based on your needs" icon="calendar-check"/>
                        <TemplateBox title="Analyze Your List" description="Check if your list is balanced and complete." icon="lightbulb"/>
                        <TemplateBox title="Suggest Budget-Friendly List" description="Tips to stay within your budget." icon="calculator"/>
                        <TemplateBox title="Grocery List" description="Organize your groceries with ease." icon="shopping-bag"/>
                    </View>               
                ) : null
            }

            <View className="justify-end items-end h-[35%]">
                <View className="flex-row gap-8 border-gray-300 border-2 border-solid rounded-lg px-4 py-1 
                bg-white shadow-black shadow-lg elevation-2xl">
                    <View className="flex-row justify-between w-full items-center">
                        <TextInput
                            className="font-bold flex-1"
                            placeholder="Type a message..."/>

                        <TouchableOpacity className="bg-green-200 p-3 rounded-xl flex-2">
                            <FontAwesome5 name="paper-plane" size={15} color="#15803d"/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    </View>
    )
}

export default AIChat;
