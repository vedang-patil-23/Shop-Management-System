import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import SweetCard from '../components/SweetCard';
import AdminPanel from '../components/AdminPanel';
import { SWEET_CATEGORIES } from '../constants/categories';

interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);

  useEffect(() => {
    fetchSweets();
  }, []);

  useEffect(() => {
    filterSweets();
  }, [sweets, searchTerm, categoryFilter, priceRange]);

  const fetchSweets = async () => {
    try {
      const res = await api.get('/sweets');
      setSweets(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch sweets');
      setLoading(false);
    }
  };

  const filterSweets = () => {
    let filtered = [...sweets];

    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((s) => s.category === categoryFilter);
    }

    if (priceRange.min) {
      filtered = filtered.filter((s) => s.price >= parseFloat(priceRange.min));
    }

    if (priceRange.max) {
      filtered = filtered.filter((s) => s.price <= parseFloat(priceRange.max));
    }

    setFilteredSweets(filtered);
  };

  const handlePurchase = async (id: number) => {
    try {
      await api.post(`/sweets/${id}/purchase`);
      fetchSweets();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Purchase failed');
    }
  };

  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sweet?')) return;
    try {
      await api.delete(`/sweets/${id}`);
      fetchSweets();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleRestock = async (id: number) => {
    const quantity = prompt('Enter quantity to add:');
    if (!quantity || isNaN(parseInt(quantity))) return;
    try {
      await api.post(`/sweets/${id}/restock`, { quantity: parseInt(quantity) });
      fetchSweets();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Restock failed');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>🍬 Sweet Shop</h1>
        <div style={styles.headerRight}>
          <span style={styles.userInfo}>
            {user?.username} {user?.role === 'admin' && '(Admin)'}
          </span>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search sweets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={styles.select}
          >
            <option value="">All Categories</option>
            {SWEET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            style={styles.priceInput}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            style={styles.priceInput}
          />
        </div>

        {user?.role === 'admin' && (
          <AdminPanel 
            onSweetUpdate={fetchSweets}
            editingSweet={editingSweet}
            setEditingSweet={setEditingSweet}
            showForm={showForm}
            setShowForm={setShowForm}
          />
        )}

        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <div style={styles.sweetsGrid}>
            {filteredSweets.length === 0 ? (
              <div style={styles.empty}>No sweets found</div>
            ) : (
              filteredSweets.map((sweet) => (
                <SweetCard
                  key={sweet.id}
                  sweet={sweet}
                  onPurchase={handlePurchase}
                  isAdmin={user?.role === 'admin'}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRestock={handleRestock}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  header: {
    background: 'rgba(255,255,255,0.95)',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '28px',
    color: '#667eea',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userInfo: {
    color: '#333',
    fontWeight: '500',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  content: {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  filters: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1',
    minWidth: '200px',
    padding: '12px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
  },
  select: {
    padding: '12px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  priceInput: {
    width: '120px',
    padding: '12px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
  },
  sweetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  loading: {
    textAlign: 'center',
    color: 'white',
    fontSize: '20px',
    padding: '40px',
  },
  empty: {
    textAlign: 'center',
    color: 'white',
    fontSize: '18px',
    padding: '40px',
    gridColumn: '1 / -1',
  },
};

