import { ActivityIndicator, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../../components/NavigationBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useCallback, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, doc, getDoc, getFirestore } from "@react-native-firebase/firestore";
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from "@react-native-firebase/auth";

type ErrorLocation = 'current' | 'new' | 'confirm';

type ErrorType = {
    location: ErrorLocation,
    text: string
}

function PrivacyAndSecurity() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [errors, setErrors] = useState<ErrorType[]>([]);
    const [loading, setLoading] = useState(false);

    const [current, setCurrent] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const bottomPadding = 30 + (insets.bottom > 0 ? insets.bottom : 16) + 16;

    const isError = useCallback((errors: ErrorType[], location: ErrorLocation) => {
        for (const error of errors) {
            if (error.location === location) {
                return true;
            }
        }

        return false;
    }, [errors])

    const getError = useCallback((location: ErrorLocation) => {
        for (const error of errors) {
            if (error.location === location) {
                return error;
            }
        }

        return undefined;
    }, [errors])

    async function save() {
        const errorStack: ErrorType[] = [];
        try {
            setLoading(true);
            const auth = getAuth();

            const user = auth.currentUser;
            if (!user) {
                throw Error("Not Authenticated");
            }

            const userDoc = await getDoc(doc(collection(getFirestore(), "users"), user.uid));

            const email = userDoc.get("emailAddress") as string;

            const credential = EmailAuthProvider.credential(email, current);

            await reauthenticateWithCredential(user, credential)

            if (newPass !== confirmPass) {
                throw "not-same-password";
            }

            await updatePassword(user, newPass);

            setErrors([]);
            navigation.goBack();
            ToastAndroid.show("Password reset successfully!", ToastAndroid.LONG);
        } catch (err: any) {
            if (err.code === "auth/invalid-credential") {
                errorStack.push({
                    location: 'current',
                    text: "Incorrect current password."
                });
            }

            else if (err.code === "auth/weak-password") {
                errorStack.push({
                    location: 'new',
                    text: "Password must be at least 10 characters long and contain both letters and numbers."
                });
            }

            else if (err === "not-same-password") {
                errorStack.push({
                    location: 'confirm',
                    text: "Confirm password is not the same as the New password."
                });
            }


            setErrors(errorStack);
            console.error(err);
        }

        setLoading(false);
    }

    return <View className="px-4 pt-10 gap-8 flex-1 bg-white" style={{paddingBottom: bottomPadding}}>
        <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialDesignIcons name="keyboard-backspace" size={30}/>
            </TouchableOpacity>
            <Text className="font-bold text-2xl">Privacy &#38; Security</Text>
        </View>

        <View className="flex-1 pt-10 justify-between h-full">
            <View className="gap-2">
                <View>
                    <Text className="font-bold text-lg">Current Password</Text>
                    { isError(errors, 'current')
                        ? <Text className="text-xs text-red-500">{getError('current')?.text}</Text>
                        : null
                    }
                    <View className="border px-2 py-1 rounded-xl flex-row items-center gap-2"
                        style={{ borderColor: isError(errors, 'current') ? "#ef4444" : "#64748b"}}>
                        <TextInput 
                            onChangeText={setCurrent}
                            value={current}
                            secureTextEntry={true} autoComplete="password" textContentType="password" autoCapitalize="none" autoCorrect={false}
                            className="flex-1 w-full"/>
                    </View>
                </View>

                <View>
                    <Text className="font-bold text-lg">New Password</Text>
                    { isError(errors, 'new')
                        ? <Text className="text-xs text-red-500">{getError('new')?.text}</Text>
                        : null
                    }
                    <View className="border px-2 py-1 rounded-xl flex-row items-center gap-2"
                        style={{ borderColor: isError(errors, 'new') ? "#ef4444" : "#64748b"}}>
                        <TextInput 
                            onChangeText={setNewPass}
                            value={newPass}
                            secureTextEntry={true} autoComplete="password" textContentType="password" autoCapitalize="none" autoCorrect={false}
                             className="flex-1 w-full"/>
                    </View>
                </View>

                <View>
                    <Text className="font-bold text-lg">Confirm New Password</Text>
                    { isError(errors, 'confirm')
                        ? <Text className="text-xs text-red-500">{getError('confirm')?.text}</Text>
                        : null
                    }
                    <View className="border px-2 py-1 rounded-xl flex-row items-center gap-2"
                        style={{ borderColor: isError(errors, 'confirm') ? "#ef4444" : "#64748b"}}>
                        <TextInput 
                            onChangeText={setConfirmPass}
                            value={confirmPass}
                            secureTextEntry={true} autoComplete="password" textContentType="password" autoCapitalize="none" autoCorrect={false}
                            className="flex-1 w-full"/>
                    </View>
                </View>
            </View>

            <TouchableOpacity className="bg-green-700 px-8 py-4 rounded-full items-center" onPress={save} disabled={loading}>
                {loading ?
                    <ActivityIndicator color="#FFFFFF"/>
                    :
                    <Text className="font-extrabold text-center text-white">Save</Text>
                }
            </TouchableOpacity>
        </View>

    </View>
}

export default PrivacyAndSecurity;
