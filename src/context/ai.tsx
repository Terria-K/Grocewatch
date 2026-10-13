import { createContext, useContext, useState } from "react";
import { useProducts } from "./products";
import { CachedModel, Chat, downloadModel, getCachedModels, Model, Tool } from "react-native-nobodywho";
import { useGroceryList } from "./grocerylist";

function getProducts() {
    try 
    {
        let { products } = useProducts.getState();

        return JSON.stringify(products);
    }
    catch (err) {
        console.log(err);
        return "There was an error trying to get a list of products.";
    }
}

function getGroceryList(listName: string) {
    try 
    {
        let { groceryList } = useGroceryList.getState();

        groceryList = groceryList.filter(x => x.name === listName);

        return JSON.stringify(groceryList);
    }
    catch (err) {
        console.log(err);
        return "There was an error trying to get a list of grocery list.";
    }
}

function getAllGroceryList() {
    try 
    {
        let { groceryList } = useGroceryList.getState();

        return JSON.stringify(groceryList);
    }
    catch (err) {
        console.log(err);
        return "There was an error trying to get a list of grocery list.";
    }
}

const productTool = new Tool({
    name: 'get_all_products',
    description: 'Get all of the available products.',
    parameters: [],
    call: getProducts
})

const listTool = new Tool({
    name: 'get_grocery_list',
    description: 'Get all of the available products.',
    parameters: [
        { name: "listName", type: "string", description: "Name of the Grocery List." }
    ],
    call: getGroceryList
})

const allListTool = new Tool({
    name: 'get_all_grocery_list',
    description: 'Get all of the available products.',
    parameters: [],
    call: getAllGroceryList
})

//export const xmlToolParser: ToolParser = (text: string): ToolParserResult | undefined => {
//    const match = text.match(/<\|tool_call>call:(\w+)\{(.*?\}?)\}<tool_call\|>/);
//
//    if (!match) {
//        return undefined;
//    }
//
//    const functionName = match[1].trim();
//
//    let rawArgs = match[2].trim();
//
//    try {
//        rawArgs = rawArgs.replace(/<\|"\|>/g, '"');
//
//        let jsonString = `{${rawArgs}}`;
//
//        if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
//            jsonString = `{${jsonString}}`;
//        }
//
//        const validJsonArgs = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '\$1"\$2":');
//
//        const parsedArguments = JSON.parse(validJsonArgs);
//
//        const cleanedTextContent = text
//            .replace(/<\|tool_call>[\s\(\S\)]*?\<tool_call\|>/g, '') 
//            .trim();
//
//
//        return {
//            toolCalls: [
//                {
//                    function: {
//                        name: functionName,
//                        arguments: parsedArguments 
//                    }
//                }
//            ],
//
//            textContent: cleanedTextContent || "Executing requested tool."
//        }
//    } catch (err) {
//        console.error("Gemma 4 Tool Call Parsing failed: ", err);
//        return undefined;
//    }
//}


