import express, { Response } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { dbGet, dbAll, dbRun } from '../database';

const router = express.Router();

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, price, quantity } = req.body;

    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const result: any = await dbRun(
      'INSERT INTO sweets (name, category, price, quantity) VALUES (?, ?, ?, ?)',
      [name, category, parseFloat(price), parseInt(quantity)]
    );

    const sweet = await dbGet('SELECT * FROM sweets WHERE id = ?', [result.lastID || result.changes]);
    if (!sweet) {
      return res.status(500).json({ error: 'Failed to retrieve created sweet' });
    }
    res.status(201).json(sweet);
  } catch (error: any) {
    console.error('Error creating sweet:', error);
    res.status(500).json({ error: error.message || 'Failed to create sweet' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sweets = await dbAll('SELECT * FROM sweets ORDER BY name');
    res.json(sweets || []);
  } catch (error: any) {
    console.error('Error fetching sweets:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch sweets' });
  }
});

router.get('/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    let query = 'SELECT * FROM sweets WHERE 1=1';
    const params: any[] = [];

    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(parseFloat(minPrice as string));
    }
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice as string));
    }

    query += ' ORDER BY name';
    const sweets = await dbAll(query, params);
    res.json(sweets);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (category) {
      updates.push('category = ?');
      params.push(category);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(parseFloat(price));
    }
    if (quantity !== undefined) {
      updates.push('quantity = ?');
      params.push(parseInt(quantity));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(parseInt(id));

    await dbRun(`UPDATE sweets SET ${updates.join(', ')} WHERE id = ?`, params);
    const sweet = await dbGet('SELECT * FROM sweets WHERE id = ?', [id]);
    res.json(sweet);
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM sweets WHERE id = ?', [id]);
    res.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

router.post('/:id/purchase', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const sweet = await dbGet('SELECT * FROM sweets WHERE id = ?', [id]) as any;

    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    if (sweet.quantity <= 0) {
      return res.status(400).json({ error: 'Out of stock' });
    }

    await dbRun('UPDATE sweets SET quantity = quantity - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    const updated = await dbGet('SELECT * FROM sweets WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

router.post('/:id/restock', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity required' });
    }

    await dbRun(
      'UPDATE sweets SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [parseInt(quantity), id]
    );
    const sweet = await dbGet('SELECT * FROM sweets WHERE id = ?', [id]);
    res.json(sweet);
  } catch (error) {
    res.status(500).json({ error: 'Restock failed' });
  }
});

export default router;

