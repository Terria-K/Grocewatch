import Decimal from "decimal.js";
import { create } from "zustand";

type ProductState = {
    products: Product[],
    add: (product: Product) => void;
    remove: (productID: number) => void;
}

export type Product = {
    productID: number,
    name: string,
    price: Decimal,
    calories: number,
    category: string,
    unit: string
}


export const useProducts = create<ProductState>((set) => {
    return {
        products: [
            { "productID": 0, "name": "Avocado", "price": new Decimal(300), "calories": 160, "category": "Fruits", "unit": "pc"},
            {"productID": 1, "name": "Sugar", "price": new Decimal(74.56), "calories": 95, "category": "Sugar", "unit": "pc"},
            {"productID": 2, "name": "Banana", "price": new Decimal(95), "calories": 89, "category": "Fruits", "unit": "pc"},
            {"productID": 3, "name": "Regular Milledb", "price": new Decimal(45.25), "calories": 111, "category": "Grains", "unit": "kg"},
            {"productID": 4, "name": "Carrot", "price": new Decimal(100), "calories": 41, "category": "Vegetables", "unit": "pc"}
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
    }
}) 

