import Lucide from "@react-native-vector-icons/lucide";
import { Fragment, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useMarkdown, useMarkdownWithComponents } from "react-native-marked"

type MessageRole = 'user' | 'assistant' | 'tool' | 'system';

export function ChatMessage(props: { message: string, role: MessageRole }) {
    const markdown = props.role == 'user' ? 
        useMarkdown(props.message, {
        styles: {
            strong: { fontWeight: 'bold' }
        }
    }) : 
        useMarkdownWithComponents(props.message, {
        styles: {
            strong: { fontWeight: 'bold' }
        }
    })

    return (
        <View style={chatStyle.container}>
        { props.role === 'user' ? <View style={chatStyle.push} /> : null }
            <View style={[
                chatStyle.textContainer,
                {
                    backgroundColor: props.role === 'user' ? "#86efac" : "#d1d5db"
                }
            ]}>
                {
                    markdown.map((element, i) => {
                        return <Fragment key={i}>{element}</Fragment>
                    })
                }
            </View>
        </View>
    )
}

export function ThinkingChatMessage(props: { token: string }) {
    const markdown = useMarkdownWithComponents(props.token, {
        styles: {
            strong: { fontWeight: 'bold' }
        }
    })

    console.log(props.token);

    const [collapse, setCollapse] = useState(false);

    return (
        <View style={chatStyle.container}>
            <View style={[
                chatStyle.textContainer,
                {
                    backgroundColor: "#d1d5db"
                }
            ]}>
                <View className="flex-row gap-2 items-center">
                    <Lucide name="brain-cog" size={30}/>
                    <Text className="font-bold">
                        Thinking
                    </Text>

                    <TouchableOpacity onPress={() => setCollapse(p => !p)}>
                        {
                            !collapse 
                                ?
                                <Lucide name="chevron-right" size={20} />
                                :
                                <Lucide name="chevron-down" size={20} />
                        }
                    </TouchableOpacity>
                </View>

                {
                    collapse ?
                        markdown.map((element, i) => {
                            return <Fragment key={i}>{element}</Fragment>
                        })
                        : null
                }

            </View>
        </View>
    )
}

export function LoadingChatMessage(props: { token: string }) {
    const markdown = useMarkdownWithComponents(props.token, {
        styles: {
            strong: { fontWeight: 'bold' }
        }
    })

    return (
        <View style={chatStyle.container}>
            <View style={[
                chatStyle.textContainer,
                {
                    backgroundColor: "#d1d5db"
                }
            ]}>
                {
                    markdown.map((element, i) => {
                        return <Fragment key={i}>{element}</Fragment>
                    })
                }
                <ActivityIndicator size="small" color="#000000" />
            </View>
        </View>
    )
}

const chatStyle = StyleSheet.create({
    container: {
        flexDirection: 'row'
    },
    push: {
        flex: 1
    },
    textContainer: {
        borderRadius: 12,
        width: 'auto',
        maxWidth: '80%',
        padding: 8
    }
})
