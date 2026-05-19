import {
    collection,
    deleteDoc, doc,
    onSnapshot, orderBy,
    query, where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function HistoryScreen() {
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

  const handleDelete = (id) => {
    Alert.alert('Delete Transaction', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => deleteDoc(doc(db, 'transactions', id)),
      },
    ]);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>History</Text>
      <Text style={styles.count}>{transactions.length} total transactions</Text>

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No transactions yet.</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={[styles.iconBox, {
                backgroundColor: item.type === 'income' ? '#E8F5E9' : '#FFEBEE',
              }]}>
                <Text style={{ fontSize: 20 }}>{item.type === 'income' ? '📈' : '📉'}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>{item.category} · {formatDate(item.createdAt)}</Text>
              </View>
              <View style={styles.right}>
                <Text style={[styles.amount,
                  item.type === 'income' ? styles.incomeText : styles.expenseText]}>
                  {item.type === 'income' ? '+' : '-'}₱{item.amount.toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  heading: { fontSize: 26, fontWeight: 'bold', color: '#222', marginTop: 52 },
  count: { color: '#aaa', fontSize: 13, marginBottom: 20, marginTop: 4 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#aaa', fontSize: 16 },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1,
  },
  iconBox: {
    width: 46, height: 46, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  info: { flex: 1 },
  title: { fontWeight: '600', color: '#333', fontSize: 15 },
  meta: { color: '#bbb', fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontWeight: 'bold', fontSize: 15 },
  incomeText: { color: '#2E7D32' },
  expenseText: { color: '#C62828' },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
});
