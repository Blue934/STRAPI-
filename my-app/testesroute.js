import fetch from 'node-fetch';

async function testRoutes(routes) {
  for (const route of routes) {
    try {
      const response = await fetch(route.url, {
        method: route.method,
        headers: route.headers || {},
        body: route.body ? JSON.stringify(route.body) : undefined,
      });

      const data = await response.json();
      console.log(`✅ ${route.method} ${route.url}:`, data);
    } catch (error) {
      console.error(`❌ Erreur sur ${route.method} ${route.url}:`, error.message);
    }
  }
}

// Exemple d'utilisation
const routes = [
  { method: 'GET', url: 'http://localhost:1337/api/messages' },
  { method: 'POST', url: 'http://localhost:1337/api/posts', body: { title: 'Test', content: 'Ceci est un test' } },
  { method: 'DELETE', url: 'http://localhost:1337/api/posts/1' },
];

testRoutes(routes);