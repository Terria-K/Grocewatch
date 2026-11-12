import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import * as Localization from "react-native-localize";

import en from "./locales/en.json"
import ph from "./locales/ph.json"
import { interpolate } from "react-native-reanimated";

const resources = {
    en: { translation: en },
    ph: { translation: ph }
}

const systemLocale = Localization.getLocales()[0]?.languageCode ?? 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: systemLocale,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    })
