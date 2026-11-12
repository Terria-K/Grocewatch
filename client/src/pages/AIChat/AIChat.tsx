import { Animated as SimpleMated, Keyboard, ScrollView, ScrollViewInstance, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Lucide from "@react-native-vector-icons/lucide";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { useEffect, useRef, useState } from "react";
import NavigationBar, { RootStackParamList } from "../../components/NavigationBar";
import { useMessage } from "../../context/messages";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactComponentRegistry, ReactComponentRegistryProvider } from "react-native-marked";
import { ChatMessage, LoadingChatMessage, ThinkingChatMessage } from "./ChatMessage";
import TemplateBox from "./TemplateBox";
import { getAllGroceryList, getProducts, useAIChat } from "../../context/ai";
import { ulid } from "react-native-ulid-jsi";
import { Content, EnhancedGenerateContentResponse, GenerateContentStreamResult } from "@react-native-firebase/ai";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ChatCreateGroceryList, { ChatCreateGroceryListProps, ProductSuggestion, ProductSuggestionProps } from "./Actions/ChatCreateGroceryList";
import UpdateProducts, { UpdateProductsProps } from "./Actions/UpdateProducts";
import React from "react";
import { useTranslation } from "react-i18next";


const components: ReactComponentRegistry = {
    ProductSuggestion: ({ props }) => {
        try {
             const { id, quantity } = props as unknown as ProductSuggestionProps;

             return <ProductSuggestion id={id} quantity={quantity}/>
        } catch {
            return <Text style={{ color: '#ff0000' }}>Error while creating products.</Text>
        }
    },
    CreateGroceryList: ({ props, children }) => {
        try {
            const { name, action_id, budget, calorieLimit } = props as unknown as ChatCreateGroceryListProps;
            if (!name || name === '') {
                return <Text style={{ color: '#ff0000' }}>Cannot do an action</Text>
            }

            const trueChild = React.Children.map(children, (child) => {
                if (typeof child === "string") {
                    const split = child.split("\n");
                    return split.map(x => {
                        try {
                            const json = JSON.parse(x)
                            return <ProductSuggestion id={json.id} quantity={json.quantity}/>
                        } catch {
                            return <Text>{x}</Text>
                        }
                    });
                } 
                return <></>
            })

            return (
                <ChatCreateGroceryList action_id={action_id} name={name} budget={+budget} calorieLimit={+calorieLimit}>
                    {trueChild}
                </ChatCreateGroceryList>

            )
        }
        catch 
        {
            return <Text style={{ color: '#ff0000' }}>Error while creating create grocery list action</Text>
        }
    },
    UpdateProducts: ({ props, children }) => {
        try {
            const { name, action_id, budget, calorieLimit } = props as unknown as UpdateProductsProps;
            if (!name || name === '') {
                return <Text style={{ color: '#ff0000' }}>Cannot do an action</Text>
            }

            const trueChild = React.Children.map(children, (child) => {
                if (typeof child === "string") {
                    const split = child.split("\n");
                    return split.map(x => {
                        try {
                            const json = JSON.parse(x)
                            return <ProductSuggestion id={json.id} quantity={json.quantity}/>
                        } catch {
                            return <Text>{x}</Text>
                        }
                    });
                } 
                return <></>
            })

            return <UpdateProducts action_id={action_id} name={name} budget={+budget} calorieLimit={+calorieLimit}>
                {trueChild}
            </UpdateProducts>
        }
        catch {
            return <Text style={{ color: '#ff0000' }}>Error while creating update products action</Text>
        }
    },
}

let conversationHistory: Content[] = [];

