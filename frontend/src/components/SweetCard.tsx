interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface Props {
  sweet: Sweet;
  onPurchase: (id: number) => void;
  isAdmin?: boolean;
  onEdit?: (sweet: Sweet) => void;
  onDelete?: (id: number) => void;
  onRestock?: (id: number) => void;
}

export default function SweetCard({ sweet, onPurchase, isAdmin, onEdit, onDelete, onRestock }: Props) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.name}>{sweet.name}</h3>
        <span style={styles.category}>{sweet.category}</span>
      </div>
      <div style={styles.body}>
        <div style={styles.price}>₹{sweet.price.toFixed(2)}</div>
        <div style={styles.quantity}>
          Stock: {sweet.quantity}
        </div>
      </div>
      {isAdmin ? (
        <div style={styles.adminActions}>
          <button onClick={() => onEdit?.(sweet)} style={styles.editBtn}>
            Edit
          </button>
          <button onClick={() => onRestock?.(sweet.id)} style={styles.restockBtn}>
            Restock
          </button>
          <button onClick={() => onDelete?.(sweet.id)} style={styles.deleteBtn}>
            Delete
          </button>
        </div>
      ) : (
        <button
          onClick={() => onPurchase(sweet.id)}
          disabled={sweet.quantity === 0}
          style={{
            ...styles.button,
            ...(sweet.quantity === 0 ? styles.buttonDisabled : {}),
          }}
        >
          {sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
        </button>
      )}
    </div>
  );
}

const styles: any = {
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '15px',
  },
  name: {
    fontSize: '20px',
    color: '#333',
    margin: 0,
  },
  category: {
    background: '#667eea',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '15px',
    fontSize: '12px',
  },
  body: {
    marginBottom: '15px',
  },
  price: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '8px',
  },
  quantity: {
    fontSize: '14px',
    color: '#666',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  adminActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  editBtn: {
    flex: 1,
    padding: '8px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  restockBtn: {
    flex: 1,
    padding: '8px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteBtn: {
    flex: 1,
    padding: '8px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

