import Decimal from "decimal.js";
import { create } from "zustand";

type Role = 'Admin' | 'Editor' | 'Viewer';

type GroceryListState = {
    groceryList: GroceryList[],
    add: (list: GroceryList) => void;
    remove: (groceryListID: string) => void;
}

export type OnCartProduct = {
    productID: string,
    quantity: number
}

export type GroceryList = {
    grocerylistID: string,
    name: string,
    budgetLimit: Decimal,
    calorieLimit: number,
    createdAt: Date,
    modifiedAt: Date,
    products: OnCartProduct[],
    defaultInviteRole: Role
}


export const useGroceryList = create<GroceryListState>((set) => ({
    groceryList: [],
    add: (list) => set((state) => {
        state.groceryList.push(list)
        return {
            groceryList: state.groceryList
        }
    }),
    remove: (id) => set((state) => {
        return {
            groceryList: state.groceryList.filter(item => item.grocerylistID !== id)
        }
    })
}))
