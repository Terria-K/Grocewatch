import { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ComboBoxItems<T> = {
    label: string,
    id: string,
    data: T
}

type ComboBoxProps<T> = {
    items: ComboBoxItems<T>[],
    selectFirstIndex: number,
    onSelect: (item: ComboBoxItems<T>) => void
}

function ComboBox<T>({ items, selectFirstIndex, onSelect } : ComboBoxProps<T>) {
    const [visible, setVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ComboBoxItems<T> | undefined>(items[selectFirstIndex]);

    return <View style={styles.container}>
        <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
            <Text style={styles.triggerText}>{selectedItem ? selectedItem.label : 'Select an option...'}</Text>
        </TouchableOpacity>

        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity 
                style={styles.modalOverlay}
                onPress={() => setVisible(false)}
                activeOpacity={1}
            >
                <View style={styles.dropdownContainer}>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <TouchableOpacity
                                style={styles.item}
                                onPress={() => {
                                    setSelectedItem(item);
                                    setVisible(false);
                                    onSelect(item);
                                }}>
                                <Text>{item.label}</Text>
                            </TouchableOpacity>
                        }
                    />
                </View>

            </TouchableOpacity>
        </Modal>
    </View>
}

export default ComboBox;

const styles = StyleSheet.create({
    container: {
        margin: 20
    },

    trigger: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        padding: 12,
        borderRadius: 6,
        backgroundColor: "#FFFFFF",
    },

    triggerText: {
        fontSize: 16,
        color: '#333'
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        padding: 20
    },

    dropdownContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        maxHeight: 300,
        padding: 10,
        elevation: 5
    },

    item: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    }
})
