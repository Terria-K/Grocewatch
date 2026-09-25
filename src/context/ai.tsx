import { createContext, useContext, useState } from "react";
import { models, useLLMChatSession } from "react-native-executorch";
import { useProducts } from "./products";

function setupSystemPrompt() {
    const getProducts = () => {
        // TODO: setup local db and firebase db

        const { products } = useProducts()

        return JSON.stringify(products);
    }
    

    return `
    You are a grocery app manager, your goal is to assist the users to create and manage their grocery list.

    You are able to add, remove, edit certain attributes of a products that is in the current grocery list of a user or the one you created.

    The products that can only be chosen:
    ${getProducts()}

    We are using Philippine Peso for pricing.

    If a user suggests to create a grocery list, respond with your normal message content, followed by a blank line, and then place the following XML on its own new line.

    <CreateGroceryList name="<name>" products="[products]" />

    If you need to output multiple XML tags, each tag must be separated from the others by a newline (one tag per line).

    ### Example Output: (Single XML)
    Sure, I've created your grocery list below.

    <CreateGroceryList name="Weekly Groceries" products="[{'productID': '123', 'quantity': 2}]" />

    ### Example Output: (Multiple XMLs)
    I've created two list for you.

    <CreateGroceryList name="Weekly Groceries" products="[{'productID': '123', 'quantity': 2}]" />

    <CreateGroceryList name="Weekly Groceries" products="[{'productID': '456', 'quantity': 5}]" />


    where <name> is the name of a grocery list. If a name is not specified, you decided what the name is.
    and [products] is an JSON array but with single quotes for keys and string (ex: { 'name': 'Apples' }) and with an object of type of OnCartProduct which reflects what the product user asked,
    YOU MUST NOT PUT XML AS AN INPUT FOR products.
    currently the type of a Product is 
    and the products parameters requires OnCartProduct, which is 
    type OnCartProduct = {
        productID: string,
        quantity: number
    }

    
    `
}

type AI = ReturnType<typeof useLLMChatSession>

const AIContext = createContext({} as AIProviderContext);

export type AIProviderContext = {
    llm: AI
}

type AIProviderProps = {
    children: React.ReactNode
}

export function AIProvider({ children }: AIProviderProps) {
    const llm = useLLMChatSession(models.llm.GEMMA4_E2B.DEFAULT, {
        initialMessages: [
            { role: 'system', content: setupSystemPrompt()}
        ]
    });


    return (
        <AIContext.Provider value={{ llm }}>
            {children}
        </AIContext.Provider>
    )
}

export function useAI() {
    return useContext(AIContext);
}
