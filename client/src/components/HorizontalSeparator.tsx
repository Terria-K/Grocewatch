import { StyleSheet, View } from "react-native";

type HorizontalSeparatorProps = {
    gap: number
}

function HorizontalSeparator({ gap }: HorizontalSeparatorProps) {
    return <View style={[sepStyles.separator, {marginVertical: gap}]}/>
}


const sepStyles = StyleSheet.create({
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#CCCCCC',
  },
});

export default HorizontalSeparator;
