import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Link, Stack, Redirect } from "expo-router";
import { useState, useCallback, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_URL, MEDIA_URL } from '@env';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useAuth } from "../../../providers/auth-provider";

const renderItem = ({ item }) => (
    <Link href={`/orders/${item.slug}`} asChild>
        <Pressable style={styles.orderContainer}>
            <View style={styles.orderContent}>
                <View style={styles.orderDetailsContainer}>
                    <Text style={styles.orderItem}>{item.slug}</Text>
                    <Text style={styles.orderDetails}>{item.description}</Text>
                    <Text style={styles.orderDate}>{format(new Date(item.created_at), 'MMM dd, yyyy')}</Text>
                </View>
                <View style={[styles.statusBadge, styles[`statusBadge_${item.status}`]]}>
                    <Text style={styles.statusText}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
        </Pressable>
    </Link>
)

const Orders = () => {
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(true);
    const ws = useRef<WebSocket | null>(null);
    useFocusEffect(
      useCallback(() => {
        let isActive = true;

        const fetchOrders = async () => {
          const token = await SecureStore.getItemAsync('accessToken');
          try {
            const res = await fetch(`${API_URL}/orders/`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            const data = await res.json();
            if (res.ok && isActive) {
              setOrders(data);
            }
          } catch (err) {
            console.error("Error fetching orders:", err.message);
          } finally {
            if (isActive) setLoading(false);
          }
        };

        fetchOrders();

        return () => {
          isActive = false;
        };
      }, [])
    );

    // 👇 Add WebSocket listener after orders are loaded
    const { user } = useAuth();
    useEffect(() => {
      const setupWebSocket = async () => {
        
        if (!user) return;
        
        const host = Constants.expoConfig?.hostUri?.split(':')[0] || '127.0.0.1';

        ws.current = new WebSocket(`ws://${host}:8000/ws/orders/${user.id}/`);

        ws.current.onopen = () => {
          console.log("✅ WebSocket connected");
        };

        ws.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("📡 Order update:", data);

          // Update the order in state
          setOrders((prev) =>
            prev?.map((order) =>
              order.id === data.order_id
                ? { ...order, status: data.status }
                : order
            )
          );
        };

        ws.current.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
        };

        ws.current.onclose = () => {
          console.log("❎ WebSocket disconnected");
        };
      };

      setupWebSocket();

      return () => {
        ws.current?.close();
      };
    }, []);

    if (loading) {
        return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
        </View>
        );
    }

    if (!orders.length) return (
      <Text
        style={{
          fontSize: 16,
          color: '#555',
          textAlign: 'center',
          padding: 10
        }}
      >
        No orders created yet
      </Text>
    )

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Orders' }} />
            <FlatList 
                data={orders} 
                keyExtractor={item => item.id.toString()} 
                renderItem={renderItem}
            />
        </View>
    );
    }

export default Orders;

const styles: { [key: string]: any } = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  orderContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  orderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDetailsContainer: {
    flex: 1,
  },
  orderItem: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderDetails: {
    fontSize: 14,
    color: '#555',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge_Pending: {
    backgroundColor: '#ffcc00',
  },
  statusBadge_Completed: {
    backgroundColor: '#4caf50',
  },
  statusBadge_Shipped: {
    backgroundColor: '#2196f3',
  },
  statusBadge_InTransit: {
    backgroundColor: '#ff9800',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});