import Decimal from "decimal.js";
import { create } from "zustand";

type ProductState = {
    products: Product[],
    add: (product: Product) => void;
    remove: (productID: string) => void;
}

export type Product = {
    productID: string,
    name: string,
    price: Decimal,
    calories: number
}


export const useProducts = create<ProductState>((set) => ({
    products: [
        { "productID": "adaj", "name": "Avocado", "price": new Decimal(45), "calories": 200, "category": "Fruits"},
        {"productID": "k141", "name": "Apple", "price": new Decimal(35), "calories": 200, "category": "Fruits"},
        {"productID": "214", "name": "Banana", "price": new Decimal(95), "calories": 200, "category": "Fruits"},
        {"productID": "41412", "name": "Rice", "price": new Decimal(10), "calories": 200, "category": "Grains"},
        {"productID": "ddkjro", "name": "Milkshake", "price": new Decimal(20), "calories": 200, "category": "Dairy"}
    ],
    add: (product) => set((state) => {
        state.products.push(product)
        return {
            products: state.products
        }
    }),
    remove: (id) => set((state) => {
        return {
            products: state.products.filter(item => item.productID !== id)
        }
    })
}))
