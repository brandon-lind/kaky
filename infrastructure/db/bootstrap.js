// Check the .env for consistency
db.createUser({
  user: 'kaky_server',
  pwd: 'localhost_2020',
  roles: [{ role: 'readWrite', db: 'Kaky'}]
});

db.createCollection('workrequests');
