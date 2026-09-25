import { Fragment } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
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
