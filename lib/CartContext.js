'use client';
import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existing = state.items.find(item => item.id === action.payload.id);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            }
            return {
                ...state,
                items: [...state.items, { ...action.payload, quantity: 1 }],
            };
        }
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload),
            };
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: Math.max(0, action.payload.quantity) }
                        : item
                ).filter(item => item.quantity > 0),
            };
        case 'SET_INSTRUCTIONS':
            return {
                ...state,
                specialInstructions: action.payload,
            };
        case 'CLEAR_CART':
            return { ...state, items: [], specialInstructions: '', tableNumber: '' };
        case 'SET_TABLE':
            return { ...state, tableNumber: action.payload };
        default:
            return state;
    }
};

const initialState = {
    items: [],
    tableNumber: '',
    specialInstructions: '',
};

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState, () => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cafe-cart');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Never restore tableNumber from localStorage — it should only come from QR scan URL
                return { ...initialState, ...parsed, tableNumber: '' };
            }
        }
        return initialState;
    });

    useEffect(() => {
        // Persist cart but exclude tableNumber — table is session-only via QR scan
        const { tableNumber, ...persistState } = state;
        localStorage.setItem('cafe-cart', JSON.stringify(persistState));
    }, [state]);

    const addItem = useCallback((item) => dispatch({ type: 'ADD_ITEM', payload: item }), []);
    const removeItem = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', payload: id }), []);
    const updateQuantity = useCallback((id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }), []);
    const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
    const setTable = useCallback((table) => dispatch({ type: 'SET_TABLE', payload: table }), []);
    const setInstructions = useCallback((text) => dispatch({ type: 'SET_INSTRUCTIONS', payload: text }), []);

    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items: state.items,
            tableNumber: state.tableNumber,
            specialInstructions: state.specialInstructions,
            totalItems,
            totalPrice,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            setTable,
            setInstructions,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
