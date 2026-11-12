import { create } from "zustand";
import { collection, getFirestore } from "@react-native-firebase/firestore";

type ProductState = {
    products: Product[],
    add: (product: Product) => void;
    remove: (productID: string) => void;
}

export type WeeklyPriceEntry = {
    date: string,
    prevailing_price: number,
    lowest_price: number,
    highest_price: number
}

export type Product = {
    productID: string,
    name: string,
    price: number,
    calories: number,
    category: string,
    unit: "pc" | "kg",
    currentPrices: {
        lowest_price: number,
        highest_price: number,
        prevailing_price: number
    },
    priceHistory: WeeklyPriceEntry[]
}



export const useProducts = create<ProductState>((set) => {
    return {
        products: [],
        add: (product) => set((state) => {
            state.products.push(product)
            return {
                products: state.products
            }
        }),
        remove: (id) => set((state) => {
            return {
                products: state.products.filter(item => item.productID !== id)
            }
        })
    }
}) 

export async function loadProduct() {
    try {
        const snapshot = await collection(getFirestore(), 'products').get()

        const prod: Product[] = [];
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data) {
                prod.push(data as Product);
            }
        });

        useProducts.setState({ products: prod })
    }
    catch (err) {
        console.error(err);
    }
}

export const images = {
  alumahan_medium: require("../assets/products/alumahan_medium.jpg"),
  ampalaya: require("../assets/products/ampalaya.jpg"),
  avocado: require("../assets/products/avocado.jpg"),
  banana_lakatan_: require("../assets/products/banana_lakatan.jpg"),
  banana_latundan_: require("../assets/products/banana_latundan.jpg"),
  banana_saba: require("../assets/products/banana_saba.jpg"),
  bangus_large: require("../assets/products/bangus_large.jpg"),
  bangus_medium: require("../assets/products/bangus_medium.jpg"),
  beef_brisket: require("../assets/products/beef_brisket.jpg"),
  beef_rump: require("../assets/products/beef_rump.jpg"),
  bell_pepper__green: require("../assets/products/bell_pepper_green.jpg"),
  bell_pepper__red: require("../assets/products/bell_pepper_red.jpg"),
  bonito: require("../assets/products/bonito.jpg"),
  broccoli: require("../assets/products/broccoli.jpg"),
  cabbage_rare_ball: require("../assets/products/cabbage_rare_ball.jpg"),
  cabbage_scorpio_: require("../assets/products/cabbage_scorpio.jpg"),
  cabbage_wonder_ball_: require("../assets/products/cabbage_wonder_ball.jpg"),
  calamansi: require("../assets/products/calamansi.jpg"),
  carrots: require("../assets/products/carrots.jpg"),
  cauliflower: require("../assets/products/cauliflower.jpg"),
  celery: require("../assets/products/celery.jpg"),
  chayote: require("../assets/products/chayote.jpg"),

  chicken_egg_brown_medium_: require("../assets/products/Chicken_Egg_Brown_Medium.jpg"),
  chicken_egg_white_extra_large_: require("../assets/products/Chicken_Egg_White_Extra_Large.jpg"),
  chicken_egg_white_extra_small_: require("../assets/products/Chicken_Egg_White_Extra_Small.jpg"),
  chicken_egg_white_jumbo_: require("../assets/products/Chicken_Egg_White_Jumbo.jpg"),
  chicken_egg_white_large_: require("../assets/products/Chicken_Egg_White_Large.jpg"),
  chicken_egg_white_pewee_: require("../assets/products/Chicken_Egg_White_Pewee.jpg"),
  chicken_egg_white_small_: require("../assets/products/Chicken_Egg_White_Small.jpg"),
  chicken_egg_white_medium_: require("../assets/products/Chicken_Egg_White_Medium.jpg"),

  chili_red: require("../assets/products/chili_red.jpg"),
  coconut_oil_1_liter: require("../assets/products/coconut_oil_1_liter.jpg"),
  coconut_oil_350ml: require("../assets/products/coconut_oil_350ml.jpg"),
  corn_cracked_yellow_feed_grade: require("../assets/products/corn_cracked_yellow_feed_grade.jpg"),
  corn_grits_feed_grade: require("../assets/products/corn_grits_feed_grade.jpg"),
  corn_grits_white_food_grade: require("../assets/products/corn_grits_white_food_grade.jpg"),
  corn_grits_yellow_food_grade: require("../assets/products/corn_grits_yellow_food_grade.jpg"),
  corn_white: require("../assets/products/corn_white.jpg"),
  corn_yellow: require("../assets/products/corn_yellow.jpg"),
  eggplant: require("../assets/products/eggplant.jpg"),
  frozen_kasim: require("../assets/products/frozen_kasim.jpg"),
  frozen_liempo: require("../assets/products/frozen_liempo_pork_belly.jpg"),
  galunggong_imported_medium: require("../assets/products/galunggong_imported_medium.jpg"),
  galunggong_local_medium: require("../assets/products/galunggong_local_medium.jpg"),
  garlic_imported_: require("../assets/products/garlic_imported.jpg"),
  garlic_native: require("../assets/products/garlic_native.jpg"),
  ginger: require("../assets/products/ginger.jpg"),
  habichuelas_baguio_bean_: require("../assets/products/habichuelas_baguio_bean.png"),
  kalabasa: require("../assets/products/kalabasa.jpg"),
  lettuce_green_ice: require("../assets/products/lettuce_green_ice.jpg"),
  lettuce_iceberg: require("../assets/products/lettuce_iceberg.jpg"),
  lettuce_romaine: require("../assets/products/lettuce_romaine.jpg"),
  mango_carabao_: require("../assets/products/mango_carabao.jpg"),
  melon: require("../assets/products/melon.jpg"),
  mungbean_munggo: require("../assets/products/mungbean_munggo.jpg"),
  papaya: require("../assets/products/papaya.jpg"),
  pechay_baguio_: require("../assets/products/pechay_baguio.jpg"),
  pechay_native_: require("../assets/products/pechay_native.jpg"),
  pineapple: require("../assets/products/pineapple.webp"),
  pomelo: require("../assets/products/pomelo.jpg"),
  pork_belly_liempo_: require("../assets/products/pork_belly_liempo.jpg"),
  pork_ham_kasim_: require("../assets/products/pork_ham_kasim.jpg"),
  red_onion: require("../assets/products/red_onion.jpg"),
  red_onion_imported: require("../assets/products/red_onion_imported.jpg"),
  sayote: require("../assets/products/sayote.jpg"),
  salmon_head: require("../assets/products/salmon_head.jpg"),
  sardines_tamban: require("../assets/products/sardines_tamban.jpg"),
  sitao: require("../assets/products/sitao.jpg"),
  squash_suprema: require("../assets/products/squash_suprema.jpg"),
  squid_pusit_bisaya_medium: require("../assets/products/squid_pusit_bisaya_medium.jpg"),
  sugar_brown: require("../assets/products/sugar_brown.jpg"),
  tilapia_medium: require("../assets/products/tilapia_medium.jpg"),
  tomato: require("../assets/products/tomato.jpg"),
  watermelon: require("../assets/products/watermelon.jpg"),
  white_onion: require("../assets/products/white_onion.jpg"),
  white_onion_imported: require("../assets/products/white_onion_imported.jpg"),
  white_potato: require("../assets/products/white_potato.jpg"),
  whole_chicken: require("../assets/products/whole_chicken.jpg"),
  yellowfin_tuna_tambakol: require("../assets/products/yellowfin_tuna_tambakol.jpg")
};

export type ProductImage = keyof typeof images;
