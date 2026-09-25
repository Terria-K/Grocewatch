import { Animated, Button, Keyboard, ScrollView, ScrollViewInstance, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Lucide from "@react-native-vector-icons/lucide";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import { Fragment, useEffect, useRef, useState } from "react";
import NavigationBar from "../../components/NavigationBar";
import { useMessage } from "../../context/messages";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactComponentRegistry, ReactComponentRegistryProvider } from "react-native-marked";
import { ChatMessage, LoadingChatMessage } from "./ChatMessage";
import TemplateBox from "./TemplateBox";
import { useAI } from "../../context/ai";
import { OnCartProduct, useGroceryList } from "../../context/grocerylist";
import { useProducts } from "../../context/products";
import Decimal from "decimal.js";


function Separator() {
    return <View style={sepStyles.separator}/>
}


const sepStyles = StyleSheet.create({
  separator: {
    height: 1,                 // Line thickness
    width: '100%',             // Full width
    backgroundColor: '#CCCCCC', // Light gray color
    marginVertical: 10,        // Spacing above and below the line
  },
});

type ProductSuggestionProps = {
    name: string,
    quantity: number
}

function ProductSuggestion({ name, quantity }: ProductSuggestionProps) {
    const { products } = useProducts()

    const product = products.filter(x => x.productID === name).at(0)

    return (
        <View >
            <Text className="font-bold">{product?.name}</Text>
            <Text>{quantity} pc</Text>
        </View>
    )
}


type ChatCreateGroceryListProps = {
    name: string,
    products?: string
}

function ChatCreateGroceryList({ name, products }: ChatCreateGroceryListProps) {
    const [saved, setSaved] = useState(false)

    let rProduct: OnCartProduct[] | undefined = undefined
    if (products) {
        console.log("JSON: " + products)
        try {
            rProduct = JSON.parse(products.replaceAll("'", "\"")) as OnCartProduct[]

            console.log(rProduct)
        }
        catch (error){
            console.log(error)
        }
    }

    const groceryList = useGroceryList();

    const save = () => {
        groceryList.add({
            grocerylistID: "blah",
            name: name,
            budgetLimit: new Decimal(0),
            calorieLimit: 0,
            createdAt: new Date(),
            modifiedAt: new Date(),
            products: rProduct ?? [],
            defaultInviteRole: 'Viewer'
        })

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
                             <ProductSuggestion name={x.productID} quantity={x.quantity}/>
                             <Separator/>
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
        console.log(props)
        try {
            const { name, products } = props as unknown as ChatCreateGroceryListProps;
            if (!name || name === '') {
                return <Text style={{ color: '#ff0000' }}>Cannot do an action</Text>
            }

            console.log(props)
            return (
                <ChatCreateGroceryList name={name} products={products}/>

            )
        }
        catch 
        {
            <Text style={{ color: '#ff0000' }}>Cannot do an action</Text>
        }
    }
}

function ChatScreen() {
    const { llm } = useAI();


    const { messages, reload } = useMessage();

    const [message, setMessage] = useState('');
    const [isDownloaded, setDownloaded] = useState(llm.isReady)
    const [loading, setLoading] = useState(false)
    const [percent, setPercent] = useState(0)
    const [token, setToken] = useState('')

    const scrollViewRef = useRef<ScrollViewInstance>(null);


    const handleSubmit = async () => {
        if (loading) {
            llm.stop!()
            return;
        }

        const mess = message.trim();

        if (mess === "" || !llm.isReady || !llm.sendMessage)
        {
            return;
        }

        setLoading(true);
        setMessage('');
        messages.push({ message: mess, role: 'user'})
        reload();

        Keyboard.dismiss();

        scrollViewRef.current?.scrollToEnd({ animated: true })
        //if (!llm.isReady)
        //{
        //    await llm.loadModel(GEMMA_4_E4B_IT, {backend: "gpu"}, (percent) => {
        //        setPercent(percent);
        //    })
        //}
        //
        setToken('')

        const finalMessage = await llm.sendMessage!(mess, (t) => {
            if (t.match('<|turn>model'))
            {
                return;
            }

            setToken(prevText => prevText + t)
        });
        const m = finalMessage.messages[finalMessage.messages.length - 1]

        console.log(m.content);

        messages.push({ message: m.content?.slice(12).toString()!, role: 'assistant'})
        
        reload();
        setLoading(false);
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
                        loading ? <LoadingChatMessage token={token}/> : null
                    }

                    </ScrollView>
                </ReactComponentRegistryProvider>
                : 
                    null
            }

            {
               !llm.isReady 
                    ? 
                    <View className="items-center">
                        <Text className="font-bold text-xl">Loading Model {llm.downloadProgress}%</Text>
                    </View> 
                    : null
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
            <View style={styles.icons}>
                <Lucide name="settings" size={30} />
                <Lucide name="history" size={30} />
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
    
    icons: {
        flexDirection: 'row',
        justifyContent: 'space-between'
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
