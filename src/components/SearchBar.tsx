import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { StyleSheet, TextInput, View } from "react-native";

function SearchBar(props: {
    placeholder: string
}) {
    return (
        <View style={styles.container}>
            <MaterialDesignIcons name="magnify" color="#9ca3af"/>
            <TextInput
                style={styles.textInput}
                placeholderTextColor="#9ca3af"
                placeholder={props.placeholder}/>
        </View>
    );
}

export default SearchBar;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 8,
        flex: 1,
        borderRadius: 16,
        backgroundColor: "#f3f4f6",
        paddingLeft: 16,
        paddingRight: 16,
        borderWidth: 2,
        borderColor: '#9ca3af',
        elevation: 24,
        flexDirection: 'row',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
    },

    textInput: {
        width: '100%',
        fontWeight: 700
    }
})