function setupSystemPrompt() {
    const getProducts = () => {
        // TODO: setup local db and firebase db

        const { products } = useProducts()

        return JSON.stringify(products);
    }
    

    return `
    You are a helpful grocery app manager, your goal is to assist the users to create and manage their grocery list.
    You are also able to help the users seeking in financial advice or strategies to be efficient at saving their money.
    You must use a step-by-step reasoning process before giving your final answer.

    You are able to add, remove, edit certain attributes of a products based on its productID that is in the current grocery list of a user or the one you created.

    Use the get_all_products tool to get all the available products. Use the category parameter when asked by the user.

    Read the productID carefully, please make sure that the only products that the user can choose is from above, if the user wants a product that is not on the list above,
    feel free advise them that this product is not available on the list.

    We are using Philippine Peso for pricing.

    If a user suggests to create a grocery list, respond with your normal message content, followed by a blank line, and then place the following XML on its own new line.

    <CreateGroceryList name="<name>" products="<products>" />

    If you need to output multiple XML tags, each tag must be separated from the others by a newline (one tag per line).

    ### Example Output: (Single XML)
    Sure, I've created your grocery list below.

    <CreateGroceryList name="Weekly Groceries" products="[{'productID': '123', 'quantity': 2}]" />

    ### Another Example Output: (Single XML)
    Here you go, I've created your grocery list.

    <CreateGroceryList name="Weekly Groceries" products="[{'productID': '123', 'quantity': 2}]" />

    Let me know if you need anything else, I got you covered.

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

    If a user suggest a specific categories that they wanted to add, you should filter the product only by that category.

    If a user wants to update a product on a grocery list, place the following XML on its own new line.


    <UpdateProducts groceryListID="<id>" products="<products>" />

    where <id> is the id of the grocery list, and [products] is an JSON array but with single quotes for keys and string (ex: { 'name': 'Apples' }) and with an object of type of OnCartProduct which reflects what the product user asked,

    ### CRITICAL FORMATTING RULES (DO NOT VIOLATE):
    1. **Self-Closing Slash:** Every <UpdateProducts> tag MUST end with a space and a forward slash before the closing bracket: />. Never omit this.
    2. **Attribute Keys:** The tag accepts two attributes only: id and products.
    3. **JSON Structure inside Attributes:** The value of products must be a JSON-like array wrapped in double quotes ("), but using SINGLE quotes (') for all internal keys and string values. Example: products="[{'productID': '123', 'quantity': 2}]"
    4. **Curly Braces:** Ensure every JSON object inside the array has opening { and closing } braces.

    CRITICAL: Do NOT write conversational filler, summaries, or explanations. Your response must consist SOLELY of the raw XML tag starting with '<' and ending with '/>'.

    ### INCORRECT OUTPUT EXAMPLES (AVOID THESE):
    ❌ MISSING SLASH: <UpdateProducts id="123" products="[{'productID': '1'}]"> (Missing />)
    ❌ WRONG QUOTES: <UpdateProducts id="123" products='[{"productID": "1"}]'> (Uses double quotes inside)
    ❌ MISSING BRACES: <UpdateProducts id="123" products="'productID': '1'"> (Missing {})



    ### Example Output: (Single XML)
    User: Add 2 avocados in my Weekly Grocery List
    Assistant:
    Sure, I've updated your products below.

    <UpdateProducts id="01BX5ZZKBKACTAV9WEVGEMMVS1" products="[{'productID': '123', 'quantity': 2}]" />

    ### Example Output: (Multiple XMLs)
    User: Add 2 avocados in my Weekly Grocery List, and make the Sugar 3 in Party Grocery List
    Assistant:
    I've created two list for you.

    <UpdateProducts id="01BX5ZZKBKACTAV9WEVGEMMVS2" products="[{'productID': '123', 'quantity': 2}]" />

    <UpdateProducts id="01BX5ZZKBKACTAV9WEVGEMMVS1" products="[{'productID': '456', 'quantity': 5}]" />

    To retrieve its id, use get_grocery_list with listName parameters that is specified by the users to be able to get the id. If it cannot be found, use
    get_all_grocery_list to see all the grocery list and find the closest one that you could see for an id.

    Please make sure that the XML has a correct formatting and the JSON too.
    `
}

type ProgressCallback = (downloaded: number, total: number) => void;

const AIContext = createContext({} as AIProviderContext);

export type AIProviderContext = {
    downloadLLM: (progressCallback?: ProgressCallback) => Promise<void>,
    launchChat: () => Promise<Chat | undefined>,
    chat: Chat | undefined
}

type AIProviderProps = {
    children: React.ReactNode
}

export function AIProvider({ children }: AIProviderProps) {
    const [chat, setChat] = useState<Chat>();

    const downloadLLM = async (progressCallback?: ProgressCallback) => {
        const modelPath = await downloadModel({
            //modelPath: "huggingface:unsloth/gemma-4-E4B-it-GGUF/gemma-4-E4B-it-Q4_K_M.gguf",
            //modelPath: "huggingface:LiquidAI/LFM2.5-1.2B-Thinking-GGUF/LFM2.5-1.2B-Thinking-Q4_K_M.gguf",
            //modelPath: "huggingface:unsloth/Qwen3.5-0.8B-GGUF/Qwen3.5-0.8B-Q4_K_M.gguf",
            modelPath: "huggingface:unsloth/gemma-4-E2B-it-GGUF/gemma-4-E2B-it-Q4_K_M.gguf",
            onDownloadProgress: (downloaded, total) => {
                if (progressCallback) {
                    progressCallback(downloaded, total);
                }
            }
        })

        console.log(modelPath);
    }

    const launchChat = async () => {
        let cachedModel: CachedModel | undefined = undefined;
        for (const model of getCachedModels()) {
            cachedModel = model;
        }

        console.log(cachedModel);

        if (!cachedModel) {
            return undefined;
        }

        const model = await Model.load({ modelPath: cachedModel.path  })
        const chat = new Chat({ model, systemPrompt: setupSystemPrompt(), tools: [productTool, listTool, allListTool] })

        setChat(chat);

        return chat;
    }


    return (
        <AIContext.Provider value={{ downloadLLM, launchChat, chat}}>
            {children}
        </AIContext.Provider>
    )
}

export function useAI() {
    return useContext(AIContext);
}
