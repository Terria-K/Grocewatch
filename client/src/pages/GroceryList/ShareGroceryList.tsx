import Lucide from "@react-native-vector-icons/lucide";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Checkbox from "../../components/Checkbox";
import Clipboard from "@react-native-clipboard/clipboard";
import { ConfirmationHandle } from "../../components/Confirmation";
import { GroceryList, useGroceryList } from "../../context/grocerylist";
import { useEffect, useState } from "react";
import { getAuth } from "@react-native-firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from "@react-native-firebase/firestore";
import HorizontalSeparator from "../../components/HorizontalSeparator";

type Role = 'Admin' | 'Editor' | 'Viewer';

type ShareGroceryListProps = {
    shareHandleRef: React.RefObject<ConfirmationHandle | null>,
    groceryList: GroceryList | undefined
}

type InvitedUser = {
    firstName: string,
    lastName: string,
    email: string,
    userID: string,
    role: Role
}

function ShareGroceryList({ groceryList, shareHandleRef }: ShareGroceryListProps) {
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


        const userRef = collection(getFirestore(), "users");

        let userDisplay: InvitedUser[] = []

        for (let user of groceryList.users) {
            const document = doc(userRef, user.userID);
            const realUser = await getDoc(document) ;

            const email = realUser.get("emailAddress");
            const firstName: string = realUser.get("firstName");
            const lastName: string = realUser.get("lastName");
            userDisplay.push({
                email: email,
                firstName: firstName,
                lastName: lastName,
                userID: user.userID,
                role: user.role
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

        const index = userList.findIndex((user: any) => user.userID === user.userID);

        if (index === -1) {
            userList.push({
                userID: firstUser,
                role: "Viewer"
            });

            userIDList.push(firstUser);

            groceryListState.addUser(groceryList.grocerylistID, {
                userID: firstUser!,
                role: "Viewer"
            })
        }


        await updateDoc(document, {
            users: userList,
            userIDs: userIDList
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
                                <View className="flex-row gap-3">
                                    <View className="rounded-full p-3" 
                                    style={{backgroundColor: generateColorFromText(x.firstName + x.lastName)}}>
                                        <Text className="font-bold">{x.firstName[0] + x.lastName[0]}</Text>
                                    </View>

                                    <View>
                                        <Text className="font-bold">{x.firstName + " " + x.lastName}</Text>
                                        <Text className="text-xs text-gray-400">{x.email}</Text>
                                    </View>
                                </View>

                                <View className="flex-row gap-4">
                                    <Text className="font-bold text-gray-500">{x.role}</Text>
                                    <View>
                                        <Lucide name="trash-2" size={20} color="#ef4444"/>
                                    </View>
                                </View>
                            </View>
                        )
                    }
                </View>

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

                <HorizontalSeparator gap={1}/>

                <View>
                    <Text className="font-bold">Share Link</Text>
                </View>

                <View className="flex-row gap-2 items-center">
                    <Checkbox active={groceryList?.inviteToken ? true : false} onToggle={toggleSharing} size={20} />
                    <Text className="text-sm">Show share link</Text>
                </View>

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

            <TouchableOpacity className="rounded-xl bg-green-600 p-3 w-full items-center" onPress={() => shareHandleRef.current?.closeDialog()}>
                <Text className="font-bold text-white">Done</Text>
            </TouchableOpacity></>
        )
}


export default ShareGroceryList;

function generateColorFromText(name: string) {
    let hash = 0;

    for (let i = 0; i < name.length; i += 1) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);

    const saturation = 65 / 100;
    const lightness = 55 / 100;

    const alpha = saturation * Math.min(lightness, 1 - lightness);
    const hslToRGB = (n: number) => {
        const k = (n + hue / 30) % 12;
        const color = lightness - alpha * Math.max(Math.min(k - 3, 9 - k, 1), -1);

        return Math.round(255 * color).toString(16).padStart(2, '0');
    }

    return `#${hslToRGB(8)}${hslToRGB(0)}${hslToRGB(4)}`;
}
