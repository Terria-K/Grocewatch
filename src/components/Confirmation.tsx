import { useCallback, useImperativeHandle } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export type ConfirmationHandle = {
    openDialog: () => void,
    closeDialog: () => void,
    shouldHandleInput: () => boolean,
}

type ConfirmationProps = {
    ref: React.Ref<ConfirmationHandle>,
    children?: React.ReactNode
}

function Confirmation({ ref, children }: ConfirmationProps) {
    const closedScale = 0;
    const openedScale = 1;

    const dialogScale = useSharedValue(closedScale);

    const openDialog = useCallback(() => {
        dialogScale.value = withSpring(openedScale, {
            damping: 50,
            stiffness: 150,
            mass: 0.5
        })
    }, [openedScale]);

    const closeDialog = useCallback(() => {
        dialogScale.value = withSpring(closedScale, {
            damping: 20,
            stiffness: 150,
            mass: 0.5
        })
    }, [closedScale]);

    const shouldHandleInput = () => dialogScale.value > 0.9;

    useImperativeHandle(ref, () => ({
        openDialog,
        closeDialog,
        shouldHandleInput
    }));

    const backdropStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            dialogScale.value,
            [closedScale, openedScale],
            [0, 0.5]
        );

        return {
            opacity,
            display: opacity === 0 ? 'none' : 'flex'
        }
    })

    const contentStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            dialogScale.value,
            [closedScale, openedScale],
            [0, 1]
        );

        return {
            transform: [{ scale: scale }],
            display: scale === 0 ? 'none' : 'flex'
        }
    })

    return <>
        <Animated.View style={[styles.backdrop, backdropStyle, {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }]}>

        </Animated.View>

        <Animated.View style={[styles.container, contentStyle]}>
            <View style={{backgroundColor: 'white', padding: 20, alignItems: 'center', borderRadius: 10, gap: 6}}>
                {children}
            </View>
        </Animated.View>
    </>
}

export default Confirmation;

const styles = StyleSheet.create({
    container: {
        padding: 30,
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    backdrop: {
        top: 0,
        left: 0,
        bottom : 0,
        right: 0,
        position: "absolute"
    }
});
