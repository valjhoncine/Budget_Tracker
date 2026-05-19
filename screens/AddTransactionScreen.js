import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';

const CATEGORIES = {
  expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Others'],
  income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Others'],
};

export default function AddTransactionScreen() {
  const { user } = useAuth();
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Others');
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (t) => {
    setType(t);
    setCategory('Others');
  };

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert('Error', 'Please enter a title.');
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return Alert.alert('Error', 'Enter a valid amount greater than 0.');
    setLoading(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid,
        title: title.trim(),
        amount: num,
        type,
        category,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setAmount('');
      setCategory('Others');
      Alert.alert('✅ Success', `${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Add Transaction</Text>

        {/* Type Toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'expense' && styles.activeExpense]}
            onPress={() => handleTypeChange('expense')}
          >
            <Text style={[styles.toggleText, type === 'expense' && styles.activeText]}>💸 Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'income' && styles.activeIncome]}
            onPress={() => handleTypeChange('income')}
          >
            <Text style={[styles.toggleText, type === 'income' && styles.activeText]}>💰 Income</Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <Text style={styles.label}>Amount (₱)</Text>
        <TextInput
          style={[styles.input, styles.amountInput]}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder={type === 'expense' ? 'e.g. Grocery, Grab ride...' : 'e.g. Monthly salary...'}
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.categories}>
          {CATEGORIES[type].map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, type === 'income' ? styles.incomeBtn : styles.expenseBtn]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Add {type === 'income' ? 'Income' : 'Expense'}</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  heading: { fontSize: 26, fontWeight: 'bold', color: '#222', marginTop: 52, marginBottom: 24 },
  toggle: {
    flexDirection: 'row', backgroundColor: '#E8E8E8',
    borderRadius: 14, marginBottom: 24, padding: 4,
  },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  activeExpense: { backgroundColor: '#E53935' },
  activeIncome: { backgroundColor: '#2E7D32' },
  toggleText: { color: '#777', fontWeight: '600', fontSize: 14 },
  activeText: { color: '#fff' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 16, marginBottom: 18, borderWidth: 1, borderColor: '#E0E0E0',
  },
  amountInput: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 20, backgroundColor: '#E8E8E8',
  },
  chipActive: { backgroundColor: '#6C63FF' },
  chipText: { color: '#555', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  button: { borderRadius: 14, padding: 18, alignItems: 'center' },
  incomeBtn: { backgroundColor: '#2E7D32' },
  expenseBtn: { backgroundColor: '#E53935' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
