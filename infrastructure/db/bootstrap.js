// Make sure to check the .env for consistency on database name, user, and pwd
db.createUser({
  user: 'kaky_server',
  pwd: 'localhost_2020',
  roles: [{ role: 'readWrite', db: 'Kaky'}]
});

db.createCollection('workrequests');
