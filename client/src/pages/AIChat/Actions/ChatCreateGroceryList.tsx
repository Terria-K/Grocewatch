import React, { Fragment } from "react"
import { OnCartProduct, useGroceryList } from "../../../context/grocerylist"
import { Image, Text, TouchableOpacity, View } from "react-native"
import HorizontalSeparator from "../../../components/HorizontalSeparator"
import { images, ProductImage, useProducts } from "../../../context/products"
import { useUser } from "../../../context/user"
import { ulid } from "react-native-ulid-jsi"
import { useAIChat } from "../../../context/ai"

export type ProductSuggestionProps = {
    id: string,
    quantity: number
}

export function ProductSuggestion({ id , quantity }: ProductSuggestionProps) {
    const { products } = useProducts()

    const product = products.filter(x => x.productID === id).at(0)
    if (!product) {
        return (
            <View className="justify-center items-center">
                <Text>Product not found</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 flex-row items-center">
            <View className="flex-row gap-1">
                <Image 
                    source={images[product.productID as ProductImage]}
                    className="w-12 h-12 rounded-xl"
                />

                <View>
                    <Text className="font-bold">{product.name.length > 18 ? product.name.substring(0, 18) + "..." : product.name}</Text>
                    <Text>{quantity} pc</Text>
                </View>
            </View>
            <View className="flex-1 items-end">
                <View>
                    {product.price 
                        ? <Text className="font-bold">₱{(product.price * quantity).toFixed(2)}</Text> 
                        : <Text>Not Available</Text>}
                    
                </View>
            </View>
        </View>
    )
}

export type ChatCreateGroceryListProps = {
    action_id: string,
    name: string,
    budget: number,
    calorieLimit: number,
    children: React.ReactNode
}

function ChatCreateGroceryList({ action_id, name, budget, calorieLimit, children }: ChatCreateGroceryListProps) {
    const groceryList = useGroceryList();
    const user = useUser();

    const ai = useAIChat();

    const save = async () => {
        const lid = ulid();
        const products = createProductList();
        
        groceryList.add({
            grocerylistID: lid,
            name: name,
            budgetLimit: budget,
            calorieLimit: calorieLimit,
            createdAt: new Date(Date.now()),
            modifiedAt: new Date(Date.now()),
            products: createProductList(),
            defaultInviteRole: 'Viewer',
            inviteToken: null,
            users: []
        })

        user.increasedProductTrackedBy(products.length ?? 0);

        user.increaseListCreated();

        await groceryList.saveGroceryList(lid);
        await user.save();

        ai.captureAction(action_id);
    }

    function createProductList() {
        return React.Children.map(children, (child) => {
            if (!React.isValidElement<ProductSuggestionProps>(child)) {
                return child;
            }

            const { id, quantity } = child.props;
            return {
                productID: id,
                quantity: quantity ?? 1,
                onCartID: ulid(),
                checked: false
            } satisfies OnCartProduct
        }) as OnCartProduct[];
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

export default ChatCreateGroceryList;
