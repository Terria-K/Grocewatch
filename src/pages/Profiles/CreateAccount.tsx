import { createUserWithEmailAndPassword, getAuth } from "@react-native-firebase/auth";
import { addDoc, collection, doc, getFirestore, setDoc } from "@react-native-firebase/firestore";
import Lucide from "@react-native-vector-icons/lucide";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { use, useState } from "react";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../../components/NavigationBar";

function CreateAccount() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [loading, setLoading] = useState(false);

    async function createAccount() {
        if (loading) {
            return;
        }

        if (firstName === "") {
            return;
        }

        if (lastName === "") {
            return;
        }

        if (emailAddress === "") {
            return;
        }

        if (password === "") {
            return;
        }

        if (confirmPassword !== password) {
            return;
        }

        setLoading(true);

        const credentials = await createUserWithEmailAndPassword(getAuth(), emailAddress, password);
        const uid = credentials.user.uid;

        const db = getFirestore();
        const userCollection = doc(collection(db, "users"), uid);
        await setDoc(userCollection, {
            firstName: firstName,
            lastName: lastName,
            emailAddress: emailAddress,
            phoneNumber: phoneNumber,
            userid: uid
        });

        setLoading(false);

        navigation.goBack();
    }

    return <View className="px-4 pt-10 gap-3 flex-1">
        <View className="items-center">
            <Image source={require("../../assets/grocewatch_icon.png")} className="w-40 h-40"/>
            <Text className="text-green-700 font-bold">Smarter Groceries. Healthier You.</Text>
        </View>

        <View className="gap-2">
            <View className="gap-2">
                <Text className="font-bold text-2xl text-green-700">Create Your Account</Text>
                <Text>Join Grocewatch and start your smarter grocery journey today!</Text>
            </View>

            <View className="gap-2">
                <View className="border border-slate-500 px-2 py-1 rounded-xl flex-row items-center gap-2">
                    <Lucide name="user-round" size={20}/>
                    <TextInput placeholder="First Name" onChangeText={setFirstName} value={firstName} className="flex-1 w-full"/>
                </View>

                <View className="border border-slate-500 px-2 py-1 rounded-xl flex-row items-center gap-2">
                    <Lucide name="user-round" size={20}/>
                    <TextInput placeholder="Last Name" onChangeText={setLastName} value={lastName} className="flex-1 w-full"/>
                </View>

                <View className="border border-slate-500 px-2 py-1 rounded-xl flex-row items-center gap-2">
                    <MaterialDesignIcons name="email-outline" size={20}/>
                    <TextInput placeholder="Email Address" onChangeText={setEmailAddress} value={emailAddress} className="flex-1 w-full"/>
                </View>

                <View className="border border-slate-500 px-2 py-1 rounded-xl flex-row items-center gap-2">
                    <MaterialDesignIcons name="phone-outline" size={20}/>
                    <TextInput placeholder="Phone Number (Optional)" onChangeText={setPhoneNumber} value={phoneNumber} className="flex-1 w-full"/>
                </View>

                <View className="border border-slate-500 px-2 py-1 rounded-xl flex-row items-center gap-2">
                    <MaterialDesignIcons name="lock-outline" size={20}/>
                    <TextInput 
                    secureTextEntry={true} autoComplete="password" textContentType="password" autoCapitalize="none" autoCorrect={false}
                    placeholder="Password" onChangeText={setPassword} value={password} className="flex-1 w-full"/>
                </View>

                <View className="border border-slate-500 px-2 py-1 rounded-xl flex-row items-center gap-2">
                    <MaterialDesignIcons name="lock-outline" size={20}/>
                    <TextInput 
                    secureTextEntry={true} autoComplete="password" textContentType="password" autoCapitalize="none" autoCorrect={false}
                    placeholder="Confirm Password" onChangeText={setConfirmPassword} value={confirmPassword} className="flex-1 w-full"/>
                </View>

                <View className="gap-3">
                    <TouchableOpacity className="bg-green-700 px-8 py-4 rounded-full items-center" onPress={createAccount}>
                        {loading ?
                            <ActivityIndicator color="#FFFFFF"/>
                            :
                            <Text className="font-extrabold text-center text-white">Sign Up</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity className="border border-slate-500 bg-white px-8 py-4 rounded-full">
                        <Text className="font-semibold text-center text-black">Continue With Google</Text>
                    </TouchableOpacity>

                    <View className="flex-row gap-2 justify-center">
                        <Text>Already have an account? </Text>
                        <TouchableOpacity>
                            <Text>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </View>
    </View>
}

export default CreateAccount;
