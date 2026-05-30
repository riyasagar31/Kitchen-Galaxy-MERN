import { createContext, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCart,
  addToCart as addToCartAction,
  updateQty as updateQtyAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction
} from '../redux/slices/cartSlice';

const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const dispatch = useDispatch();
  const { items: cartItems, loading: cartLoading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && user.role === 'customer') {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  const addToCart = async (product, qty = 1) => {
    const result = await dispatch(addToCartAction({ product, qty }));
    return result.payload;
  };

  const updateQty = (id, qty) => {
    if (qty < 1) {
      dispatch(removeFromCartAction(id));
    } else {
      dispatch(updateQtyAction({ id, qty }));
    }
  };

  const removeFromCart = (id) => {
    dispatch(removeFromCartAction(id));
  };

  const clearCart = useCallback(() => {
    dispatch(clearCartAction());
  }, [dispatch]);

  /* ===============================
      GST CALCULATION
  =============================== */

  const subtotal = cartItems.reduce((acc, item) => {
    return acc + item.price * item.qty;
  }, 0);

  // Group GST by rate slab (e.g., 12%, 18%)
  // For each unique gstRate: { rate, baseAmount, gstAmount, cgst, sgst }
  const gstBreakdown = Object.values(
    cartItems.reduce((acc, item) => {
      const rate = item.gstRate || 18;
      if (!acc[rate]) {
        acc[rate] = { rate, baseAmount: 0, gstAmount: 0 };
      }
      const itemBase = item.price * item.qty;
      const itemGst = (item.price * rate / 100) * item.qty;
      acc[rate].baseAmount += itemBase;
      acc[rate].gstAmount += itemGst;
      return acc;
    }, {})
  ).sort((a, b) => a.rate - b.rate);

  const totalGst = gstBreakdown.reduce((acc, slab) => acc + slab.gstAmount, 0);

  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  const grandTotal = subtotal + totalGst;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        subtotal,
        totalGst,
        cgst,
        sgst,
        grandTotal,
        gstBreakdown,
        cartLoading,
        clearCart,
        fetchCart: () => dispatch(fetchCart())
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);