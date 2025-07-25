import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity, FlatList, Image } from 'react-native';
import { userCartStore } from '../store/cart-store';
import { StatusBar } from 'expo-status-bar';
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import { generateOrderSlug } from '../utils/utils';

type CartItemType = {
    id: number;
    title: string;
    heroImage: string;
    price: number;
    quantity: number;
    maxQuantity: number;
};

type CartItemProps = {
    item: CartItemType;
    onRemove: (id: number) => void;
    onIncrement: (id: number) => void;
    onDecrement: (id: number) => void;
};

const CartItem = ({
    item,
    onDecrement,
    onIncrement,
    onRemove,
}: CartItemProps) => {
    return (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.heroImage }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemPrice}>{item.price.toFixed(2)}</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        onPress={() => onDecrement(item.id)}
                        style={styles.quantityButton}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.itemQuantity}>{item.quantity}</Text>
                    <TouchableOpacity
                        onPress={() => onIncrement(item.id)}
                        style={styles.quantityButton}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => onRemove(item.id)}
                style={styles.removeButton}
            >
                <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function Cart() {
    const { items, removeItem, incrementItem, decrementItem, getTotalPrice, resetCart } = userCartStore();

    const handleCheckout = async () => {
        const totalPrice = parseFloat(getTotalPrice());

        const token = await SecureStore.getItemAsync("accessToken");
        if (!token) return Alert.alert("Unauthorized", "You must be logged in");

        const orderPayload = {
            description: "Mobile order",
            status: "Pending",
            totalPrice: totalPrice,
            items: items.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
            })),
        };

        try {
            const response = await fetch(`${API_URL}/place-order/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderPayload),
            });

            const result = await response.json();
            if (!response.ok) {
                console.log("Order error:", result);
                Alert.alert("Order Failed", result.detail || "Please try again.");
                return;
            }

            Alert.alert("Order Placed", "Your order has been placed successfully.");
            resetCart();
        } catch (err) {
            console.log("Checkout Error:", err);
            Alert.alert("Error", "Something went wrong.");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
            <FlatList 
                data={items} 
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <CartItem 
                        item={item} 
                        onRemove={removeItem} 
                        onIncrement={incrementItem} 
                        onDecrement={decrementItem}
                    />
                )}
                contentContainerStyle={styles.cartList}
            />
            <View style={styles.footer}>
                <Text style={styles.totalText}>Total: ${getTotalPrice()}</Text>
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                    <Text style={styles.checkoutButtonText}>Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  cartList: {
    paddingVertical: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#888',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#ff5252',
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
