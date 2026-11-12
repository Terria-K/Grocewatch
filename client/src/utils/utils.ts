export function generateColorFromText(name: string) {
    let hash = 0;

    for (let i = 0; i < name.length; i += 1) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);

    const saturation = 65 / 100;
    const lightness = 55 / 100;

    const alpha = saturation * Math.min(lightness, 1 - lightness);
    const hslToRGB = (n: number) => {
        const k = (n + hue / 30) % 12;
        const color = lightness - alpha * Math.max(Math.min(k - 3, 9 - k, 1), -1);

        return Math.round(255 * color).toString(16).padStart(2, '0');
    }

    return `#${hslToRGB(0)}${hslToRGB(4)}${hslToRGB(8)}`;
}



export function makeNameFirstCharacterUppercase(name: string) {
    return name[0].toUpperCase() + name.substring(1)
}
