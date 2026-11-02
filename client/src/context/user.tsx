import RNFS from "react-native-fs";
import { create } from "zustand";

type UserState = {
    listCreated: number,
    productsTracked: number,
    increaseListCreated: () => void,
    increasedProductTracked: () => void,
    increasedProductTrackedBy: (num: number) => void,
    set: (listCreated: number, productsTracked: number) => void,
    save: () => Promise<void>
}

export const useUser = create<UserState>((set, get) => {
    return {
        listCreated: 0,
        productsTracked: 0,
        increaseListCreated: () => set((state) => {
            return {
                ...state,
                listCreated: state.listCreated + 1
            }
        }),
        increasedProductTracked: () => set((state) => {
            return {
                ...state,
                productsTracked: state.productsTracked + 1
            }
        }),
        increasedProductTrackedBy: (num: number) => set((state) => {
            return {
                ...state,
                productsTracked: state.productsTracked + num
            }
        }),
        set: (listCreated, productsTracked) => set((state) => {
            return {
                listCreated: listCreated,
                productsTracked: productsTracked
            }
        }),
        save: async () => {
            const path = `${RNFS.DocumentDirectoryPath}/user.json`;
            const state = get();

            await RNFS.writeFile(path, JSON.stringify(state), 'utf8')
        }
    }
}) 

export async function fetchUser(): Promise<UserState | undefined> {
    const path = `${RNFS.DocumentDirectoryPath}/user.json`;

    if (await RNFS.exists(path)) {
        const json = await RNFS.readFile(path, 'utf8')
        const users = JSON.parse(json)

        return users;
    }

    return undefined;
}
