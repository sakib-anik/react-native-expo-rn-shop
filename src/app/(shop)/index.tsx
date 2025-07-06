import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import {ProductListItem} from '../../components/product-list-item';
import { ListHeader } from '../../components/list-header';
import { useAuth } from '../../providers/auth-provider';
import { useEffect, useState } from 'react';
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
const Home = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const init = async () => {
            const storedToken = await SecureStore.getItemAsync('accessToken'); // use localStorage for web
            try {
                const response = await fetch(`${API_URL}/get-products-and-categories/`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${storedToken}`,
                        "Content-Type": "application/json",
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                throw new Error(result.detail || "Failed to fetch user");
                }
                setData(result);
            } catch (err: any) {
                console.log("Token error:", err.message);
            } finally {
                setLoading(false); // stop spinner either way
            }
        };

        init();
    }, []);

    if (loading) {
        return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
        </View>
        );
    }

    if (!data) {
        return (
        <View style={styles.loaderContainer}>
            <Text>Error loading data</Text>
        </View>
        );
    }
    return ( 
    // <Auth />
        <View>
            <FlatList 
                data={data.products} 
                renderItem={({ item }) => (
                    <ProductListItem product={item} />
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                ListHeaderComponent={<ListHeader categories={data.categories} />}
                contentContainerStyle={styles.flatListContent}
                columnWrapperStyle={styles.flatListColumn}
                style={{ paddingHorizontal: 10, paddingVertical: 5 }}
            />
         </View>
    );
}

export default Home;

const styles = StyleSheet.create({
    flatListContent: {
        paddingBottom: 20,
    },
    flatListColumn: {
        justifyContent: 'space-between',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});