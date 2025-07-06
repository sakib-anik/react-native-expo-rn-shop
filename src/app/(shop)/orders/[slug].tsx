import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { FlatList, Image, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { format } from 'date-fns';
import { useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';
import { API_URL, MEDIA_URL } from '@env';
import { useAuth } from "../../../providers/auth-provider";
const OrderDetails = () => {

    const { user } = useAuth(); 

    const {slug} = useLocalSearchParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const storedToken = await SecureStore.getItemAsync('accessToken'); // use localStorage for web
            try {
                const response = await fetch(`${API_URL}/orders/${user.id}/${slug}`, {
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
                setOrder(result);
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

    if (!order) return <Redirect href='/404' />;

    const orderItems = order.items.map((orderItem: any) => {
      return {
        id: orderItem.id,
        title: orderItem.product.title,
        heroImage: orderItem.product.heroImage,
        price: orderItem.product.price,
        quantity: orderItem.quantity,
      };
    });

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: `${order.slug}` }} />
            <Text style={styles.item}>{order.slug}</Text>
            <Text style={styles.details}>{order.description}</Text>
            <View style={[styles.statusBadge, styles[`statusBadge_${order.status}`]]}>
                <Text style={styles.statusText}>
                    {order.status}
                </Text>
            </View>
            <Text style={styles.date}>{format(new Date(order.created_at), 'MMM dd, yyyy')}</Text>
            <Text style={styles.itemsTitle}>Items Ordered:</Text>
            <FlatList
                data={orderItems}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.orderItem}>
                        <Image source={{ uri: `${MEDIA_URL}/${item.heroImage}`}} style={styles.heroImage} />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.title}</Text>
                            <Text style={styles.itemPrice}>Price: ${item.price}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    )
}

export default OrderDetails

const styles: {[key: string]: any} = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  item: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  details: {
    fontSize: 16,
    marginBottom: 16,
  },
  statusBadge: {
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadge_Pending: {
    backgroundColor: 'orange',
  },
  statusBadge_Completed: {
    backgroundColor: 'green',
  },
  statusBadge_Shipped: {
    backgroundColor: 'blue',
  },
  statusBadge_InTransit: {
    backgroundColor: 'purple',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginTop: 16,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  heroImage: {
    width: '50%',
    height: 100,
    borderRadius: 10,
  },
  itemInfo: {},
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    marginTop: 4,
  },
})