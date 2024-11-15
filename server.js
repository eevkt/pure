const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// Telegram Bot Token (Ensure this is kept secure)
const token = '7247835860:AAHi08y99fZPkS1Drd8-xwtv0ZnO3pgDOqM';
const bot = new TelegramBot(token, { polling: true });

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

let students = {
    Ahmed: { age: 10, grade: 70, behavior: 'Good', photo: 'https://images.freeimages.com/fic/images/icons/2711/free_icons_for_windows8_metro/512/guest.png?fmt=webp&h=350' },
    Emile: { age: 12, grade: 85, behavior: 'Excellent', photo: 'https://images.freeimages.com/fic/images/icons/2711/free_icons_for_windows8_metro/512/guest.png?fmt=webp&h=350' },
    Ali: { age: 11, grade: 90, behavior: 'Satisfactory', photo: 'https://images.freeimages.com/fic/images/icons/2711/free_icons_for_windows8_metro/512/guest.png?fmt=webp&h=350' },
};

// Middleware for ngrok warning bypass
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// Endpoint to get student data
app.get('/students', (req, res) => {
    res.json(students);
});

// Telegram Bot Commands

// /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
Welcome to the Student Management Bot!
Available commands:
/add_student <name> <age> <grade> <behavior> - Add a new student.
/update_grade <name> <grade> - Update a student's grade.
/update_age <name> <age> - Update a student's age.
/update_behavior <name> <behavior> - Update a student's behavior.
/rename <oldName> <newName> - Rename a student.
/view_student <name> - View a student's details.
/list_students - List all students.
/help - Show this help message.
/photo - Upload a photo with the student name as the caption to update their photo.
`;
    bot.sendMessage(chatId, welcomeMessage);
});

// Add a new student
bot.onText(/\/add_student (.+) (\d+) (\d+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const name = match[1];
    const age = parseInt(match[2], 10);
    const grade = parseInt(match[3], 10);
    const behavior = match[4];

    if (!students[name]) {
        students[name] = { age, grade, behavior, photo: 'https://images.freeimages.com/fic/images/icons/2711/free_icons_for_windows8_metro/512/guest.png?fmt=webp&h=350' };
        bot.sendMessage(chatId, `Added new student: ${name}`);
    } else {
        bot.sendMessage(chatId, `Student ${name} already exists.`);
    }
});

// Update a student's grade
bot.onText(/\/update_grade (.+) (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const name = match[1];
    const newGrade = parseInt(match[2], 10);

    if (students[name]) {
        students[name].grade = newGrade;
        bot.sendMessage(chatId, `Updated ${name}'s grade to ${newGrade}`);
    } else {
        bot.sendMessage(chatId, `Student ${name} not found.`);
    }
});

// Update a student's age
bot.onText(/\/update_age (.+) (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const name = match[1];
    const newAge = parseInt(match[2], 10);

    if (students[name]) {
        students[name].age = newAge;
        bot.sendMessage(chatId, `Updated ${name}'s age to ${newAge}`);
    } else {
        bot.sendMessage(chatId, `Student ${name} not found.`);
    }
});

// Update a student's behavior
bot.onText(/\/update_behavior (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const name = match[1];
    const newBehavior = match[2];

    if (students[name]) {
        students[name].behavior = newBehavior;
        bot.sendMessage(chatId, `Updated ${name}'s behavior to ${newBehavior}`);
    } else {
        bot.sendMessage(chatId, `Student ${name} not found.`);
    }
});

// Rename a student
bot.onText(/\/rename (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const oldName = match[1];
    const newName = match[2];

    if (students[oldName]) {
        students[newName] = { ...students[oldName] };
        delete students[oldName];
        bot.sendMessage(chatId, `Renamed ${oldName} to ${newName}`);
    } else {
        bot.sendMessage(chatId, `Student ${oldName} not found.`);
    }
});

// View student details
bot.onText(/\/view_student (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const name = match[1];

    if (students[name]) {
        const student = students[name];
        bot.sendMessage(chatId, `Details for ${name}:\nAge: ${student.age}\nGrade: ${student.grade}\nBehavior: ${student.behavior}`);
    } else {
        bot.sendMessage(chatId, `Student ${name} not found.`);
    }
});

// List all students
bot.onText(/\/list_students/, (msg) => {
    const chatId = msg.chat.id;
    const studentNames = Object.keys(students).join(', ');
    bot.sendMessage(chatId, `Students: ${studentNames}`);
});

// Help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
Available commands:
/add_student <name> <age> <grade> <behavior> - Add a new student.
/update_grade <name> <grade> - Update a student's grade.
/update_age <name> <age> - Update a student's age.
/update_behavior <name> <behavior> - Update a student's behavior.
/rename <oldName> <newName> - Rename a student.
/view_student <name> - View a student's details.
/list_students - List all students.
/photo - Upload a photo with the student name as the caption to update their photo.
/help - Show this help message.
`;
    bot.sendMessage(chatId, helpMessage);
});

// Handle photo uploads for updating student photos
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const name = msg.caption?.trim(); // Assume the student's name is sent as the caption

    if (!name || !students[name]) {
        bot.sendMessage(chatId, `Please provide a valid student name as the photo caption.`);
        return;
    }

    // Get the largest photo size available
    const photoArray = msg.photo;
    const fileId = photoArray[photoArray.length - 1].file_id;

    try {
        // Get the file path from Telegram
        const fileResponse = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${token}/${fileResponse.file_path}`;

        // Update the student's photo URL
        students[name].photo = fileUrl;
        bot.sendMessage(chatId, `Updated ${name}'s photo successfully!`);
    } catch (error) {
        console.error('Error fetching photo:', error);
        bot.sendMessage(chatId, `Failed to update ${name}'s photo. Please try again.`);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
