import { Animated, Keyboard, ScrollView, ScrollViewInstance, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Lucide from "@react-native-vector-icons/lucide";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { Fragment, useEffect, useRef, useState } from "react";
import NavigationBar from "../../components/NavigationBar";
import { useMessage } from "../../context/messages";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactComponentRegistry, ReactComponentRegistryProvider } from "react-native-marked";
import { ChatMessage, LoadingChatMessage, ThinkingChatMessage } from "./ChatMessage";
import TemplateBox from "./TemplateBox";
import { getAllGroceryList, getProducts, useAIChat } from "../../context/ai";
import { OnCartProduct, useGroceryList } from "../../context/grocerylist";
import { useProducts } from "../../context/products";
import { ulid } from "react-native-ulid-jsi";
import HorizontalSeparator from "../../components/HorizontalSeparator";
import { useUser } from "../../context/user";
import { Content, EnhancedGenerateContentResponse, GenerateContentStreamResult } from "@react-native-firebase/ai";


type ProductSuggestionProps = {
    id: number,
    quantity: number
}

function ProductSuggestion({ id , quantity }: ProductSuggestionProps) {
    const { products } = useProducts()

    const product = products.filter(x => x.productID === +id).at(0)
    if (!product) {
        return (
            <View className="justify-center items-center">
                <Text>Product not found</Text>
            </View>
        )
    }

    return (
        <View className="flex-row justify-between items-center">
            <View>
                <Text className="font-bold">{product.name}</Text>
                <Text>{quantity} pc</Text>
            </View>
            <View>
                <Text className="font-bold">₱{product.price.toFixed(2)}</Text>
            </View>
        </View>
    )
}


type ChatCreateGroceryListProps = {
    action_id: string,
    name: string,
    products?: string
}

function ChatCreateGroceryList({ action_id, name, products }: ChatCreateGroceryListProps) {
    const [saved, setSaved] = useState(false)

    let rProduct: OnCartProduct[] | undefined = undefined
    if (products) {
        try {
            rProduct = JSON.parse(products.replaceAll("'", "\"")) as OnCartProduct[]

            // fix productID
            rProduct = rProduct?.map(x => {
                return {
                    ...x,
                    productID: +x.productID,
                    quantity: x.quantity ?? 1,
                    onCartID: ulid()
                }
            })
        }
        catch (error){
            console.log(error)
        }
    }

    const groceryList = useGroceryList();
    const user = useUser();

    const save = async () => {
        const lid = ulid();
        
        groceryList.add({
            grocerylistID: lid,
            name: name,
            budgetLimit: 0,
            calorieLimit: 0,
            createdAt: new Date(),
            modifiedAt: new Date(),
            products: rProduct ?? [],
            defaultInviteRole: 'Viewer'
        })

        user.increasedProductTrackedBy(rProduct?.length ?? 0);

        user.increaseListCreated();

        await groceryList.saveGroceryList();
        await user.save();

        setSaved(true)
    }

    return (
        <View className="gap-2">
            <Text className="font-bold text-xl">{name + "                                           "}</Text>

            <View className="bg-white p-4 rounded-xl">
            {
                rProduct && rProduct instanceof Array ? (
                    rProduct.map((x, i) => 
                        (<Fragment key={i}>
                             <ProductSuggestion id={x.productID} quantity={x.quantity}/>
                             <HorizontalSeparator gap={10}/>
                         </Fragment>)
                    )
                ) : null 
            }

            {
                saved ?
                <View className="flex-2 flex-row gap-2">
                    <View className="flex-1 w-full py-2 items-center">
                        <Text className="text-green-700 font-bold">Thank You!</Text>
                    </View>
                </View>
                    :
                <View className="flex-2 flex-row gap-2">
                    <TouchableOpacity className="flex-1 border-green-600 border border-solid w-full py-2 rounded-lg items-center">
                        <Text className="text-green-700 font-bold">Edit List</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-1 bg-green-600 text-green-600 w-full py-2 rounded-lg items-center" onPress={save}>
                        <Text className="text-white font-bold">Save List</Text>
                    </TouchableOpacity>
                </View>
            }

            </View>
        </View>
    )
}


const components: ReactComponentRegistry = {
    CreateGroceryList: ({ props }) => {
        try {
            const { name, products, action_id } = props as unknown as ChatCreateGroceryListProps;
            if (!name || name === '') {
                return <Text style={{ color: '#ff0000' }}>Cannot do an action</Text>
            }

            return (
                <ChatCreateGroceryList action_id={action_id} name={name} products={products}/>

            )
        }
        catch 
        {
            <Text style={{ color: '#ff0000' }}>Cannot do an action</Text>
        }
    }
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

            messages.push({ message: cleanMessage, role: 'assistant'})
        }
        catch (err) {
            console.log(err)
        }

        
        reload();
        setLoading(false);
        setThought(false);
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
                <ReactComponentRegistryProvider components={components}>
                    <ScrollView contentContainerClassName="gap-4 justify-end flex-grow" ref={scrollViewRef!} showsHorizontalScrollIndicator={false}
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
                            placeholder="Type a message..."/>

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
    const chatHeight = useRef(new Animated.Value(0)).current;

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
    <>
    <View style={styles.container}>
        <Animated.View style={[{bottom: heightPercentage, paddingBottom: bottomPadding}, styles.containerScreen]}>
            <View>
                <Lucide name="settings" size={30} />
            </View>

            <View style={styles.header}>
                <Text style={styles.headerText}>AI Chat</Text>
            </View>

            <ChatScreen/>
        </Animated.View>
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
