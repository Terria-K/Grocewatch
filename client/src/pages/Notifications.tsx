import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../components/NavigationBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, query, updateDoc, where } from "@react-native-firebase/firestore";
import { getAuth } from "@react-native-firebase/auth";
import { fetchGroceryList, useGroceryList } from "../context/grocerylist";

type InviteNotification = {
    notifID: string,
    inviter: string,
    role: string,
    listID: string,
    listName: string,
    date: string
}

function Notifications() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const grocerylistState = useGroceryList();
    const [notification, setNotification] = useState<InviteNotification[]>([]);

    async function onAccept(inviteNotifs: InviteNotification) {
        const user = getAuth().currentUser;
        if (!user) {
            return;
        }

        const groceryListRef = collection(getFirestore(), "grocerylist");
        const document = doc(groceryListRef, inviteNotifs.listID);

        const grocery = await getDoc(document);
        const users = grocery.get("users");
        const usersID = grocery.get("usersID");

        const userList = users || [];
        const userIDList = usersID || [];

        const index = userList.findIndex((x : any) => x.userID === user.uid);

        if (index === -1) {
            userList.push({
                userID: user.uid,
                role: "Viewer"
            });
            
            userIDList.push(user.uid);
        } else {
            userList[index].isPending = false;
            userIDList.push(user.uid);
        }


        await updateDoc(document, {
            users: userList,
            usersID: userIDList
        });

        const notificationDoc = doc(collection(getFirestore(), "invites"), inviteNotifs.notifID);

        await deleteDoc(notificationDoc);

        fetchGroceryList().then((data) => {
            grocerylistState.set(data);
        })
    }

    async function onDecline(inviteNotifs: InviteNotification) {
        const notificationDoc = doc(collection(getFirestore(), "invites"), inviteNotifs.notifID);

        await deleteDoc(notificationDoc);
    }

    useEffect(() => {
        const user = getAuth().currentUser;
        if (!user) {
            return;
        }

        const notificationRef = collection(getFirestore(), "invites");
        const q = query(notificationRef, where("user", "==", user.uid));
        
        const snapshot = onSnapshot(q, (docu) => {
            let invites: InviteNotification[] = [];
            docu.forEach((q) => {
                invites.push({
                    notifID: q.id,
                    inviter: q.get("inviterFirstName"),
                    role: q.get("Viewer"),
                    listID: q.get("listID"),
                    listName: q.get("listName"),
                    date: q.get("date")
                })
            });

            setNotification(invites);
        })

        return snapshot;
    }, [])

    return <View className="px-4 pt-10 gap-8 flex-1">
        <View className="flex-row gap-2">
            <TouchableOpacity className="justify-center" onPress={() => navigation.goBack()}>
                <MaterialDesignIcons name="arrow-left" size={26}/>
            </TouchableOpacity>
            <Text className="font-bold text-2xl">Notification</Text>
        </View>

        {
            notification.map((x, i) => (
                <View className="border rounded-2xl p-4 flex-row gap-2 items-center" key={i}>
                    <View className="bg-green-300 p-2 items-center justify-center rounded-xl">
                        <MaterialDesignIcons name="account-group" size={28} color="#166534" />
                    </View>

                    <View className="flex-1 gap-1">
                        <View>
                            <Text className="font-bold">You've been invited</Text>
                            <Text className="font-bold text-sm text-gray-500">{x.inviter} invited you to share "{x.listName}"</Text>
                        </View>

                        <View className="flex-row gap-4">
                            <TouchableOpacity className="bg-green-500 px-2 py-3 rounded-2xl" onPress={() => onAccept(x)}>
                                <Text className="font-bold text-white">Accept</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="border border-green-600 px-2 py-3 rounded-2xl" onPress={() => onDecline(x)}>
                                <Text className="font-bold">Decline</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ))
        }

    </View>
}

export default Notifications;
