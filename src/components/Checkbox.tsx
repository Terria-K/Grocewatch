import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

type CheckboxProps = {
    active: boolean,
    onToggle: (value: boolean) => void
}

function Checkbox({ active, onToggle }: CheckboxProps) {
    const closedScale = 0;
    const openedScale = 1;

    const checkScale = useSharedValue(active ? openedScale : closedScale);

    const onActive = useCallback(() => {
        checkScale.value = withSpring(openedScale, {
            damping: 15,
            stiffness: 200,
            mass: 0.8
        });
    }, [openedScale])

    const onDeactivate = useCallback(() => {
        checkScale.value = withSpring(closedScale, {
            damping: 20,
            stiffness: 200,
            mass: 0.8
        })
    }, [closedScale])

    const pressed = () => {
        onToggle(!active);

        if (active) {
            onDeactivate();
        } else {
            onActive();
        }
    }


    const checkBoxStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            checkScale.value,
            [closedScale, openedScale],
            [0, 1.4]
        )

        return {
            transform: [{ scale }]
        }
    })

    return <Pressable className="justify-center" onPress={pressed}>
        <View className="border border-green-600 rounded-xl overflow-hidden">
            <Animated.View style={checkBoxStyle}>
                <MaterialDesignIcons name="checkbox-marked" size={30} color="#16a34a" />
            </Animated.View>
        </View>
    </Pressable>
}

export default Checkbox;
