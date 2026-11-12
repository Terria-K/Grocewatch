import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useCallback, useImperativeHandle } from "react";
import { Pressable, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

type CheckboxProps = {
    active: boolean,
    onToggle: (value: boolean) => void,
    size: number,
    ref?: React.Ref<CheckboxHandle>
}

export type CheckboxHandle = {
    activate: () => void,
    deactivate: () => void,
}

function Checkbox({ active, onToggle, ref, size = 30 }: CheckboxProps) {
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

    useImperativeHandle(ref, () => ({
        activate: onActive,
        deactivate: onDeactivate
    }));


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

    return <Pressable className="justify-center" onPress={pressed} style={{
        width: size + 2,
        height: size + 2
    }}>
        <View className="border border-green-600 rounded-lg overflow-hidden bg-white">
            <Animated.View style={checkBoxStyle}>
                <MaterialDesignIcons name="checkbox-marked" size={size} color="#16a34a" />
            </Animated.View>
        </View>
    </Pressable>
}

export default Checkbox;
