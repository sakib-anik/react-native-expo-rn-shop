import { Pressable, Image, StyleSheet, Text, View } from "react-native";
import { Product } from "../../assets/types/product";
import { Link } from "expo-router";
export const ProductListItem = ({ product }: {product: Product}) => {
    return (
        <Link href={`/product/${product.slug}`} asChild>
            <Pressable style={styles.item}>
                <View style={styles.itemImageContainer}>
                    <Image 
                        source={product.heroImage}
                        style={styles.itemImage}
                    />
                </View>
                <View style={styles.itemTextContainer}>
                    <Text style={styles.itemTitle}>{product.title}</Text>
                    <Text style={styles.itemPrice}>${product.price.toFixed(2)}</Text>
                </View>
            </Pressable>
        </Link>
    );
    }


const styles = StyleSheet.create({
    item: {
        width: '48%',
        backgroundColor: '#fff',
        marginVertical: 8,
        borderRadius: 10,
        overflow: 'hidden',
    },
    itemImageContainer: {
        width: '100%',
        height: 150,
        borderRadius: 10,
    },
    itemImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    itemTextContainer: {
        padding: 8,
        alignItems: 'flex-start',
        gap: 4,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});