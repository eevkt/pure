// server.js
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const port = 3000;

// Telegram Bot Token (Ensure this is kept secure)
const token = '7247835860:AAHi08y99fZPkS1Drd8-xwtv0ZnO3pgDOqM'; // Replace with your actual token
const bot = new TelegramBot(token, { polling: true });

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

let students = {
    Ahmed: { age: 10, grade: 70, behavior: 'Good', photo: 'https://images.freeimages.com/fic/images/icons/2711/free_icons_for_windows8_metro/512/guest.png?fmt=webp&h=350' },
    Emile: { age: 12, grade: 85, behavior: 'Excellent', photo: 'https://images.freeimages.com/fic/images/icons/2711/free_icons_for_windows8_metro/512/guest.png?fmt=webp&h=350' },
    Ali: { age: 11, grade: 90, behavior: 'Satisfactory', photo: 'https://images.freeimages.com/fic/images/icons/2711/free_icons_for_windows8_metro/512/guest.png?fmt=webp&h=350' },
};

let news = [
    { title: 'School Reopens', content: 'School reopens on September 15th.', photo: 'https://example.com/news1.jpg' },
    { title: 'New Activities', content: 'New extracurricular activities announced.', photo: 'https://example.com/news2.jpg' },
];

// Middleware for ngrok warning bypass
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// Endpoint to get student data
app.get('/students', (req, res) => {
    res.json(students);
});

// Endpoint to get news data
app.get('/news', (req, res) => {
    res.json(news);
});

// Telegram Bot Commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
        Welcome to the Student and News Management Bot!
        Available commands:
        /add_student <name> <age> <grade> <behavior> - Add a new student.
        /update_grade <name> <grade> - Update a student's grade.
        /update_age <name> <age> - Update a student's age.
        /update_behavior <name> <behavior> - Update a student's behavior.
        /rename <oldName> <newName> - Rename a student.
        /update_student_photo <name> <photoUrl> - Update a student's photo.
        /view_student <name> - View a student's details.
        /list_students - List all students.
        /add_news <title> <content> <photoUrl> - Add a new news article.
        /update_news_title <oldTitle> <newTitle> - Update a news title.
        /update_news_content <title> <newContent> - Update news content.
        /update_news_photo <title> <photoUrl> - Update a news photo.
        /list_news - List all news articles.
        /help - Show this help message.
    `;
    bot.sendMessage(chatId, welcomeMessage);
});

// Student Management Commands
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

bot.onText(/\/update_student_photo (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const name = match[1];
    const newPhotoUrl = match[2];

    if (students[name]) {
        students[name].photo = newPhotoUrl;
        bot.sendMessage(chatId, `Updated ${name}'s photo.`);
    } else {
        bot.sendMessage(chatId, `Student ${name} not found.`);
    }
});

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

bot.onText(/\/list_students/, (msg) => {
    const chatId = msg.chat.id;
    const studentNames = Object.keys(students).join(', ');
    bot.sendMessage(chatId, `Students: ${studentNames}`);
});

// News Management Commands
bot.onText(/\/add_news (.+) (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const [title, content, photo] = [match[1], match[2], match[3]];

    news.push({ title, content, photo });
    bot.sendMessage(chatId, `Added news article: "${title}"`);
});

bot.onText(/\/update_news_title (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const [oldTitle, newTitle] = [match[1], match[2]];

    const article = news.find(n => n.title === oldTitle);
    if (article) {
        article.title = newTitle;
        bot.sendMessage(chatId, `Updated news title to "${newTitle}"`);
    } else {
        bot.sendMessage(chatId, `News titled "${oldTitle}" not found.`);
    }
});

bot.onText(/\/update_news_content (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const [title, newContent] = [match[1], match[2]];

    const article = news.find(n => n.title === title);
    if (article) {
        article.content = newContent;
        bot.sendMessage(chatId, `Updated content for news titled "${title}"`);
    } else {
        bot.sendMessage(chatId, `News titled "${title}" not found.`);
    }
});

bot.onText(/\/update_news_photo (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const [title, newPhotoUrl] = [match[1], match[2]];

    const article = news.find(n => n.title === title);
    if (article) {
        article.photo = newPhotoUrl;
        bot.sendMessage(chatId, `Updated photo for news titled "${title}"`);
    } else {
        bot.sendMessage(chatId, `News titled "${title}" not found.`);
    }
});

bot.onText(/\/list_news/, (msg) => {
    const chatId = msg.chat.id;
    const newsTitles = news.map(n => n.title).join(', ');
    bot.sendMessage(chatId, `News articles: ${newsTitles}`);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
