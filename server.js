// Back-end demonstrativo da Doce Nuvem. Requer Node.js 26 ou superior.
// Catálogo e pedidos persistem no SQLite local; pagamentos são simulados.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { Database } = require('node:sqlite');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'doce-nuvem.sqlite');
const initialProducts = [
  { id: 1, name: 'Red Velvet', desc: 'Massa aveludada de cacau e cream cheese.', price: 12.9, cat: 'Tradicional', emoji: '🧁', stock: 12 },
  { id: 2, name: 'Choco Nuvem', desc: 'Chocolate intenso com brigadeiro cremoso.', price: 13.9, cat: 'Tradicional', emoji: '🍫', stock: 9 },
  { id: 3, name: 'Limonada Rosa', desc: 'Massa de limão siciliano e merengue.', price: 12.5, cat: 'Tradicional', emoji: '🍋', stock: 8 },
  { id: 4, name: 'Morango & Baunilha', desc: 'Baunilha de verdade e geleia artesanal.', price: 14.5, cat: 'Tradicional', emoji: '🍓', stock: 6 },
  { id: 5, name: 'Cacau Feliz', desc: '100% vegetal, com cacau e leite de aveia.', price: 14.9, cat: 'Vegano', emoji: '🌱', stock: 5 },
  { id: 6, name: 'Coco Tropical', desc: 'Massa leve de coco com cobertura cremosa.', price: 13.5, cat: 'Vegano', emoji: '🥥', stock: 7 },
  { id: 7, name: 'Amêndoa & Mel', desc: 'Sem glúten, com farinha de amêndoas.', price: 15.9, cat: 'Sem glúten', emoji: '🍯', stock: 4 },
  { id: 8, name: 'Doce de Leite', desc: 'Massa amanteigada e doce de leite artesanal.', price: 13.9, cat: 'Sem glúten', emoji: '🍮', stock: 0 }
];

const db = new Database(DB_FILE);
db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    category TEXT NOT NULL,
    emoji TEXT NOT NULL,
    stock INTEGER NOT NULL CHECK(stock >= 0)
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,
    address TEXT NOT NULL,
    payment TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    total REAL NOT NULL CHECK(total >= 0)
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    subtotal REAL NOT NULL
  );
`);
if (db.prepare('SELECT COUNT(*) AS count FROM products').get().count === 0) {
  const insert = db.prepare('INSERT INTO products (id, name, description, price, category, emoji, stock) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const product of initialProducts) insert.run(product.id, product.name, product.desc, product.price, product.cat, product.emoji, product.stock);
}

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 100_000) reject(new Error('Requisição muito grande.')); });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('JSON inválido.')); } });
    req.on('error', reject);
  });
}
function getOrder(id) {
  const order = db.prepare('SELECT id, created_at AS createdAt, status, address, payment, payment_status AS paymentStatus, total FROM orders WHERE id = ?').get(id);
  if (!order) return null;
  order.items = db.prepare('SELECT product_id AS id, product_name AS name, unit_price AS unitPrice, quantity, subtotal FROM order_items WHERE order_id = ?').all(id);
  return order;
}
const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && url.pathname === '/api/products') {
      const products = db.prepare('SELECT id, name, description AS "desc", price, category AS cat, emoji, stock FROM products ORDER BY id').all();
      return send(res, 200, products);
    }
    if (req.method === 'GET' && url.pathname === '/api/orders') {
      const ids = db.prepare('SELECT id FROM orders ORDER BY created_at DESC').all();
      return send(res, 200, ids.map(row => getOrder(row.id)));
    }
    if (req.method === 'POST' && url.pathname === '/api/orders') {
      const body = await readBody(req);
      const address = typeof body.address === 'string' ? body.address.trim() : '';
      const payment = typeof body.payment === 'string' ? body.payment.trim() : '';
      if (address.length < 6 || address.length > 180) return send(res, 400, { error: 'Informe um endereço válido (6 a 180 caracteres).' });
      if (!['PIX (simulado)', 'Cartão de crédito (simulado)', 'Pagamento na entrega (simulado)'].includes(payment)) return send(res, 400, { error: 'Forma de pagamento inválida.' });
      if (!Array.isArray(body.items) || body.items.length === 0) return send(res, 400, { error: 'O pedido precisa ter ao menos um produto.' });

      // Soma itens repetidos antes da checagem de estoque.
      const quantities = new Map();
      for (const requested of body.items) {
        const id = Number(requested.id), qty = Number(requested.qty);
        if (!Number.isInteger(id) || !Number.isInteger(qty) || qty < 1) return send(res, 400, { error: 'Produto ou quantidade inválida.' });
        quantities.set(id, (quantities.get(id) || 0) + qty);
      }
      const items = [];
      for (const [id, quantity] of quantities) {
        const product = db.prepare('SELECT id, name, price, stock FROM products WHERE id = ?').get(id);
        if (!product) return send(res, 400, { error: 'Produto não encontrado.' });
        if (quantity > product.stock) return send(res, 409, { error: `Estoque insuficiente para ${product.name}.` });
        items.push({ id: product.id, name: product.name, unitPrice: product.price, quantity, subtotal: Number((product.price * quantity).toFixed(2)) });
      }

      const order = {
        id: `DN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(), status: 'Recebido', address, payment,
        paymentStatus: 'Não processado (demonstração)', items,
        total: Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2))
      };
      db.exec('BEGIN IMMEDIATE');
      try {
        const insertOrder = db.prepare('INSERT INTO orders (id, created_at, status, address, payment, payment_status, total) VALUES (?, ?, ?, ?, ?, ?, ?)');
        insertOrder.run(order.id, order.createdAt, order.status, order.address, order.payment, order.paymentStatus, order.total);
        const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)');
        const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
        for (const item of items) {
          const result = updateStock.run(item.quantity, item.id, item.quantity);
          if (result.changes !== 1) throw new Error(`Estoque insuficiente para ${item.name}.`);
          insertItem.run(order.id, item.id, item.name, item.unitPrice, item.quantity, item.subtotal);
        }
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        if (error.message.startsWith('Estoque insuficiente')) return send(res, 409, { error: error.message });
        throw error;
      }
      return send(res, 201, order);
    }
    if (req.method === 'GET') {
      const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
      const file = path.resolve(ROOT, `.${relative}`);
      if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT, 'index.html')) return send(res, 403, { error: 'Acesso negado.' });
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, { error: 'Arquivo não encontrado.' });
      return send(res, 200, fs.readFileSync(file), contentTypes[path.extname(file)] || 'application/octet-stream');
    }
    return send(res, 405, { error: 'Método não permitido.' });
  } catch (error) {
    return send(res, 400, { error: error.message || 'Não foi possível processar a solicitação.' });
  }
});

server.listen(PORT, () => console.log(`Doce Nuvem disponível em http://localhost:${PORT}`));
