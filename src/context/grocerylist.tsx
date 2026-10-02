import RNFS from "react-native-fs";
import { create } from "zustand";

type Role = 'Admin' | 'Editor' | 'Viewer';

export type GroceryListState = {
    groceryList: GroceryList[],
    set: (list: GroceryList[]) => void;
    add: (list: GroceryList) => void;
    addProduct: (groceryListID: string, productID: number, quantity: number) => void;
    remove: (groceryListID: string) => void;
    saveGroceryList: () => Promise<void>;
}

export type OnCartProduct = {
    productID: number,
    quantity: number
}

export type GroceryList = {
    grocerylistID: string,
    name: string,
    budgetLimit: number,
    calorieLimit: number,
    createdAt: Date,
    modifiedAt: Date,
    products: OnCartProduct[],
    defaultInviteRole: Role
}

export const useGroceryList = create<GroceryListState>((set, get) => {
    return {
        groceryList: [],
        set: (list) => set({ groceryList: list}),
        add: (list) => set((state) => {
            return {
                groceryList: [...state.groceryList, list]
            }
        }),
        addProduct: (grocerylistID, productID, quantity) => set((state) => ({
                groceryList: state.groceryList.map((item) => {
                    if (item.products.some(x => x.productID === productID)) {
                        // implementation?

                        return item.grocerylistID === grocerylistID 
                            ? {...item, products: item.products.map(
                                product => product.productID === productID
                                    ? { ...product, quantity: product.quantity += quantity }
                                    : product)}
                            : item
                    }

                    return item.grocerylistID === grocerylistID 
                        ? {...item, products: [...item.products, { productID: productID, quantity: quantity }]}
                        : item
                })
            })
        ),
        remove: (id) => set((state) => {
            return {
                groceryList: state.groceryList.filter(item => item.grocerylistID !== id)
            }
        }),
        saveGroceryList: async () => {
            const path = `${RNFS.DocumentDirectoryPath}/grocerylist.json`;
            const state = get();

            await RNFS.writeFile(path, JSON.stringify(state.groceryList), 'utf8')
        }
    }
})

export async function fetchGroceryList(): Promise<GroceryList[]> {
    const path = `${RNFS.DocumentDirectoryPath}/grocerylist.json`;

    if (await RNFS.exists(path)) {
        const json = await RNFS.readFile(path, 'utf8')
        const groceryLists = JSON.parse(json)

        return groceryLists;
    }

    return [];
}

