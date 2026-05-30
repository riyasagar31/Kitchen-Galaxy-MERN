import { createContext, useContext, useState } from 'react';

const CartSidebarContext = createContext(null);

export function CartSidebarProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    const openSidebar = () => setIsOpen(true);
    const closeSidebar = () => setIsOpen(false);

    return (
        <CartSidebarContext.Provider value={{ isOpen, openSidebar, closeSidebar }}>
            {children}
        </CartSidebarContext.Provider>
    );
}

export function useCartSidebar() {
    const ctx = useContext(CartSidebarContext);
    if (!ctx) throw new Error('useCartSidebar must be used inside CartSidebarProvider');
    return ctx;
}
