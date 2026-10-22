import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import NavigationBar, { RootStackParamList } from "../../components/NavigationBar";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import Lucide from "@react-native-vector-icons/lucide";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5/static";
import HorizontalSeparator from "../../components/HorizontalSeparator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getAuth, onAuthStateChanged, signOut, User } from '@react-native-firebase/auth';
import { fetchUser, useUser } from "../../context/user";
import { useEffect, useState } from "react";
import LeafIcon from "../../assets/fluent_leaf_icon.svg";
import { collection, doc, getDoc, getFirestore } from "@react-native-firebase/firestore";

type ProfileButtonProps = {
    title: string,
    description: string,
    children: React.ReactNode,
    onPress?: () => void
}

function ProfileButton({ title, description, children, onPress }: ProfileButtonProps) {
    return <>
        <TouchableOpacity className="flex-row justify-between items-center" onPress={onPress}>
            <View className="flex-row items-center gap-2">
                <View className="rounded-full w-12 h-12 justify-center items-center" style={{ backgroundColor: "#CCFFCA" }}>
                    {children}
                </View>

                <View>
                    <Text className="font-bold">{title}</Text>
                    <Text className="text-sm text-gray-500">{description}</Text>
                </View>
            </View>

            <MaterialDesignIcons name="chevron-right" size={30}/>
        </TouchableOpacity>

        <HorizontalSeparator gap={8}/>
    </>
}

