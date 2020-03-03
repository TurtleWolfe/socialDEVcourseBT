const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
// const BootCamp = require('./models/BootCamp');
// const Course = require('./models/Course');
const User = require('./models/User');
const Widget = require('./models/Widget');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// Read JSON files

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

const widgets = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/widgets.json`, 'utf-8')
);
// Import data into DB

const importData = async () => {
    try {
        // await BootCamp.create(bootcamps);
        // await Course.create(courses);
        await User.create(users);
        await Widget.create(widgets);
        console.log('Data Imported...'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
};                                  // Import data into DB

// Delete data out of DB
const deleteData = async () => {
    try {
        // await BootCamp.deleteMany();
        // await Course.deleteMany();
        await User.deleteMany();
        await Widget.deleteMany();
        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
};                                 // Delete data out of DB

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}
