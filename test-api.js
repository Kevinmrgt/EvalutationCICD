/**
 * Script simple pour tester l'API en développement
 * Usage: node test-api.js
 */

const http = require('http');

const baseUrl = 'http://localhost:3000';

// Helper pour faire des requêtes HTTP
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', err => {
      reject(err);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Tests de l'API
async function testAPI() {
  console.log("🧪 Test de l'API d'évaluation CI/CD\n");

  try {
    // Test 1: Health check
    console.log('1️⃣ Test du health check...');
    const health = await makeRequest('/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Uptime: ${health.data.uptime}s`);
    console.log(`   Environment: ${health.data.environment}\n`);

    // Test 2: Page d'accueil
    console.log("2️⃣ Test de la page d'accueil...");
    const home = await makeRequest('/');
    console.log(`   Status: ${home.status}`);
    console.log(`   Message: ${home.data.message}\n`);

    // Test 3: Documentation API
    console.log('3️⃣ Test de la documentation...');
    const docs = await makeRequest('/api');
    console.log(`   Status: ${docs.status}`);
    console.log(`   Endpoints disponibles: ${Object.keys(docs.data.endpoints).join(', ')}\n`);

    // Test 4: Liste des utilisateurs
    console.log('4️⃣ Test de la liste des utilisateurs...');
    const users = await makeRequest('/api/users');
    console.log(`   Status: ${users.status}`);
    console.log(`   Nombre d'utilisateurs: ${users.data.data.length}`);
    console.log(`   Premier utilisateur: ${users.data.data[0].name}\n`);

    // Test 5: Liste des tâches
    console.log('5️⃣ Test de la liste des tâches...');
    const tasks = await makeRequest('/api/tasks');
    console.log(`   Status: ${tasks.status}`);
    console.log(`   Nombre de tâches: ${tasks.data.data.length}`);
    console.log(`   Première tâche: ${tasks.data.data[0].title}\n`);

    // Test 6: Création d'un utilisateur
    console.log("6️⃣ Test de création d'un utilisateur...");
    const newUser = await makeRequest('/api/users', 'POST', {
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    });
    console.log(`   Status: ${newUser.status}`);
    if (newUser.status === 201) {
      console.log(`   Utilisateur créé: ${newUser.data.data.name} (ID: ${newUser.data.data.id})\n`);
    } else {
      console.log(`   Erreur: ${newUser.data.error?.message}\n`);
    }

    // Test 7: Création d'une tâche
    console.log("7️⃣ Test de création d'une tâche...");
    const newTask = await makeRequest('/api/tasks', 'POST', {
      title: 'Tâche de test',
      description: "Cette tâche est créée pour tester l'API",
      priority: 'medium',
      status: 'pending'
    });
    console.log(`   Status: ${newTask.status}`);
    if (newTask.status === 201) {
      console.log(`   Tâche créée: ${newTask.data.data.title} (ID: ${newTask.data.data.id})\n`);
    } else {
      console.log(`   Erreur: ${newTask.data.error?.message}\n`);
    }

    // Test 8: Route inexistante (test 404)
    console.log('8️⃣ Test de route inexistante...');
    const notFound = await makeRequest('/api/nonexistent');
    console.log(`   Status: ${notFound.status}`);
    console.log(`   Message: ${notFound.data.error?.message}\n`);

    console.log('✅ Tous les tests sont terminés !');
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.log('\n💡 Assurez-vous que le serveur est démarré avec: npm start');
  }
}

// Vérifier si le serveur est accessible
async function checkServer() {
  try {
    await makeRequest('/health');
    return true;
  } catch (error) {
    return false;
  }
}

// Point d'entrée
async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log('❌ Le serveur ne semble pas être démarré.');
    console.log('💡 Démarrez le serveur avec: npm start');
    console.log('💡 Puis relancez ce script: node test-api.js');
    process.exit(1);
  }

  await testAPI();
}

main();