function Profiles() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const user = useUser();
    const insets = useSafeAreaInsets();

    const bottomPadding = 75 + (insets.bottom > 0 ? insets.bottom : 16);
    const [loading, setLoading] = useState(true);

    const [actualUser, setActualUser] = useState<User | null>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        fetchUser().then((data) => {
            if (data) {
                user.set(data.listCreated, data.productsTracked);
            }

            setLoading(false)
        })
    }, [])

    useEffect(() => {
        const subscriber = onAuthStateChanged(getAuth(), async (user) => {
            if (user) {
                setActualUser(user);

                const userDoc = await getDoc(doc(collection(getFirestore(), "users"), user.uid));
                const firstName = userDoc.get("firstName");
                const lastName = userDoc.get("lastName");
                setName(firstName + " " + lastName);

                setEmail(userDoc.get("emailAddress"));
            }
        });

        return subscriber;
    }, []);

    async function logOut() {
        await signOut(getAuth());
    }

    return <>
            <View style={{flex: 1, paddingBottom: bottomPadding}}>
                <ScrollView contentContainerClassName="gap-4" className="bg-white" showsVerticalScrollIndicator={false}>
                    <View className="p-2 pt-20" style={{ backgroundColor: "#E3FFE2"}}>
                        {actualUser ? <View className="px-8 py-6">
                                <View className="flex-row">
                                    <View>
                                        <FontAwesome5 name="user-circle" iconStyle="solid" size={30}/>
                                    </View>
                                    <View>
                                        <Text className="font-bold text-xl">{name}</Text>
                                        <Text className="text-lg">{email}</Text>
                                    </View>
                                </View>

                                <View className="flex-row">
                                    <View className="flex-row items-center rounded-full p-2" style={{ backgroundColor: "#3FFD355E"}}>
                                        <MaterialDesignIcons name="leaf" size={20} color="#077E01"/>
                                        <Text style={{color: "#077E01"}} className="font-bold">Grocery Planner</Text>
                                    </View>
                                </View>
                            </View>
                            : 
                            <View className="justify-center px-8 gap-4">
                                <View className="items-center">
                                    <View className="border-2 border-green-600 rounded-full">
                                        <Image source={require("../../assets/not-signed.jpg")} className="rounded-full w-[120px] h-[120px]"/>
                                        <View className="absolute right-0 bottom-0 translate-x-[-1] translate-y-[-10] bg-green-600 p-2 rounded-full">
                                            <Lucide name="leaf" size={20} color="#FFFFFF"/>
                                        </View>
                                    </View>
                                </View>

                                <View>
                                    <Text className="font-bold text-center text-2xl">Welcome to Grocewatch</Text>
                                    <Text className="text-center">Sign in to personalize your experience.</Text>
                                </View>

                                <View className="gap-2">
                                    <TouchableOpacity className="flex-1 bg-green-600 px-8 py-3 rounded-2xl" onPress={() => navigation.navigate("Login")}>
                                        <Text className="font-extrabold text-center text-white">Sign In</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity className="flex-1 border border-green-600 px-8 py-3 rounded-2xl" onPress={
                                        () => navigation.navigate("CreateAccount")}>
                                        <Text className="font-extrabold text-center">Create Account</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        }
                    </View>

                    {
                        !actualUser 
                        ?
                            <View className="mx-2 p-4 flex-row rounded-xl gap-2 items-center" style={{ backgroundColor: "#CCFFCA"}}>
                                <View className="bg-green-300 p-3 rounded-full">
                                    <LeafIcon color="#22c55e"/>
                                </View>

                                <View className="flex-1">
                                    <Text className="text-sm">Track your food, plan your meals, and stay on top of your nutrition.</Text>
                                </View>
                            </View>
                        :
                            <View className="mx-10 p-6 flex-row justify-between rounded-xl" style={{ backgroundColor: "#CCFFCA"}}>
                                <View className="flex-1 items-center">
                                    <MaterialDesignIcons name="list-box-outline" size={28}/>
                                    <Text className="font-bold text-lg">{loading ? <ActivityIndicator size="small" color="#000000" /> : user.listCreated}</Text>
                                    <Text className="text-gray-600">List Created</Text>
                                </View>

                                <View className="w-[1px] h-full bg-gray-400 mx-3 rounded-xl translate-x-[-8] translate-y-1"/>

                                <View className="flex-2 items-center">
                                    <Lucide name="shopping-cart" size={28}/>
                                    <Text className="font-bold text-lg">{loading ? <ActivityIndicator size="small" color="#000000" /> : user.productsTracked}</Text>
                                    <Text className="text-gray-600">Products Tracked</Text>
                                </View>
                            </View>
                    }



                    <View className="mx-2 p-4 pt-2 border border-slate-400 rounded-xl justify-center">
                        {
                            actualUser ?
                                <>
                                <ProfileButton title="Account Information" description="Update your personal details">
                                    <FontAwesome5 name="user" iconStyle="solid" size={24}/>
                                </ProfileButton>

                                <ProfileButton title="Privacy & Security" description="Manage your account security">
                                    <FontAwesome5 name="shield-alt" iconStyle="solid" size={24}/>
                                </ProfileButton>
                                <ProfileButton 
                                    title="Notifications" description="Get notified about your groceries" 
                                    onPress={() => navigation.navigate("Notifications")}>
                                    <MaterialDesignIcons name="bell" size={24}/>
                                </ProfileButton>
                                </>
                            : null
                        }




                        <ProfileButton title="Appearance" description="Customize your app theme">
                            <MaterialDesignIcons name="palette" size={24}/>
                        </ProfileButton>

                        <ProfileButton title="Download AI Model" description="2.5 GB">
                            <MaterialDesignIcons name="download" size={24}/>
                        </ProfileButton>

                        <ProfileButton title="Help & Support" description="FAQ and contact us">
                            <MaterialDesignIcons name="help-circle" size={24}/>
                        </ProfileButton>

                        <ProfileButton title="About Grocewatch" description="Learn more about our app">
                            <MaterialDesignIcons name="information" size={24}/>
                        </ProfileButton>
                    </View>

                    {actualUser
                        ? <View className="pb-5">
                            <TouchableOpacity className="mx-2 p-4 bg-green-200 rounded-xl flex-row items-center justify-between" 
                                onPress={logOut}>
                                <View className="items-center flex-row gap-2">
                                    <MaterialDesignIcons name="logout" size={20}/>
                                    <Text className="font-bold">Log Out</Text>
                                </View>

                                <View>
                                    <MaterialDesignIcons name="chevron-right" size={28}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                        : null
                    }

                </ScrollView>
            </View>

            <NavigationBar currentRoute="Profile"/>
        </>
}

export default Profiles;
