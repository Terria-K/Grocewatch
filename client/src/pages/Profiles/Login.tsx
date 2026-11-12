import { getAuth, GoogleAuthProvider, linkWithCredential, signInWithCredential, signInWithEmailAndPassword } from "@react-native-firebase/auth";
import Lucide from "@react-native-vector-icons/lucide";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../../components/NavigationBar";
import { GoogleOneTapSignIn, isNoSavedCredentialFoundResponse, isSuccessResponse } from "react-native-nitro-google-signin";
import { collection, doc, getFirestore, setDoc } from "@react-native-firebase/firestore";
import Google from "../../assets/google.svg";

function Login() {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined)
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    async function loginIn() {
        const cleanEmailOrPhone = emailOrPhone.trim();
        if (cleanEmailOrPhone === "") {
            return;
        }

        if (password === "") {
            return;
        }

        setLoading(true);

        try {
            await signInWithEmailAndPassword(getAuth(), cleanEmailOrPhone, password);
        }
        catch (err: any) {
            if (err.code === 'auth/invalid-credential') {
                setError("Invalid Email or Password");
            }

            else if (err.code === 'auth/invalid-email') {
                setError("Invalid Email");
            }

            console.error(err);

            return;
        }
        finally {
            setLoading(false);
        }

        navigation.goBack();
    }

    async function loginOrCreateWithGoogle() {
        await GoogleOneTapSignIn.checkPlayServices();

        await GoogleOneTapSignIn.signOut();

        let response = await GoogleOneTapSignIn.signIn();

        if (isNoSavedCredentialFoundResponse(response)) {
            response = await GoogleOneTapSignIn.createAccount();
        }

        if (isNoSavedCredentialFoundResponse(response)) {
            response = await GoogleOneTapSignIn.presentExplicitSignIn();
        }

        if (isSuccessResponse(response)) {
            const { user, idToken } = response.data;
            const firstName = user.givenName;
            const lastName = user.familyName;
            const email = user.email;

            const creds = GoogleAuthProvider.credential(idToken);

            let credentials = await signInWithCredential(getAuth(), creds);

            const uid = credentials.user.uid;
            const db = getFirestore();
            const userCollection = doc(collection(db, "users"), uid);
            await setDoc(userCollection, {
                firstName: firstName,
                lastName: lastName ?? "",
                emailAddress: email,
                phoneNumber: "",
                userid: uid
            });

            navigation.goBack();
        }
    }

    useEffect(() => {
        GoogleOneTapSignIn.configure({
          webClientId: 'autoDetect',
          offlineAccess: true,
        });
    }, []);

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
                {
                    error ? <Text className="font-bold text-red-500">{error}</Text> : null
                }
                <View className="border px-2 py-1 rounded-xl flex-row items-center gap-2"
                    style={{ borderColor: error ? "#ef4444" : "#64748b"}}>
                    <Lucide name="user-round" size={20}/>
                    <TextInput 
                        placeholder="Email" onChangeText={setEmailOrPhone} value={emailOrPhone} className="flex-1 w-full"/>
                </View>

                <View className="border px-2 py-1 rounded-xl flex-row items-center gap-2"
                style={{ borderColor: error ? "#ef4444" : "#64748b"}}>
                    <MaterialDesignIcons name="lock-outline" size={20}/>
                    <TextInput 
                        secureTextEntry={true} 
                        autoComplete="password" 
                        textContentType="password" 
                        autoCapitalize="none" 
                        autoCorrect={false} 
                        placeholder="Password" 
                        onChangeText={setPassword} 
                        value={password} 
                        className="flex-1 w-full"/>
                </View>

                <View className="gap-3">
                    <TouchableOpacity className="bg-green-700 px-8 py-4 rounded-full items-center" onPress={loginIn}>
                        {loading ?
                            <ActivityIndicator color="#FFFFFF"/>
                            :
                            <Text className="font-extrabold text-center text-white">Sign In</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity className="border border-slate-500 bg-white px-8 py-4 rounded-full flex-row justify-center gap-3" onPress={loginOrCreateWithGoogle}>
                        <Google width={20} height={20} fill="transparent" color="white" />
                        <Text className="font-semibold text-center text-black">Continue With Google</Text>
                    </TouchableOpacity>

                    <View className="flex-row gap-2 justify-center">
                        <Text>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => {
                            navigation.popTo("CreateAccount");
                        }}>
                            <Text className="text-green-700">Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </View>
    </View>
}

export default Login;
