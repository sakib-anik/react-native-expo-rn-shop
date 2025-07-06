import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { userCartStore } from '../../store/cart-store';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_URL, MEDIA_URL } from '@env';
const ProductDetails = () => {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const toast = useToast();

    const { items, addItem, incrementItem, decrementItem } = userCartStore();
    
    const cartItem = items.find(item => item.id === product?.id);

    const initialQuantity = cartItem ? cartItem.quantity : 0;

    const [quantity, setQuantity] = useState(initialQuantity);

    useEffect(() => {
        const init = async () => {
            const storedToken = await SecureStore.getItemAsync('accessToken'); // use localStorage for web
            try {
                const response = await fetch(`${API_URL}/get-product-details/${slug}`, {
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
                setProduct(result);
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

    if (!product) return <Redirect href='/404' />




    const increaseQuantity = () => {
        if(quantity < product.maxQuantity) {
            setQuantity(prev => prev + 1);
            incrementItem(product.id);
        } else {
            toast.show('Cannot add more than maximum quantity', {
                type: 'warning',
                placement: 'top',
                duration: 1500
            });
        }
    };
    const decreaseQuantity = () => {
        if(quantity > 1){
            setQuantity(prev => prev - 1);
            decrementItem(product.id);
        }
    };
    const addToCart = () => {
        addItem({
            id: product.id,
            title: product.title,
            heroImage: `${MEDIA_URL}/${product.heroImage}`,
            price: product.price,
            quantity,
            maxQuantity: product.maxQuantity,
        });
        toast.show('Added to cart', {
            type: "success",
            placement: "top",
            duration: 1500
        });
    };
    const totalPrice = (product.price * quantity).toFixed(2);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: product.title }} />
            <Image source={{ uri: `${MEDIA_URL}/${product.heroImage}` }} style={styles.heroImage} />
            <View style={{ padding: 16, flex: 1}}>
                <Text style={styles.title}>Title: {product.title}</Text>
                <Text style={styles.slug}>Slug: {product.slug}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>
                        Unit Price: ${product.price.toFixed(2)}
                    </Text>
                    <Text style={styles.price}>Total Price: ${totalPrice}</Text>
                </View>
                <FlatList
                    data={product.images}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Image source={{ uri: `${MEDIA_URL}/${item.image_url}` }} style={styles.image} />
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imagesContainer}
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={decreaseQuantity}
                        disabled={quantity <= 1}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={increaseQuantity}
                        disabled={quantity >= product.maxQuantity}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.addToCartButton,
                            { opacity: quantity === 0 ? 0.5 : 1 }
                        ]}
                        onPress={addToCart}
                        disabled={quantity === 0}
                    >
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
    }

export default ProductDetails;

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  slug: {
    fontSize: 18,
    color: '#555',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    fontWeight: 'bold',
    color: '#000',
  },

  imagesContainer: {
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  quantityButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorMessage: {
    fontSize: 18,
    color: '#f00',
    textAlign: 'center',
    marginTop: 20,
  },
  loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
  },
});