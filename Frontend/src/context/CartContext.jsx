import { createContext, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, addToCart as addToCartAction, updateQty as updateQtyAction, removeFromCart as removeFromCartAction, clearCart as clearCartAction } from '../redux/slices/cartSlice';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((state) => state.cart);
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

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, cartTotal, clearCart, fetchCart: () => dispatch(fetchCart()) }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
