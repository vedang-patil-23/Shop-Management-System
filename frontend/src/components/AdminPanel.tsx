import { useState, useEffect } from 'react';
import api from '../api';

interface Props {
  onSweetUpdate: () => void;
  editingSweet?: any;
  setEditingSweet?: (sweet: any) => void;
  showForm?: boolean;
  setShowForm?: (show: boolean) => void;
}

export default function AdminPanel({ 
  onSweetUpdate, 
  editingSweet: externalEditingSweet,
  setEditingSweet: externalSetEditingSweet,
  showForm: externalShowForm,
  setShowForm: externalSetShowForm
}: Props) {
  const [internalShowForm, setInternalShowForm] = useState(false);
  const [internalEditingSweet, setInternalEditingSweet] = useState<any>(null);
  
  const showForm = externalShowForm !== undefined ? externalShowForm : internalShowForm;
  const setShowForm = externalSetShowForm || setInternalShowForm;
  const editingSweet = externalEditingSweet !== undefined ? externalEditingSweet : internalEditingSweet;
  const setEditingSweet = externalSetEditingSweet || setInternalEditingSweet;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSweet) {
        await api.put(`/sweets/${editingSweet.id}`, formData);
      } else {
        await api.post('/sweets', formData);
      }
      setFormData({ name: '', category: '', price: '', quantity: '' });
      setShowForm(false);
      setEditingSweet(null);
      onSweetUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sweet?')) return;
    try {
      await api.delete(`/sweets/${id}`);
      onSweetUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleRestock = async (id: number) => {
    const quantity = prompt('Enter quantity to add:');
    if (!quantity || isNaN(parseInt(quantity))) return;
    try {
      await api.post(`/sweets/${id}/restock`, { quantity: parseInt(quantity) });
      onSweetUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Restock failed');
    }
  };

  useEffect(() => {
    if (editingSweet) {
      setFormData({
        name: editingSweet.name,
        category: editingSweet.category,
        price: editingSweet.price.toString(),
        quantity: editingSweet.quantity.toString(),
      });
      setShowForm(true);
    }
  }, [editingSweet]);

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h2 style={styles.title}>Admin Panel</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingSweet(null);
              setFormData({ name: '', category: '', price: '', quantity: '' });
            }
          }}
          style={styles.toggleBtn}
        >
          {showForm ? 'Cancel' : 'Add New Sweet'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={styles.input}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            style={styles.input}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.submitBtn}>
            {editingSweet ? 'Update' : 'Create'}
          </button>
        </form>
      )}
    </div>
  );
}

const styles: any = {
  panel: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    color: '#333',
  },
  toggleBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    alignItems: 'end',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
  },
  submitBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

