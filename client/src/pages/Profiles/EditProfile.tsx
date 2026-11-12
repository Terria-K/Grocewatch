import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { ActivityIndicator, Image, Modal, PermissionsAndroid, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../../components/NavigationBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "@react-native-firebase/auth";
import { collection, doc, getDoc, getFirestore, updateDoc } from "@react-native-firebase/firestore";
import { generateColorFromText } from "../../utils/utils";
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ulid } from "react-native-ulid-jsi";
import RNFetchBlob from 'react-native-blob-util';
import { useSupabase } from "../../context/supabase";
import { createClient } from "@supabase/supabase-js";

type ErrorLocation = 'first_name' | 'last_name' | 'email_address';

type ErrorType = {
    location: ErrorLocation,
    text: string
}



function EditProfile() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [sheetVisible, setSheetVisible] = useState(false);
    const [errors, setErrors] = useState<ErrorType[]>([]);
    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState<User | undefined>();
    const [initializing, setInitializing] = useState(true);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [imageUrl, setImageUrl] = useState('');
    const [changedImage, setChangedImage] = useState(false);
    //const supabaseUrl = 'https://hfdixncitukkdimupxrp.supabase.co';
    //const supabaseAnonKey = 'sb_publishable_hzGZHudpJDe3i96favXEMA_YXfPmIx6';
    //const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
                setImageUrl(docUser.get("imageUrl") ?? '');

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
            emailAddress: email,
            imageUrl: imageUrl
        });

        if (changedImage) {
            //const image = await readImageWithFormat(imageUrl);
            //const { data, error } = await supabase.storage.from("profiles").upload(ulid() + ".png", image.bytes, {
            //    contentType: 'image/jpeg',
            //    upsert: false
            //})
            //
            //if (error) {
            //    throw error;
            //}

            setChangedImage(false);
        }



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

    async function requestCameraPermission() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Camera Permission",
                    message: "An app needs camera permission to take pictures.",
                    buttonNegative: "Cancel",
                    buttonPositive: "Ok"
                }
            )

            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async function handleImageResponse(response: ImagePickerResponse) {
        if (response.didCancel) {
            console.log("User cancelled image picker");
        } else if (response.errorCode) {
            console.error("Image Picker error: ", response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
            const uri = response.assets[0].uri;
            if (uri) {
                setImageUrl(uri);
                setChangedImage(true);
            }
        }
    }

    async function openCamera() {
        setSheetVisible(false);
        const hasPermission = await requestCameraPermission();

        if (!hasPermission) { return; }

        launchCamera({ maxWidth: 2000, maxHeight: 2000, includeBase64: false, mediaType: 'photo'}, handleImageResponse)
    }

    async function openGallery() {
        setSheetVisible(false);
        launchImageLibrary({
            mediaType: 'photo', includeBase64: false
        }, handleImageResponse)
    }

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
                    <TouchableOpacity className="rounded-full p-3 w-40 h-40 justify-center items-center" 
                        onPress={() => setSheetVisible(true)}
                        style={imageUrl === '' ? {
                            backgroundColor: generateColorFromText(firstName + lastName)
                        } : null}>
                        {
                            imageUrl === ''
                                ? <Text className="font-bold text-[50px]">{firstName[0] + (lastName[0] ?? "")}</Text>
                                : <Image className="w-40 h-40 rounded-full" source={{ uri: imageUrl }}/>
                        }
                    </TouchableOpacity>
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

        <Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={() => setSheetVisible(false)}>
            <Pressable 
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)'}}
                className="flex-1 justify-end"
                onPress={() => setSheetVisible(false)}>

                <Pressable className="bg-white rounded-r-2xl rounded-l-2xl py-5" onPress={() => {}}>
                    <View/>

                    <Text className="text-xl font-semibold text-center mb-8">Choose Photo Source</Text>

                    <TouchableOpacity className="py-4 border-b border-slate-300" onPress={openCamera}>
                      <Text className="text-lg font-bold text-center">Take a Photo (Camera)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="py-4" onPress={openGallery}>
                      <Text className="text-lg font-bold text-center">Choose from Gallery</Text>
                    </TouchableOpacity>
                </Pressable>

            </Pressable>
        </Modal>
    </View>
}

export default EditProfile;
