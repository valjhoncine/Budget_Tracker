import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function MonthlySummaryScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  // Group transactions by month
  const grouped = {};
  transactions.forEach(t => {
    if (!t.createdAt) return;
    const date = t.createdAt.toDate();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = { label, income: 0, expense: 0, count: 0 };
    if (t.type === 'income') grouped[key].income += t.amount;
    else grouped[key].expense += t.amount;
    grouped[key].count++;
  });

  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Monthly Summary</Text>

      {months.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No data yet. Add some transactions!</Text>
        </View>
      ) : (
        months.map(key => {
          const { label, income, expense, count } = grouped[key];
          const balance = income - expense;
          const isPositive = balance >= 0;
          return (
            <View key={key} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.month}>{label}</Text>
                <Text style={styles.txCount}>{count} transactions</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>💰 Income</Text>
                  <Text style={[styles.statValue, { color: '#2E7D32' }]}>
                    ₱{income.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>💸 Expense</Text>
                  <Text style={[styles.statValue, { color: '#C62828' }]}>
                    ₱{expense.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>📊 Net</Text>
                  <Text style={[styles.statValue, { color: isPositive ? '#6C63FF' : '#C62828' }]}>
                    {isPositive ? '+' : ''}₱{balance.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              {(income + expense) > 0 && (
                <View style={styles.barContainer}>
                  <View
                    style={[styles.bar, styles.incomeBar,
                      { flex: income / (income + expense) }]}
                  />
                  <View
                    style={[styles.bar, styles.expenseBar,
                      { flex: expense / (income + expense) }]}
                  />
                </View>
              )}
            </View>
          );
        })
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  heading: { fontSize: 26, fontWeight: 'bold', color: '#222', marginTop: 52, marginBottom: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#aaa', fontSize: 15 },
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18,
    marginBottom: 16, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  month: { fontWeight: 'bold', fontSize: 17, color: '#222' },
  txCount: { color: '#aaa', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  stat: { alignItems: 'center', flex: 1 },
  statLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  statValue: { fontWeight: 'bold', fontSize: 16 },
  barContainer: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  bar: { height: 8 },
  incomeBar: { backgroundColor: '#4CAF50' },
  expenseBar: { backgroundColor: '#F44336' },
});
