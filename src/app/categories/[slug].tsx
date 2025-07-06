import { FlatList, Image, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { ProductListItem } from "../../components/product-list-item";
import { API_URL, MEDIA_URL } from '@env';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
const Category = () => {
    const { slug } = useLocalSearchParams<{ slug: string }>();

    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const storedToken = await SecureStore.getItemAsync('accessToken'); // use localStorage for web
            try {
                const response = await fetch(`${API_URL}/get-category-and-products/${slug}`, {
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
                setCategory(result);
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

    if(!category) return <Redirect href="/404" />;
    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: category.name,
                }}
            />
            <Image
                source={{ uri: `${MEDIA_URL}/${category.imageUrl}` }}
                style={styles.categoryImage}
            />
            <Text style={styles.categoryName}>{category.name}</Text>
            <FlatList
                data={category.products}
                renderItem={({ item }) => (
                    <ProductListItem product={item} />
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.productList}
                columnWrapperStyle={styles.productRow}
            />
        </View>
    );
}

export default Category;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    categoryImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
        resizeMode: 'cover',
    },
    categoryName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    productList: {
        flexGrow: 1,
    },
    productRow: {
        justifyContent: 'space-between',
    },
    productContainer: {
        flex: 1,
        margin: 8,
    },
    productImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    productTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
    },
    productPrice: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});