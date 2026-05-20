import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;
  }, [user]);
  if (!user) return null;

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>₱{balance.toFixed(2)}</Text>
        <Text style={styles.balanceSub}>{transactions.length} transactions total</Text>
      </View>

      {/* Income & Expense */}
      <View style={styles.row}>
        <View style={[styles.miniCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.miniIcon}>💰</Text>
          <Text style={styles.miniLabel}>Income</Text>
          <Text style={[styles.miniAmount, { color: '#2E7D32' }]}>₱{income.toFixed(2)}</Text>
        </View>
        <View style={[styles.miniCard, { backgroundColor: '#FFEBEE' }]}>
          <Text style={styles.miniIcon}>💸</Text>
          <Text style={styles.miniLabel}>Expense</Text>
          <Text style={[styles.miniAmount, { color: '#C62828' }]}>₱{expense.toFixed(2)}</Text>
        </View>
      </View>

      {/* Recent Transactions */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {transactions.length === 0 ? (
        <Text style={styles.empty}>No transactions yet. Add one!</Text>
      ) : (
        transactions.slice(0, 5).map(t => (
          <View key={t.id} style={styles.txItem}>
            <View style={[styles.txIcon, {
              backgroundColor: t.type === 'income' ? '#E8F5E9' : '#FFEBEE'
            }]}>
              <Text style={{ fontSize: 18 }}>{t.type === 'income' ? '📈' : '📉'}</Text>
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>{t.title}</Text>
              <Text style={styles.txMeta}>{t.category}</Text>
            </View>
            <Text style={[styles.txAmount,
            t.type === 'income' ? styles.incomeText : styles.expenseText]}>
              {t.type === 'income' ? '+' : '-'}₱{t.amount.toFixed(2)}
            </Text>
          </View>
        ))
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingHorizontal: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 52, marginBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  email: { color: '#888', fontSize: 12, marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#EDE9FF', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20,
  },
  logoutText: { color: '#6C63FF', fontWeight: '600', fontSize: 13 },
  balanceCard: {
    backgroundColor: '#6C63FF', borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16, elevation: 4,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  balanceAmount: { color: '#fff', fontSize: 40, fontWeight: 'bold', marginVertical: 6 },
  balanceSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  miniCard: { flex: 1, borderRadius: 16, padding: 16 },
  miniIcon: { fontSize: 22, marginBottom: 6 },
  miniLabel: { color: '#555', fontSize: 13 },
  miniAmount: { fontWeight: 'bold', fontSize: 18, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 12 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 20 },
  txItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1,
  },
  txIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txTitle: { fontWeight: '600', color: '#333', fontSize: 15 },
  txMeta: { color: '#aaa', fontSize: 12, marginTop: 2 },
  txAmount: { fontWeight: 'bold', fontSize: 15 },
  incomeText: { color: '#2E7D32' },
  expenseText: { color: '#C62828' },
});