function ChatScreen() {
    const aiChat = useAIChat();
    const { messages, reload } = useMessage();

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false)
    const [token, setToken] = useState('')
    const [thinkingToken, setThinkingToken] = useState('')
    const [thought, setThought] = useState(false)


    const scrollViewRef = useRef<ScrollViewInstance>(null);


    const handleSubmit = async () => {

        if (loading) {
            setLoading(false);
            return;
        }


        const mess = message.trim();

        if (mess === "")
        {
            return;
        }

        setLoading(true);
        setMessage('');
        messages.push({ message: mess, role: 'user'})
        reload();

        Keyboard.dismiss();

        scrollViewRef.current?.scrollToEnd({ animated: true })

        setToken('')
        setThinkingToken('');

        let model = aiChat.model;

        if (!aiChat.model) {
            model = await aiChat.launchChat();
        }

        if (!model) {
            setLoading(false);
            return;
        }

        try {
            const handleStream = async (responses: GenerateContentStreamResult) => {
                for await (const chunk of responses.stream) {
                    const parts = chunk.candidates?.[0].content?.parts;
                    if (parts) {
                        for (const part of parts) {
                            if (part.thought) {
                                setThought(true);
                                setThinkingToken(prev => prev + (part.text || ''))
                            } else {
                                setToken(prev => prev + (part.text || ''));
                            }
                        }
                    }
                }
            }

            const getCleanText = async (response: EnhancedGenerateContentResponse) => {
                const parts = response.candidates?.[0]?.content?.parts;

                if (!parts) return response.text?.() || '';

                return parts
                    .filter(part => {
                        console.log(part);
                        return !part.thought && part.text
                    })
                    .map(part => part.text)
                    .join('');
            }

            conversationHistory.push({
                role: 'user',
                parts: [{ text: mess }]
            })

            let responses = await model.generateContentStream({
                contents: conversationHistory
            });

            await handleStream(responses);

            const finalMessage = await responses.response;

            let functionCalls = finalMessage.functionCalls();
            const modelCandidateContent = finalMessage.candidates?.[0]?.content;
            if (modelCandidateContent) {
                modelCandidateContent.parts.forEach(part => {
                    if (part.functionCall && !part.thoughtSignature && !part.thoughtSignature) {
                        part.thoughtSignature = "skip_thought_signature_validator" as unknown as undefined;
                    }
                });
                conversationHistory.push(modelCandidateContent);
            }


            let cleanMessage = await getCleanText(finalMessage);

            const MAX_TURNS = 5;
            let turnCount = 0;
            let keepGoing = true;


            if (functionCalls) {
                while (keepGoing && turnCount < MAX_TURNS)
                {
                    const toolCallResponse = []
                    for (const call of functionCalls) {
                        let resultMessage: string | object = {}
                        if (call.name === "get_all_products") {
                            const products = getProducts() as object;

                            const parsedProducts = typeof products === 'string' ? JSON.parse(products) : products;
                            resultMessage = parsedProducts;
                        }
                        else if (call.name === "get_all_grocery_list") {
                            const list = getAllGroceryList() as object;

                            const parsedList = typeof list === 'string' ? JSON.parse(list) : list;
                            resultMessage = parsedList;
                        }
                        else if (call.name === "get_action_id") {
                            const id = ulid();

                            resultMessage = id
                        }

                        toolCallResponse.push({
                            functionResponse: {
                                name: call.name,
                                response: typeof resultMessage === 'object' ? { result: resultMessage } : { result: resultMessage }
                            }
                        })
                    }

                    conversationHistory.push({
                        role: 'user',
                        parts: toolCallResponse
                    })

                    responses = await model.generateContentStream({
                        contents: conversationHistory
                    })

                    await handleStream(responses);
                    const finalMessage = await responses.response;

                    if (modelCandidateContent) {
                        modelCandidateContent.parts.forEach(part => {
                            if (part.functionCall && !part.thoughtSignature && !part.thoughtSignature) {
                                part.thoughtSignature = "skip_thought_signature_validator" as unknown as undefined;
                            }
                        });

                        conversationHistory.push(modelCandidateContent);
                    }

                    functionCalls = finalMessage.functionCalls();

                    if (!functionCalls || functionCalls.length == 0) {
                        keepGoing = false;
                        cleanMessage = await getCleanText(finalMessage);
                        break;
                    }
                }
            }

            console.log(cleanMessage);
            messages.push({ message: cleanMessage, role: 'assistant'})
        }
        catch (err) {
            if (err === "AI/fetch-error") {
                ToastAndroid.show("AI is currently experiencing a high demand. Please try again Later", ToastAndroid.LONG);
            } else {
                ToastAndroid.show("Something went wrong. Please try again Later", ToastAndroid.LONG);
            }
            console.error(err)
        }

        
        reload();
        setLoading(false);
        setThought(false);
    }

    const { t } = useTranslation();

    return (
        <>
            {
                messages.length == 0 && message.length == 0 ? (
                     <Animated.View className="gap-4 flex-1 justify-end" exiting={FadeOut.duration(300)} entering={FadeIn.duration(100)}>
                        <TemplateBox 
                            title={t("PLAN_YOUR_GROCERIES.title")}
                            description={t("PLAN_YOUR_GROCERIES.description")}
                            icon="calendar-check"
                            template={t("PLAN_YOUR_GROCERIES.result")}
                            onPress={setMessage} 
                        />

                        <TemplateBox 
                            title={t("ANALYZE_YOUR_LIST.title")}
                            description={t("ANALYZE_YOUR_LIST.description")}
                            icon="lightbulb"
                            template={t("ANALYZE_YOUR_LIST.result")}
                            onPress={setMessage} 
                        />

                        <TemplateBox 
                            title={t("SUGGEST_BUDGET_FRIENDLY_LIST.title")}
                            description={t("SUGGEST_BUDGET_FRIENDLY_LIST.description")} 
                            icon="calculator"
                            template={t("SUGGEST_BUDGET_FRIENDLY_LIST.result")}
                            onPress={setMessage} 
                        />

                        <TemplateBox 
                            title={t("ORGANIZE_GROCERY_LIST.title")}
                            description={t("ORGANIZE_GROCERY_LIST.description")}
                            icon="shopping-bag"
                            template={t("ORGANIZE_GROCERY_LIST.result")}
                            onPress={setMessage} 
                        />
                    </Animated.View> 
                ) : null
            }

            {
                messages.length != 0 ?
                <ReactComponentRegistryProvider components={components}>
                    <ScrollView contentContainerClassName="gap-4 justify-end flex-grow" ref={scrollViewRef!} showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
                    {messages.map((x, i) => {
                            return <ChatMessage key={i} message={x.message} role={x.role}/>
                        })
                    }

                    {
                        thought 
                            ?
                            <ThinkingChatMessage token={thinkingToken}/>
                            : null
                    }

                    {
                        loading 
                            ? <LoadingChatMessage token={token}/> 
                            : null
                    }

                    </ScrollView>
                </ReactComponentRegistryProvider>
                : 
                    null
            }

            <View className="justify-end items-end">
                <View className="flex-row gap-8 border-gray-300 border-2 border-solid rounded-lg px-4 py-1 
                bg-white shadow-black shadow-lg elevation-2xl">
                    <View className="flex-row justify-between w-full items-center">
                        <TextInput
                            multiline={true}
                            onSubmitEditing={handleSubmit}
                            onChangeText={setMessage}
                            value={message}
                            readOnly={loading}
                            className="font-bold flex-1"
                            placeholder={t("TYPE_A_MESSAGE") + "..."}/>

                        <TouchableOpacity className="bg-green-200 p-3 rounded-xl flex-2" onPress={handleSubmit}>
                            {
                                loading
                                    ?   <FontAwesome5 name="square" size={15} color="#15803d"/>
                                    :   <FontAwesome5 name="paper-plane" size={15} color="#15803d"/>
                            }
                            
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        </>)
}

function AIChat() {
    const insets = useSafeAreaInsets();
    const chatHeight = useRef(new SimpleMated.Value(0)).current;
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const bottomPadding = 90 + (insets.bottom > 0 ? insets.bottom : 16) + 16;

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
        SimpleMated.timing(chatHeight, {
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
    <>
    <View style={styles.container}>
        <SimpleMated.View style={[{bottom: heightPercentage, paddingBottom: bottomPadding}, styles.containerScreen]}>
            <TouchableOpacity onPress={() => navigation.navigate("ModelSettings")}>
                <Lucide name="settings" size={30} />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.headerText}>AI Chat</Text>
            </View>

            <ChatScreen/>
        </SimpleMated.View>
    </View>

    <NavigationBar currentRoute="AIChat"/>
    </>
    )
}

export default AIChat;

const styles = StyleSheet.create({
    container: {
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 40,
        gap: 32,
        flex: 1
    },
    
    containerScreen: {
        gap: 16,
        height: '100%'
    },

    header: {
        alignItems: 'center',
        flex: 2
    },
    headerText: {
        fontWeight: 700,
        fontSize: 36,
        lineHeight: 40,
        color: '#16a34a'
    }
})
