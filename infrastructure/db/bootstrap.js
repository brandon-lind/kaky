// Check the .env for consistency

db.createUser({
  user: 'kaky_server',
  pwd: 'localhost_2020',
  roles: [{ role: 'readWrite', db: 'Kaky'}]
});

db.createCollection('workrequests');
db.createCollection('workitems');
db.createCollection('workers');

// Add default workers
try {
  db.workers.insertMany([
    {
      "name": "Kayla",
      "monogram": "KA",
      "avatarUrl": "https://storage.live.com/users/0x44870C41E4BDC210/myprofile/expressionprofile/profilephoto:Win8Static,UserTileMedium,UserTileStatic/MeControlXXLUserTile?ck=1&ex=24",
      "tagline": "I am very skilled at mowing lawns, but can also do the garbage and recycling when I need money."
    },
    {
      "name": "Kyle",
      "monogram": "KY",
      "avatarUrl": "https://storage.live.com/users/0x6A858728583AE06B/myprofile/expressionprofile/profilephoto:Win8Static,UserTileMedium,UserTileStatic/MeControlXXLUserTile?ck=1&ex=24",
      "tagline": "I hate all chores and you really don't want to pick me."
    }
  ]);
} catch (e) {
  print (e);
}

// Add default work items
try {
  db.workitems.insertMany([
    {
      "name": "Garbage",
      "price": "3",
      "imageUrl": "./assets/img/trash.jpeg",
      "tasks": [
        "Collect all the garbage",
        "Take the garbage to the curb",
        "Put the garbage can back"
      ]
    },
    {
      "name": "Garbage + Recycling",
      "price": "4",
      "imageUrl": "./assets/img/trash-recycle.jpeg",
      "tasks": [
        "All tasks in the Garbage Work Item",
        "Collect all the recyling",
        "Put the recyling can back"
      ]
    },
    {
      "name": "Mow Front Yard",
      "price": "5",
      "imageUrl": "./assets/img/mow-front.jpg",
      "tasks": [
        "Mow the front yard",
        "Incuding the strips next to the street and the driveway"
      ]
    },
    {
      "name": "Mow Back Yard",
      "price": "5",
      "imageUrl": "./assets/img/mow-back.jpg",
      "tasks": [
        "Mow the back yard"
      ]
    },
    {
      "name": "Mow Front + Back Yards",
      "price": "10",
      "imageUrl": "./assets/img/mow-all.jpg",
      "tasks": [
        "Items in the mow front yard",
        "Items in the mow back yard"
      ]
    },
    {
      "name": "Whatever",
      "price": "??",
      "imageUrl": "./assets/img/special.jpg",
      "tasks": [
        "A suprise work item full of fun"
      ]
    }
  ]);
} catch (e) {
  print (e);
}
