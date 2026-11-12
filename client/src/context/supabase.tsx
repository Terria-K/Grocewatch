import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

export type SupabaseContext = {
    supabase: SupabaseClient<any, "public", "public", any, any>
}

type SupabaseProviderProps = {
    children: React.ReactNode
}


const SupabaseContext = createContext({} as SupabaseContext);

export function SupabaseProvider({ children }: SupabaseProviderProps) {



    return (
        <SupabaseContext.Provider value={{ supabase }}>
            {children}
        </SupabaseContext.Provider>
    )
}

export function useSupabase() {
    return useContext(SupabaseContext);
}
