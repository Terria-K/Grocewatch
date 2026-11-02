import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../../components/NavigationBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "@react-native-firebase/auth";
import { collection, doc, getDoc, getFirestore, updateDoc } from "@react-native-firebase/firestore";

type ErrorLocation = 'first_name' | 'last_name' | 'email_address';

type ErrorType = {
    location: ErrorLocation,
    text: string
}

function EditProfile() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [errors, setErrors] = useState<ErrorType[]>([]);
    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState<User | undefined>();
    const [initializing, setInitializing] = useState(true);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const bottomPadding = 30 + (insets.bottom > 0 ? insets.bottom : 16) + 16;

    useEffect(() => {
        setInitializing(true);
        const subscriber = onAuthStateChanged(getAuth(), async (user) => {
            if (user) {
                setUser(user);

                const db = getFirestore();
                const userCollection = doc(collection(db, "users"), user.uid);
                const docUser = await getDoc(userCollection);
                setFirstName(docUser.get("firstName"));
                setLastName(docUser.get("lastName"));
                setEmail(docUser.get("emailAddress"));
                setPhoneNumber(docUser.get("phoneNumber"));

                setInitializing(false);
            }
        })

        return subscriber;
    }, []);

    async function save() {
        if (initializing || !user) {
            return;
        }

        setErrors([]);

        const errorStack: ErrorType[] = [];

        if (firstName === '') {
            errorStack.push({
                location: 'first_name',
                text: 'First name is required.'
            })
        }

        if (lastName === '') {
            errorStack.push({
                location: 'last_name',
                text: 'Last name is required.'
            })
        }

        if (email === '') {
            errorStack.push({
                location: 'email_address',
                text: 'Email is required.'
            })
        }

        if (errorStack.length > 0) {
            setErrors(errorStack);
            return;
        }

        setLoading(true);

        const uid = user.uid;
        const db = getFirestore();
        const userCollection = doc(collection(db, "users"), uid);

        await updateDoc(userCollection, {
            firstName: firstName,
            lastName: lastName,
            emailAddress: email
        });


        setLoading(false);
    }

    const isError = useCallback((errors: ErrorType[], location: ErrorLocation) => {
        for (const error of errors) {
            if (error.location === location) {
                return true;
            }
        }

        return false;
    }, [errors])

    const getError = useCallback((location: string) => {
        for (const error of errors) {
            if (error.location === location) {
                return error;
            }
        }

        return undefined;
    }, [errors])

    return <View className="px-4 pt-10 gap-8 flex-1 bg-white" style={{paddingBottom: bottomPadding}}>
        <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialDesignIcons name="keyboard-backspace" size={30}/>
            </TouchableOpacity>
            <Text className="font-bold text-2xl">Edit Profile</Text>
        </View>

        <View className="p-2 pt-2" style={{ backgroundColor: "#E3FFE2"}}>
            <View className="items-center">
                <View className="border-[10px] border-white rounded-full translate-y-20">
                    <Image source={require("../../assets/not-signed.jpg")} className="rounded-full w-[120px] h-[120px]"/>
                    <View className="absolute right-0 bottom-0 translate-x-[-1] translate-y-[-10] bg-green-600 p-2 rounded-full">
                        <MaterialDesignIcons name="camera" size={20} color="#FFFFFF" />
                    </View>
                </View>
            </View>
        </View>

        <View className="flex-1 pt-10 justify-between h-full">
            <View className="gap-2">
                <View>
                    <Text className="font-bold text-lg">First Name</Text>
                    { isError(errors, 'first_name')
                        ? <Text className="text-xs text-red-500">{getError('first_name')?.text}</Text>
                        : null
                    }
                    <View className="border px-2 py-1 rounded-xl flex-row items-center gap-2"
                        style={{ borderColor: isError(errors, 'first_name') ? "#ef4444" : "#64748b"}}>
                        <TextInput 
                            onChangeText={setFirstName}
                            value={firstName}
                            placeholder="Enter first name..." className="flex-1 w-full"/>
                    </View>
                </View>

                <View>
                    <Text className="font-bold text-lg">Last Name</Text>
                    { isError(errors, 'last_name')
                        ? <Text className="text-xs text-red-500">{getError('last_name')?.text}</Text>
                        : null
                    }
                    <View className="border px-2 py-1 rounded-xl flex-row items-center gap-2"
                        style={{ borderColor: isError(errors, 'last_name') ? "#ef4444" : "#64748b"}}>
                        <TextInput 
                            onChangeText={setLastName}
                            value={lastName}
                            placeholder="Enter last name..." className="flex-1 w-full"/>
                    </View>
                </View>

                <View>
                    <Text className="font-bold text-lg">Email Address</Text>
                    { isError(errors, 'email_address')
                        ? <Text className="text-xs text-red-500">{getError('email_address')?.text}</Text>
                        : null
                    }
                    <View className="border px-2 py-1 rounded-xl flex-row items-center gap-2"
                        style={{ borderColor: isError(errors, 'email_address') ? "#ef4444" : "#64748b"}}>
                        <TextInput 
                            onChangeText={setEmail}
                            value={email}
                            placeholder="Enter email address..." className="flex-1 w-full"/>
                    </View>
                </View>

                <View>
                    <View className="flex-row gap-2">
                        <Text className="font-bold text-lg">Phone Number</Text>
                        <Text className="text-lg text-gray-400">(Optional)</Text>
                    </View>
                    <View className="border px-2 py-1 rounded-xl flex-row items-center gap-2">
                        <TextInput 
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="numeric"
                            className="flex-1 w-full"/>
                    </View>
                </View>
            </View>

            <TouchableOpacity className="bg-green-700 px-8 py-4 rounded-full items-center" onPress={save} disabled={loading || initializing}>
                {loading || initializing ?
                    <ActivityIndicator color="#FFFFFF"/>
                    :
                    <Text className="font-extrabold text-center text-white">Save</Text>
                }
            </TouchableOpacity>
        </View>

    </View>
}

export default EditProfile;
