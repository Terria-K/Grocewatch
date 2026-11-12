import { Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../components/NavigationBar";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, doc, getDocs, getFirestore, query, updateDoc, where } from "@react-native-firebase/firestore";
import { getAuth } from "@react-native-firebase/auth";

type SharingConfirmScreenProps = NativeStackScreenProps<RootStackParamList, 'SharingConfirmScreen'>;

function SharingConfirmScreen({ route }: SharingConfirmScreenProps) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const p = route.params;

    async function join(inviteId: string) {
        const user = getAuth().currentUser;
        if (!user) {
            return;
        }

        const groceryListRef = collection(getFirestore(), "grocerylist");
        const queries = query(groceryListRef, where("inviteToken", "==", inviteId));

        const list: {
            listID: string,
            users: { userID: string, role: string }[],
            usersID: string[]
        }[] = [];
        const snapshot = await getDocs(queries);
        snapshot.forEach(x => list.push({
            listID: x.id,
            users: x.get("users"),
            usersID: x.get("usersID")
        }));

        for (let { users, listID, usersID } of list) {
            const document = doc(groceryListRef, listID);

            const userList = users || [];
            const userIDList = usersID || [];

            const index = userList.findIndex(x => x.userID === user.uid);

            if (index !== -1) {
                userList[index].role = "Viewer";
                usersID[index] = user.uid
            } else {
                userList.push({
                    userID: user.uid,
                    role: "Viewer"
                });
                usersID.push(user.uid);
            }

            await updateDoc(document, {
                users: userList,
                usersID: userIDList
            });
        }

        navigation.goBack();
    }

    return <View className="px-4 pt-10 gap-8 flex-1">
        <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialDesignIcons name="keyboard-backspace" size={30}/>
            </TouchableOpacity>
            <Text className="font-bold text-2xl">Join the Grocery List</Text>
        </View>

        <View className="gap-5 justify-center items-center">
            <Text className="font-bold text-2xl text-center">You are invited to join to this grocery list.</Text>

            <View className="gap-2">
                <TouchableOpacity onPress={() => join(p.inviteId)}>
                    <Text className="text-center bg-green-500 p-4 rounded-xl font-bold">Join</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-center border border-green-500 p-4 rounded-xl font-bold">Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
}

export default SharingConfirmScreen;
