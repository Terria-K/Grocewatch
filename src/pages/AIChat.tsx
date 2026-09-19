import { useGemmaAgent, useModelDownload, MessageRole } from "react-native-gemma-agent";

import { Animated, Keyboard, ScrollView, ScrollViewInstance, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
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

function ChatMessage(props: { message: string, role: MessageRole }) {
    return (
        <View className="flex-row">
        { props.role === 'user' ? <View className="flex-1"/> : null }
            <View className="rounded-xl w-auto max-w-[70%] p-4" style={{
                backgroundColor: props.role === 'user' ? "#86efac" : "#d1d5db"
            }}>
                <Text>{props.message}</Text>
            </View>
        </View>
    )
}

type ChatMessageType = {
    message: string,
    role: MessageRole
}

function ChatScreen() {
    const { sendMessage, streamingText, isProcessing, loadModel, isModelLoaded } = useGemmaAgent();
    const { download, progress, status, checkStorage, checkModel } = useModelDownload();

    const [messages, setMessages] = useState<ChatMessageType[]>([])

    const [message, setMessage] = useState('');
    const [isDownloaded, setDownloaded] = useState(status === "ready")
    const [bytes, setBytes] = useState(0)
    const [totalBytes, setTotalBytes] = useState(0)
    const [downloading, setDownloading] = useState(false)

    const scrollViewRef = useRef<ScrollViewInstance>(null);

    useEffect(() => {
        const checking = async () => {
            setDownloaded(await checkModel());
        }

        checking()
    }, [])

    useEffect(() => {
        if (!downloading)
        {
            return;
        }

        if (progress === null)
        {
            return;
        }

        setBytes(progress.bytesDownloaded);
        setTotalBytes(progress.totalBytes);
    }, [downloading])


    const handleSubmit = async () => {
        if (!(await checkModel())) {
            return;
        }

        const mess = message.trim();
        if (mess === "")
        {
            return;
        }
        setMessage('');
        messages.push({ message: mess, role: 'user'})
        setMessages(messages);

        scrollViewRef.current?.scrollToEnd({ animated: true })

        if (!isModelLoaded)
        {
            await loadModel()
        }

        const finalMessage = await sendMessage(mess);
        messages.push({ message: finalMessage, role: 'assistant'})
        setMessages(messages);
    }

    return (
        <>
            {
                messages.length == 0 ? (
                     <View className="gap-4 flex-1 justify-end">
                        <TemplateBox title="Plan your Groceries" description="Get suggestions based on your needs" icon="calendar-check"/>
                        <TemplateBox title="Analyze Your List" description="Check if your list is balanced and complete." icon="lightbulb"/>
                        <TemplateBox title="Suggest Budget-Friendly List" description="Tips to stay within your budget." icon="calculator"/>
                        <TemplateBox title="Grocery List" description="Organize your groceries with ease." icon="shopping-bag"/>
                    </View>               
                ) : null
            }

            {
                messages.length != 0 ?
                <ScrollView contentContainerClassName="gap-4" ref={scrollViewRef!} showsHorizontalScrollIndicator={false}>
                {messages.map(x => {
                        return <ChatMessage message={x.message} role={x.role}/>
                    })
                }
                <Text>{streamingText}</Text>
                
                </ScrollView>
                : 
                    null

            }


            {isDownloaded ?
            <View className="justify-end items-end">
                <View className="flex-row gap-8 border-gray-300 border-2 border-solid rounded-lg px-4 py-1 
                bg-white shadow-black shadow-lg elevation-2xl">
                    <View className="flex-row justify-between w-full items-center">
                        <TextInput
                            onSubmitEditing={handleSubmit}
                            onChangeText={setMessage}
                            value={message}
                            className="font-bold flex-1"
                            placeholder="Type a message..."/>

                        <TouchableOpacity className="bg-green-200 p-3 rounded-xl flex-2" onPress={handleSubmit}>
                            {
                                isProcessing 
                                    ?   <FontAwesome5 name="square" size={15} color="#15803d"/>
                                    :   <FontAwesome5 name="paper-plane" size={15} color="#15803d"/>
                            }
                            
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            :
                <View className="justify-center items-center">
                    <TouchableOpacity className="bg-green-600 p-4 rounded" onPress={async () => 
                        {
                            setDownloading(true);
                            await download();
                            setDownloaded(true);
                        }}>
                        <Text className="text-2xl font-bold text-white">Download AI Model</Text>
                    </TouchableOpacity>
                    <Text>{status}</Text>
                    <Text>{progress?.totalBytes}</Text>
                    <Text>{progress?.bytesDownloaded}</Text>
                </View>
            }

        </>)
}

function AIChat() {
    const chatHeight = useRef(new Animated.Value(0)).current;

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
    <View className="px-4 pt-10 gap-8 flex-1">
        <Animated.View className="gap-4 h-[85%]" style={{bottom: heightPercentage}}>
            <View className="flex-row justify-between flex-2">
                <Lucide name="settings" size={30} />
                <Lucide name="history" size={30} />
            </View>

            <View className="items-center flex-2">
                <Text className="font-bold text-4xl text-green-600">AI Chat</Text>
            </View>

            <ChatScreen/>
        </Animated.View>
    </View>
    )
}

export default AIChat;
