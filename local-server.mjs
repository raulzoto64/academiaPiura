import http from 'http';

// Simple in-memory KV store
const kvStore = new Map();

// Initialize some test data
kvStore.set('user:test1', {
  id: 'user:test1',
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'student',
  createdAt: new Date().toISOString()
});

// Create server
const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Handle health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Handle auth endpoints
  if (pathname.startsWith('/auth/')) {
    if (pathname === '/auth/signin' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          const { email, password } = JSON.parse(body);
          const users = Array.from(kvStore.entries()).filter(([key, value]) => key.startsWith('user:') && value.email === email);
          
          if (users.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User not found' }));
            return;
          }

          const user = users[0][1];
          if (user.password !== password) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid password' }));
            return;
          }

          // Generate token
          const token = `token:${user.id}:${Date.now()}`;
          kvStore.set(token, { userId: user.id, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token
          }));
        } catch (error) {
          console.error('Signin error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error signing in' }));
        }
      });
      return;
    }

    if (pathname === '/auth/signup' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          const { email, password, name, role = 'student' } = JSON.parse(body);
          const users = Array.from(kvStore.entries()).filter(([key, value]) => key.startsWith('user:') && value.email === email);
          
          if (users.length > 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Email already registered' }));
            return;
          }

          const userId = `user:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
          const user = {
            id: userId,
            email,
            password,
            name,
            role,
            createdAt: new Date().toISOString()
          };

          kvStore.set(userId, user);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ user: { id: userId, email, name, role } }));
        } catch (error) {
          console.error('Signup error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error creating user' }));
        }
      });
      return;
    }

    if (pathname === '/auth/me' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const token = authHeader.split(' ')[1];
      const tokenData = kvStore.get(token);

      if (!tokenData || tokenData.expiresAt < Date.now()) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or expired token' }));
        return;
      }

      const user = kvStore.get(tokenData.userId);
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }

      const { password, ...userWithoutPassword } = user;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ user: userWithoutPassword }));
      return;
    }
  }

  // Handle courses endpoints
  if (pathname.startsWith('/courses')) {
    if (pathname === '/courses' && req.method === 'GET') {
      const courses = Array.from(kvStore.entries())
        .filter(([key, value]) => key.startsWith('course:') && value.published)
        .map(([key, value]) => value);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ courses }));
      return;
    }
  }

  // Default: not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Local server running on http://localhost:${PORT}`);
});