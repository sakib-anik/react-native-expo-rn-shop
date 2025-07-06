import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';

const API_URL = "http://192.168.10.129:8000/shop";

type AuthData = {
  accessToken: string | null;
  refreshToken: string | null;
  user: any;
  mounting: boolean;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  setRefreshToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
};

const AuthContext = createContext<AuthData>({
  accessToken: null,
  refreshToken: null,
  user: null,
  mounting: true,
  setAccessToken: () => {},
  setRefreshToken: () => {},
  setUser: () => {},
});

export default function AuthProvider({ children }: PropsWithChildren) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [user, setUser] = useState(null);
    const [mounting, setMounting] = useState(true);
    
    useEffect(() => {
        const init = async () => {
            const storedToken = await SecureStore.getItemAsync('accessToken'); // use localStorage for web
            const storedRefreshToken = await SecureStore.getItemAsync('refreshToken'); // use localStorage for web
            if (storedToken) {
                setAccessToken(storedToken);
                setRefreshToken(storedRefreshToken);
                try {
                    const response = await fetch(`${API_URL}/profile/`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${storedToken}`,
                        "Content-Type": "application/json",
                    },
                    });

                    const data = await response.json();

                    if (!response.ok) {
                    throw new Error(data.detail || "Failed to fetch user");
                    }
                    console.log('Tok Tok HHAHA: ', data);
                    setUser(data);
                    console.log('User: ', user);
                } catch (err: any) {
                    console.log("Token error:", err.message);
                    console.log('Stored Token: ', storedToken);
                    console.log('Stored Refresh Token: ', storedRefreshToken);
                    setAccessToken(null);
                    setRefreshToken(null);
                }
            }
            setMounting(false);
        };

        init();
    }, []);

    return <AuthContext.Provider value={{ accessToken, refreshToken, mounting, user, setAccessToken, setRefreshToken, setUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);