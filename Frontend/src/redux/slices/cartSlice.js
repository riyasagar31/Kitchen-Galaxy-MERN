import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const transform = (items) => (items || []).map(i => ({
    ...i,
    _id: i.product?._id || i.product,
    qty: i.quantity,
    name: i.product?.name || i.title || "Product",
    price: i.product?.price || i.price || 0,
    image: i.product?.image || (i.product?.images && i.product.images[0]) || i.image || (i.images && i.images[0]),
    stock: i.product?.stock === undefined ? i.stock : i.product?.stock
}));

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { getState }) => {
    const { auth } = getState();
    if (!auth.user || auth.user.role !== 'customer') return [];
    const res = await api.get('/cart');
    return transform(res.data.items);
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ product, qty = 1 }) => {
    const res = await api.post('/cart/add', { productId: product._id, quantity: qty });
    return transform(res.data.items);
});

export const updateQty = createAsyncThunk('cart/updateQty', async ({ id, qty }) => {
    if (qty < 1) throw new Error("Quantity must be at least 1");
    const res = await api.patch('/cart/quantity', { productId: id, quantity: qty });
    return transform(res.data.items);
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (id) => {
    const res = await api.delete(`/cart/item/${id}`);
    return transform(res.data.items);
});

export const clearCart = createAsyncThunk('cart/clearCart', async () => {
    await api.delete('/cart/clear');
    return [];
});

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.fulfilled, (state, action) => { state.items = action.payload; })
            .addCase(addToCart.fulfilled, (state, action) => { state.items = action.payload; })
            .addCase(updateQty.fulfilled, (state, action) => { state.items = action.payload; })
            .addCase(removeFromCart.fulfilled, (state, action) => { state.items = action.payload; })
            .addCase(clearCart.fulfilled, (state) => { state.items = []; })
            .addCase('auth/logout', (state) => {
                state.items = [];
                state.error = null;
            });
    }
});

export default cartSlice.reducer;
