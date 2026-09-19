import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { TextInput, View } from "react-native";

function SearchBar(props: {
    placeholder: string
}) {
    return (
        <View className="rounded-2xl bg-gray-100 px-4 border-2 border-gray-400 shadow-sm shadow-black elevation-2xl flex-row items-center gap-2 flex-1">
            <MaterialDesignIcons name="magnify" color="#9ca3af"/>
            <TextInput
                placeholderTextColor="#9ca3af"
                className="w-full font-bold"
                placeholder={props.placeholder}/>
        </View>
    );
}

export default SearchBar;
