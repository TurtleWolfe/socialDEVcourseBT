# Starting a new [**_`CRUD`_**](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete 'wikipedia.org') project from scratch in [**_`NODE`_**](https://nodejs.org/ 'NodeJS.org') using [**_`Exprress Generator`_**](https://expressjs.com/en/starter/generator.html 'Exprress Generator')

[![mongodb](public/images/MongoDB.png)](https://www.mongodb.com)
[![mailtrap](public/images/mailtrap.png)](https://mailtrap.io)
[![mapquest](public/images/mapquest.png)](https://developer.mapquest.com)
[![mongo compass](public/images/MongoDB.png)](https://www.mongodb.com/products/compass)

[![https://TurtleWolfe.com/](public/favicon.ico 'https://TurtleWolfe.com/')](https://TurtleWolfe.com/ "Google's Homepage")
[![PostMan Collection](public/images/PostManCollection.png 'PostMan Collection')](https://TurtleWolfe.com/ "Google's Homepage")
[![video comign soon/](public/favicon.ico 'video comign soon')](https://TurtleWolfe.com/ "Google's Homepage")

[![ExpressTemplate previous version](public/images/expressTemplate.png 'previous version')](https://stark-spire-40922.herokuapp.com/ "Google's Homepage")

[![nodejs-the-complete-guide/](public/images/NODE.png 'Master Node JS, build REST APIs with Node.js, GraphQL APIs, add Authentication, use MongoDB, SQL & much more! ')](https://www.udemy.com/course/nodejs-the-complete-guide/ "Google's Homepage")
[![nodejs-api-masterclass](public/images/API.png 'Create a real world backend for a bootcamp directory app')](https://www.udemy.com/course/nodejs-api-masterclass/ "Google's Homepage")
[![mern-stack-front-to-back/](public/images/MERN.png 'Build and deploy a social network with Node.js, Express, React, Redux & MongoDB. Fully updated April 2019 ')](https://www.udemy.com/course/mern-stack-front-to-back/ "Google's Homepage")

```bash
 git init
 git add .
 git commit -m "original 33 files"
 npx express-generator --view=ejs --git .
```

```bash
npx: installed 10 in 4.817s
destination is not empty, continue? [y/N] y

   create : public/javascripts/
   create : .gitignore
   create : package.json
   create : public/stylesheets/style.css
   create : routes/index.js
   create : routes/users.js
   create : views/error.ejs
   create : views/index.ejs

   run the app:
     $ DEBUG=mernatuh-master:* npm start
```

## 2. Discard Changes to modified files **_`app.js`_** & **_`bin/www`_**

```bash
discard changes to: app.js
discard changes to: bin/www
git add .
git commit -m "7 additional files from running express-generator"
```

## 3. Install the **API** _**`dependencies`**_

```bash
# API Express Mastery
npm i bcryptjs colors cookie-parser cors debug dotenv ejs express express-fileupload express-mongo-sanitize express-rate-limit helmet hpp http-errors jsonwebtoken mongoose morgan node-geocoder nodemailer slugify xss-clean
```

## 4. Install the **MERN** _**`dependencies`**_

```bash
npm i bcryptjs client express express-validator gravatar jsonwebtoken mongoose normalize-url request
```

<!-- ```bash
# API Express Mastery
npm i
# bcryptjs
colors
cookie-parser
cors
dotenv
# express
express-fileupload
express-mongo-sanitize
express-rate-limit
helmet
hpp
# jsonwebtoken
# mongoose
morgan
node-geocoder
nodemailer
slugify
xss-clean
``` -->

## 5. Install the _**`developement dependencies`**_

```bash
npm i -D nodemon concurrently
```

## 6. add **_`start`_** and **_`dev`_** scripts (in the **`package.json`**)

> _**`package.json`**_

```json
  "scripts": {
    "start": "NODE_ENV=production node ./bin/www",
    "dev": "nodemon ./bin/www",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

## 7. Configure `Enviromental Variables`, beginning with **_`Enviroment`_** and **_`Port`_**

> **_`config.env`_**

```bash
NODE_ENV = development;
PORT = 5000;
MONGO_URI=#<pasteYOURShere>

GEOCODER_PROVIDER=mapquest
GEOCODER_API_KEY=#<pasteYOURShere>

FILE_UPLOAD_PATH= ./public/uploads
MAX_FILE_UPLOAD=1000000

JWT_SECRET=#<pasteYOURShere>
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=#<pasteYOURShere>
SMTP_PASSWORD=#<pasteYOURShere>
FROM_EMAIL=#<pasteYOURShere>
FROM_NAME=#<pasteYOURShere>
```

## 8. run it from the command line

```bash
npm run dev
```

## 9. stop it with **CNTRL C**

## 10. push it to **`Git Hub`**

```bash
git commit -m "first commit"
git remote add origin git@github.com:TurtleWolf/MERNauth.git
git push -u origin master
```

---

## 14. Connecting to **_`MongoDB`_** with **_`Mongoose`_**

### in the `db.js` file

> **_`db.js`_**

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(
    `MongoDataBase Connected: ${conn.connection.host}`.cyan.underline.bold
  );
};

module.exports = connectDB;
```

## 15. secure credentials

### add **_`config/config.env`_** to **_`.gitignore`_**

> **_`.gitignore`_**

```bash
# dotenv environment variables file
.env
/config/config.env
```

---

---

## 20. import default user data in the **_`seeder.js`_** file

```bash
touch seeder.js
```

> **_`seeder.js`_**

```js

}; // Delete data out of DB

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
```

## 21. edit data set in **_`_data/users.json`_** file to include the users

> **_`_data/users.json`_**

```js
[
  {
    _id: '5c8a1d5b0190b214360dc038',
    name: 'MOE',
    email: 'Moe@gmail.com',
    role: 'user',
    password: '123456',
  },
  {
    _id: '5c8a1d5b0190b214360dc039',
    name: 'Larry',
    email: 'Larry@gmail.com',
    role: 'publisher',
    password: '123456',
  },
  {
    _id: '5c8a1d5b0190b214360dc040',
    name: 'Curly',
    email: 'Curly@gmail.com',
    role: 'admin',
    password: '123456',
  },
];
```

## 22. lvl2heading **_`.env`_** file

> **_`app.js`_**

```js
code;
```

---

## 21. lvl2heading **_`.env`_** file

> **_`app.js`_**

```js
code;
```

## 23. lvl2heading **_`.env`_** file

> **_`app.js`_**

```js
code;
```

## 24. lvl2heading **_`.env`_** file

> **_`app.js`_**

```js
code;
```

---

---

---

---

---

---

---

## **_filter_**

### by **_`req.query.params;`_**

### **_{{url}}/api/v1/widgets`?who= &what= &when=`_**

### **_`[lt]`_** **_`[lte]`_** **_`[eq]`_** **_`[gte]`_** **_`[gt]`_** **_`[in]`_**

### **_{{url}}/api/v1/widgets`?when[lte]=3`_**

## **_select_**

### **_`select= ,`_**

### **_{{url}}/api/v1/widgets`?select=who,why`_**

## **_sort_**

### **_`sort=`_**

### **_{{url}}/api/v1/widgets`?sort=-who`_**

## **_pagination_**

### **_`limit=`_**

### **_`page=`_**

### **_{{url}}/api/v1/widgets`?page=2&limit=3`_**

```js
```

---

---

---

---

---

---

---

---

---

(then I addded a copy of Brad's notes at the bottom of the README.md)

---

## DevConnector 2.0

> Social network for developers

This is a MERN stack application from the "MERN Stack Front To Back" course on [Udemy](https://www.udemy.com/mern-stack-front-to-back/?couponCode=TRAVERSYMEDIA). It is a small social network app that includes authentication, profiles and forum posts.

## Updates since course published

Since the course was published, GitHub has [depreciated authentication via URL query parameters](https://developer.github.com/changes/2019-11-05-deprecated-passwords-and-authorizations-api/#authenticating-using-query-parameters)
You can get an access token by following [these instructions](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line)
For this app we don't need to add any permissions so don't select any in the _scopes_.
**DO NOT SHARE ANY TOKENS THAT HAVE PERMISSIONS**
This would leave your account or repositories vulnerable, depending on permissions set.

It would also be worth adding your `default.json` config file to `.gitignore`
If git has been previously tracking your `default.json` file then...

```bash
git rm --cached config/default.json
```

Then add your token to the config file and confirm that the file is untracked with `git status` before pushing to GitHub.
You'll also need to change the options object in `routes/api/profile.js` where we make the request to the GitHub API to...

```js
const options = {
  uri: encodeURI(
    `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
  ),
  method: 'GET',
  headers: {
    'user-agent': 'node.js',
    Authorization: `token ${config.get('githubToken')}`,
  },
};
```

## Quick Start

### Add a default.json file in config folder with the folowing

```json
{
  "mongoURI": "<your_mongoDB_Atlas_uri_with_credentials>",
  "jwtSecret": "secret",
  "githubToken": ""
}
```

### Install server dependencies

```bash
npm install
```

### Install client dependencies

```bash
cd client
npm install
```

### Run both Express & React from root

```bash
npm run dev
```

### Build for production

```bash
cd client
npm run build
```

## App Info

### Author

Brad Traversy
[Traversy Media](http://www.traversymedia.com)

### Version

2.0.0

### License

This project is licensed under the MIT License
