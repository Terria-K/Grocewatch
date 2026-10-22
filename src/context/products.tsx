import RNFS from "react-native-fs";
import Decimal from "decimal.js";
import { create } from "zustand";

type ProductState = {
    products: Product[],
    add: (product: Product) => void;
    remove: (productID: number) => void;
    load: (rawJsonArray: any) => void
}

export type WeeklyPriceEntry = {
    date: string,
    prevailingPrice: Decimal,
    lowestPrice: Decimal,
    highestPrice: Decimal
}

export type Product = {
    productID: number,
    name: string,
    price: Decimal,
    calories: number,
    category: string,
    unit: "pc" | "kg",
    currentPrices: {
        lowestPrice: Decimal,
        highestPrice: Decimal,
        prevailingPrice: Decimal
    },
    priceHistory: WeeklyPriceEntry[]
}



export const useProducts = create<ProductState>((set) => {
    return {
        products: [],
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
        }),
        load: (rawJsonArray) => set(() => {
            return {
                products: rawJsonArray.map((item: any) => hydrateProduct(item, item.productID, "meat"))
            }
        })
    }
}) 

export function hydrateProduct(rawJson: any, id: number, category: string): Product {
    return {
        productID: id,
        name: rawJson.commodity as string,
        unit: rawJson.unit_specification as "pc" | "kg",
        calories: rawJson.calories as number,
        category: category,
        currentPrices: {
            lowestPrice: new Decimal(rawJson.current_prices.lowest_price ?? 0),
            highestPrice: new Decimal(rawJson.current_prices.highest_price ?? 0),
            prevailingPrice: new Decimal(rawJson.current_prices.prevailing_price ?? 0),
        },
        price: new Decimal(rawJson.current_prices.prevailing_price ?? 0),
        priceHistory: rawJson.history_last_90_days_weekly.map((entry: any) => ({
            date: entry.date,
            prevailingPrice: new Decimal(entry.prevailing_price),
            lowestPrice: new Decimal(entry.lowest_price),
            highestPrice: new Decimal(entry.highest_price)
        } as WeeklyPriceEntry)) as WeeklyPriceEntry[]
    }
}

const productFiles = [
    "beef_brisket.json",
    "beef_rump.json",
    "pork_ham__kasim.json",
    "pork_belly__liempo.json",
    "whole_chicken.json",
    "frozen_kasim.json",
    "frozen_liempo.json",
    "chicken_egg__white__medium.json",
    "chicken_egg__white__pewee.json",
    "chicken_egg__white__extra_small.json",
    "chicken_egg__white__small.json",
    "chicken_egg__white__large.json",
    "chicken_egg__white__extra_large.json",
    "chicken_egg__white__jumbo.json",
    "chicken_egg__brown__medium.json",
    "chicken_egg__brown__large.json",
    "chicken_egg__brown__extra_large.json"
];

export async function loadProduct() {
    try {

        const loadedData = []
        let counter = 0

        for (const file of productFiles) {
            const relativePath = `products/meat/${file}`;

            const fileContents = await RNFS.readFileAssets(relativePath, "utf8");

            const parsedJson = JSON.parse(fileContents);

            loadedData.push({ ...parsedJson, productID: counter });
            counter += 1;
        }

        return loadedData;
    }
    catch (err) {
        console.error(err);
    }
}
