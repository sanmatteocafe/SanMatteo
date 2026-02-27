'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db } from '@/firebase/config';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile,
    signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                try {
                    const profileDoc = await getDoc(doc(db, 'users', user.uid));
                    if (profileDoc.exists()) {
                        setUserProfile({ ...profileDoc.data(), uid: user.uid });
                    } else {
                        setUserProfile({
                            uid: user.uid,
                            name: user.displayName || '',
                            email: user.email || '',
                            role: 'user',
                        });
                    }
                } catch (e) {
                    console.error('Error loading user profile:', e);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email, password, profileData) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: profileData.name });
        const profile = {
            name: profileData.name,
            email: email,
            phone: profileData.phone || '',
            role: 'user',
            createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), profile);
        setUserProfile({ ...profile, uid: cred.user.uid });
        return cred;
    };

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const profileDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!profileDoc.exists()) {
            const profileData = {
                name: result.user.displayName || '',
                email: result.user.email || '',
                phone: result.user.phoneNumber || '',
                role: 'user',
                createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', result.user.uid), profileData);
            setUserProfile({ ...profileData, uid: result.user.uid });
        } else {
            setUserProfile({ ...profileDoc.data(), uid: result.user.uid });
        }
        return result;
    };

    const resetPassword = async (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const logout = async () => {
        setUserProfile(null);
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{
            user,
            userProfile,
            loading,
            login,
            signup,
            loginWithGoogle,
            resetPassword,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
