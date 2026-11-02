import { getAuth } from "@react-native-firebase/auth";
import { collection, deleteDoc, doc, getDocs, getFirestore, or, query, setDoc, where } from "@react-native-firebase/firestore";
import RNFS from "react-native-fs";
import { ulid } from "react-native-ulid-jsi";
import { create } from "zustand";

export type UserRole = 'Admin' | 'Editor' | 'Viewer';


export type GroceryListState = {
    groceryList: GroceryList[],
    set: (list: GroceryList[]) => void;
    add: (list: GroceryList) => void;

    setState: (groceryListID: string, budget: number, calorie: number) => void,

    addProduct: (groceryListID: string, productID: string, quantity: number) => void;
    removeProduct: (groceryListID: string, productID: string) => void;
    generateInvite: (groceryListID: string) => void;
    revokeInvite: (groceryListID: string) => void;
    setProductQuantity: (groceryListID: string, productID: string, quantity: number) => void;
    toggleCheckProduct: (groceryListID: string, productID: string) => void;

    addUser: (groceryListID: string, user: GroceryUser) => void;

    remove: (groceryListID: string) => void;
    saveGroceryList: (groceryListID: string) => Promise<void>;
}

export type OnCartProduct = {
    onCartID: string,
    productID: string,
    quantity: number,
    checked: boolean,
}

export type GroceryList = {
    grocerylistID: string,
    name: string,
    budgetLimit: number,
    calorieLimit: number,
    createdAt: Date,
    modifiedAt: Date,
    products: OnCartProduct[],
    defaultInviteRole: UserRole,
    isShared?: boolean,
    inviteToken: string | null,
    users?: GroceryUser[]
}

type GroceryUser = {
    userID: string,
    role: UserRole
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

        addUser: (grocerylistID, user) => set((state) => ({
            groceryList: state.groceryList.map((item) => {
                return item.grocerylistID === grocerylistID
                    ? {...item, users: [...item.users ?? [], user]}
                    : item
            })
        })),

        setState: (groceryListID, budget, calorie) => set((state) => ({
            groceryList: state.groceryList.map((item) => {
                return item.grocerylistID === groceryListID 
                    ? {...item, budgetLimit: budget, calorieLimit: calorie }
                    : item
            })
        })),

        addProduct: (grocerylistID, productID, quantity) => set((state) => ({
                groceryList: state.groceryList.map((item) => {
                    if (item.products.some(x => x.productID === productID)) {
                        return item.grocerylistID === grocerylistID 
                            ? {...item, 
                                modifiedAt: new Date(Date.now()),
                                products: item.products.map(
                                product => product.productID === productID
                                    ? { ...product, quantity: product.quantity += quantity }
                                    : product)}
                            : item
                    }

                    return item.grocerylistID === grocerylistID 
                        ? {...item, 
                            modifiedAt: new Date(Date.now()),
                            products: [...item.products, { productID: productID, quantity: quantity, checked: false, onCartID: ulid() }]}
                        : item
                })
            })
        ),

        removeProduct: (grocerylistID, productID) => set((state) => ({
                groceryList: state.groceryList.map((item) => {
                    return item.grocerylistID === grocerylistID
                        ? { ...item, 
                            modifiedAt: new Date(Date.now()),
                            products: item.products.filter(x => x.productID !== productID) }
                        : item
                })
            })
        ),

        setProductQuantity: (grocerylistID, productID, quantity) => set((state) => ({
            groceryList: state.groceryList.map((item) => {
                if (item.products.some(x => x.productID === productID)) {
                    return item.grocerylistID === grocerylistID 
                        ? {...item, 
                            modifiedAt: new Date(Date.now()),
                            products: item.products.map(
                            product => product.productID === productID
                                ? { ...product, quantity: quantity }
                                : product)}
                        : item
                }

                return item;
            })
        })),
        toggleCheckProduct: (grocerylistID, productID) => set((state) => ({
            groceryList: state.groceryList.map((item) => {
                return item.grocerylistID === grocerylistID 
                    ? {...item, 
                        modifiedAt: new Date(Date.now()),
                        products: item.products.map(
                        product => product.productID === productID
                            ? { ...product, checked: !product.checked }
                            : product)}
                    : item
            })
        })),

        generateInvite: (grocerylistID) => set((state) => ({
            groceryList: state.groceryList.map((item) => {

                return item.grocerylistID === grocerylistID
                    ? {...item, 
                        modifiedAt: new Date(Date.now()),
                        inviteToken: ulid()}
                    : item
            })
        })),

        revokeInvite: (grocerylistID) => set((state) => ({
            groceryList: state.groceryList.map((item) => {
                return item.grocerylistID === grocerylistID
                    ? {...item, 
                        modifiedAt: new Date(Date.now()),
                        inviteToken: null}
                    : item
            })
        })),
        remove: (id) => set((state) => {
            const auth = getAuth();

            const user = auth.currentUser;

            if (user) {
                const groceryList = state.groceryList.filter(item => item.grocerylistID === id).at(0)!;
                const firestore = getFirestore();

                const document = doc(collection(firestore, "grocerylist"), groceryList.grocerylistID);
                deleteDoc(document).catch(() => {});
            }

            return {
                groceryList: state.groceryList.filter(item => item.grocerylistID !== id)
            }
        }),
        saveGroceryList: async (groceryListID) => {
            const path = `${RNFS.DocumentDirectoryPath}/grocerylist.json`;
            const state = get();

            await RNFS.writeFile(path, JSON.stringify(state.groceryList.filter(x => !x.isShared)), 'utf8')

            const auth = getAuth();

            const user = auth.currentUser;

            if (!user) {
                return;
            }

            const grocerylist = state.groceryList.filter(item => item.grocerylistID === groceryListID).at(0);
            if (!grocerylist) {
                return;
            }

            const firestore = getFirestore();

            const document = doc(collection(firestore, "grocerylist"), grocerylist.grocerylistID);

            await setDoc(document, {
                name: grocerylist.name,
                products: grocerylist.products,
                budgetLimit: grocerylist.budgetLimit,
                calorieLimit: grocerylist.calorieLimit,
                inviteToken: grocerylist.inviteToken ?? null,
                defaultInviteRole: grocerylist.defaultInviteRole,
                users: grocerylist.users,
                modifiedAt: grocerylist.modifiedAt,
                user: user.uid
            })
        }
    }
})

export async function fetchGroceryList(): Promise<GroceryList[]> {
    const path = `${RNFS.DocumentDirectoryPath}/grocerylist.json`;

    let currentGrocery: any;

    if (await RNFS.exists(path)) {
        const json = await RNFS.readFile(path, 'utf8')
        const groceryLists = JSON.parse(json)

        currentGrocery = groceryLists;
    }

    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            return currentGrocery;
        }

        const groceryListRef = collection(getFirestore(), 'grocerylist');

        const q = query(
            groceryListRef,
            or(
                where("user", "==", user.uid),
                where("usersID", "array-contains", user.uid)
            )
        );
        const snapshot = await getDocs(q);

        snapshot.docs.forEach((doc, _) => {
            const data = doc.data();
            if (!data) {
                return;
            }

            const groceryItem = {
                ...data,
                grocerylistID: doc.id,
                isShared: Array.isArray(data.users)
            }

            if (!currentGrocery.some((x: any) => x.grocerylistID === doc.id)) {
                currentGrocery.push(groceryItem);
            }
        });

        return currentGrocery;
    }
    catch (err) {
        console.error(err);
    }

    return [];
}

