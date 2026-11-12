import Lucide from "@react-native-vector-icons/lucide";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Checkbox from "../../components/Checkbox";
import Clipboard from "@react-native-clipboard/clipboard";
import { ConfirmationHandle } from "../../components/Confirmation";
import { GroceryList, useGroceryList, UserRole } from "../../context/grocerylist";
import { useEffect, useState } from "react";
import { getAuth } from "@react-native-firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from "@react-native-firebase/firestore";
import HorizontalSeparator from "../../components/HorizontalSeparator";
import { generateColorFromText } from "../../utils/utils";

type InvitedUser = {
    firstName: string,
    lastName: string,
    email: string,
    userID: string,
    role: UserRole,
    toBeDeleted: boolean,
    isPending: boolean
}


type ShareGroceryListProps = {
    shareHandleRef: React.RefObject<ConfirmationHandle | null>,
    groceryList: GroceryList | undefined,
    role: UserRole
}

function ShareGroceryList({ groceryList, shareHandleRef, role }: ShareGroceryListProps) {
    const [inviteEmail, setInviteEmail] = useState('');
    const [users, setUsers] = useState<InvitedUser[]>([]);
    const groceryListState = useGroceryList();

    useEffect(() => {
        getDisplayUsers().then(x => {
            setUsers(x);
        });
    }, [groceryList?.users])

    async function getDisplayUsers() {

        if (!groceryList) {
            return [];
        }

        if (!groceryList.users) {
            return [];
        }

        console.log(groceryList);


        const userRef = collection(getFirestore(), "users");

        let userDisplay: InvitedUser[] = []

        for (let user of groceryList.users) {
            const document = doc(userRef, user.userID);
            const realUser = await getDoc(document) ;

            const email = realUser.get("emailAddress");
            const firstName: string = realUser.get("firstName");
            const lastName: string = realUser.get("lastName");
            const isPending: boolean = user.isPending ?? false;
            userDisplay.push({
                email: email,
                firstName: firstName,
                lastName: lastName,
                userID: user.userID,
                role: user.role,
                toBeDeleted: false,
                isPending: isPending
            })
        }

        return userDisplay;
    }

    function toggleSharing() {
        if (!groceryList) {
            return;
        }

        if (!groceryList.inviteToken) {
            groceryListState.generateInvite(groceryList.grocerylistID);
        } else {
            groceryListState.revokeInvite(groceryList.grocerylistID);
        }

        groceryListState.saveGroceryList(groceryList.grocerylistID);
    }

    async function addUser() {
        if (!groceryList) {
            return;
        }

        await groceryListState.saveGroceryList(groceryList.grocerylistID);

        const user = getAuth().currentUser;
        if (!user) {
            return;
        }

        const usersRef = collection(getFirestore(), "users");
        const userDocument = query(usersRef, where("emailAddress", "==", inviteEmail));

        const snapshot = await getDocs(userDocument);

        const userIDs: string[] = []

        snapshot.forEach((x) => {
            userIDs.push(x.id);
        });

        if (userIDs.length == 0) {
            return;
        }

        const firstUser = userIDs.at(0);


        const groceryListRef = collection(getFirestore(), "grocerylist");
        const document = doc(groceryListRef, groceryList.grocerylistID);
        
        const grocery = await getDoc(document);
        const users = grocery.get("users");
        const usersID = grocery.get("usersID");
        
        const userList = users || [];
        const userIDList = usersID || [];
        
        const index = userList.findIndex((x : any) => x.userID === user.uid);
        
        if (index === -1) {
            userList.push({
                userID: firstUser,
                role: "Viewer",
                isPending: true
            });
        
            userIDList.push(firstUser);

            groceryListState.addUser(groceryList.grocerylistID, {
                userID: firstUser!,
                role: "Viewer",
                isPending: true
            })
        }
        
        
        await updateDoc(document, {
            users: userList,
            usersID: userIDList
        });
        
        const userRef = doc(collection(getFirestore(), "users"), user.uid);

        const u = await getDoc(userRef);

        setInviteEmail("");

        const inviteDocument = collection(getFirestore(), "invites");

        await addDoc(inviteDocument, {
            user: firstUser,
            inviter: user.uid,
            inviterFirstName: u.get("firstName"),
            role: 'Viewer',
            listID: groceryList.grocerylistID,
            listName: groceryList.name,
            date: new Date(Date.now()).toISOString()
        });
    }

    async function removeUser(id :string) {
        if (!groceryList) {
            return;
        }

        await groceryListState.saveGroceryList(groceryList.grocerylistID);

        const user = getAuth().currentUser;
        if (!user) {
            return;
        }


        const groceryListRef = collection(getFirestore(), "grocerylist");
        const document = doc(groceryListRef, groceryList.grocerylistID);

        const grocery = await getDoc(document);
        const users = grocery.get("users");
        const usersID = grocery.get("usersID");

        let userList = users || [];
        let userIDList = usersID || [];

        userList = userList.filter((x : any) => x.userID !== id);
        userIDList = userIDList.filter((x: any) => x !== id);

        groceryListState.removeUser(groceryList.grocerylistID, id);

        await updateDoc(document, {
            users: userList,
            usersID: userIDList
        });

        setInviteEmail("");
    }

    return (<>
            <View className="justify-start w-full gap-3">
                <View className="flex-row items-center gap-2">
                    <View className="bg-green-300 p-3 rounded-xl">
                        <Lucide name="share-2" size={20} />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold">Share Grocery List</Text>
                        <Text className="text-xs">Share this list with family or friends so they can view.</Text>
                    </View>
                </View>

                <View>
                    <Text className="font-bold">Shared with</Text>
                </View>

                <View className="gap-1">
                    {
                        users.map((x, i) => <View key={i} className="flex-row justify-between">
                                <View className="flex-row gap-3 items-center">
                                    <View className="rounded-full w-10 h-10 justify-center items-center" 
                                    style={{backgroundColor: generateColorFromText(x.firstName + x.lastName)}}>
                                        <Text className="font-bold">{x.firstName[0] + (x.lastName[0] ?? "")}</Text>
                                    </View>

                                    <View>
                                        <Text className="font-bold">{x.firstName + " " + x.lastName}</Text>
                                        <Text className="text-xs text-gray-400">{x.email}</Text>
                                    </View>
                                </View>

                                <View className="flex-row gap-4 items-center">
                                    {
                                        x.toBeDeleted 
                                            ? 
                                            <>
                                            <TouchableOpacity 
                                                className="rounded-xl bg-green-600 px-3 py-2 justify-center"
                                                onPress={async () => {
                                                    await removeUser(x.userID);
                                            }}>
                                                <Text className="text-white font-bold">OK</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity 
                                                className="rounded-xl border border-green-600 p-2 justify-center"
                                                onPress={() => {
                                                setUsers(users => users.map(y => y.userID === x.userID
                                                    ? {...y, toBeDeleted: false }
                                                    : y
                                                ));
                                            }}>
                                                <Text className="font-bold">Cancel</Text>
                                            </TouchableOpacity>
                                            </>
                                            :
                                            <>
                                            <Text className="font-bold text-gray-500">{x.isPending ? "Pending" : x.role}</Text>
                                            {
                                                role !== 'Viewer'
                                                ? <TouchableOpacity onPress={() => {
                                                    setUsers(users => users.map(y => y.userID === x.userID
                                                        ? {...y, toBeDeleted: true }
                                                        : y
                                                    ));
                                                }}>
                                                    <Lucide name="trash-2" size={20} color="#ef4444"/>
                                                </TouchableOpacity>
                                                : null
                                            }
                                            </>
                                    }


                                </View>
                            </View>
                        )
                    }
                </View>


                {
                    role !== 'Viewer'
                    ?
                    <>
                    <HorizontalSeparator gap={1}/>
                        <View>
                            <Text className="font-bold">Add new member</Text>
                        </View>

                        <View className="flex-row gap-2">
                            <View className="flex-1 bg-white border border-slate-500 rounded-xl px-1">
                                <TextInput 
                                    className="text-sm"
                                    value={inviteEmail}
                                    onChangeText={setInviteEmail}
                                    placeholder="Enter email address" />
                            </View>

                            <TouchableOpacity className="bg-green-700 justify-center items-center rounded-xl px-4" onPress={addUser}>
                                <Text className="text-white font-bold">Add</Text>
                            </TouchableOpacity>
                        </View>

                    </>
                    : null
                }


                {
                    role !== 'Viewer' || groceryList?.inviteToken
                    ?
                    <>
                        <HorizontalSeparator gap={1}/>
                        <View>
                            <Text className="font-bold">Share Link</Text>
                        </View>
                    </>
                    : null
                }


                {
                    role !== 'Viewer'
                    ?<View className="flex-row gap-2 items-center">
                        <Checkbox active={groceryList?.inviteToken ? true : false} onToggle={toggleSharing} size={20} />
                        <Text className="text-sm">Show share link</Text>
                    </View>
                    : null
                }


                {!groceryList?.inviteToken
                    ? null
                    : (
                        <>
                            <View>
                                <Text className="font-bold">Copy Link</Text>
                                <Text className="text-xs text-gray-500">Anyone with this link can view the list</Text>
                            </View>

                            <View className="flex-row gap-3">
                                <View className="bg-gray-300 rounded-lg flex-row flex-1">
                                    <TextInput className="text-sm text-gray-500 flex-1 px-3"
                                        readOnly={true}
                                        selectTextOnFocus={true}
                                        value={`https://grocewatch.web.app?inviteID=${groceryList.inviteToken}`} />

                                    <TouchableOpacity className="border border-green-600 px-2 py-2 rounded-lg justify-center m-2 bg-white"
                                        onPress={() => Clipboard.setString(`https://grocewatch.web.app?inviteID=${groceryList.inviteToken}`)}>
                                        <Lucide name="copy" size={20}/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
            </View>

            <TouchableOpacity className="rounded-xl bg-green-600 p-3 w-full items-center mt-2" onPress={() => shareHandleRef.current?.closeDialog()}>
                <Text className="font-bold text-white">Done</Text>
            </TouchableOpacity></>
        )
}


export default ShareGroceryList;



