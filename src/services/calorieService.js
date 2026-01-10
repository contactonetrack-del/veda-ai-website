/**
 * Calorie Service
 * Handles data synchronization with Firebase Firestore
 */
import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'calorie_logs';

/**
 * Add a new food entry to Firestore
 */
export const addLogEntry = async (userId, entry) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const docData = {
            userId,
            foodId: entry.foodId || entry.id,
            name: entry.name,
            nameHi: entry.nameHi || '',
            calories: Number(entry.calories),
            protein: Number(entry.protein || 0),
            carbs: Number(entry.carbs || 0),
            fat: Number(entry.fat || 0),
            quantity: Number(entry.quantity || 1),
            meal: entry.meal,
            date: today,
            timestamp: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
        return { id: docRef.id, ...docData };
    } catch (error) {
        console.error('Error adding log entry:', error);
        throw error;
    }
};

/**
 * Delete a log entry
 */
export const deleteLogEntry = async (entryId) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, entryId));
        return true;
    } catch (error) {
        console.error('Error deleting log entry:', error);
        throw error;
    }
};

/**
 * Subscribe to daily logs for real-time updates
 */
export const subscribeToDailyLogs = (userId, callback) => {
    const today = new Date().toISOString().split('T')[0];

    const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('date', '==', today),
        orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(logs);
    }, (error) => {
        console.error('Error in log subscription:', error);
        // Don't crash auth flow, just log
    });
};
