const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// ⚠️ ضع معلوماتك الخاصة هنا بين العلامات ''
const token = '7707124576:AAG9EUD5i-u4uYp9mw9nJs8FkXTSfCAjz-0'; 
const MY_CHAT_ID = '5999558762'; 
const dbURL = "https://delta-spt-default-rtdb.firebaseio.com/scripts.json";

const bot = new TelegramBot(token, {polling: true});

console.log("Delta SPT Bot is running...");

function isAdmin(msg) {
    return msg.chat.id.toString() === MY_CHAT_ID.toString();
}

bot.onText(/\/start/, (msg) => {
    if(!isAdmin(msg)) return bot.sendMessage(msg.chat.id, "❌ عذراً، هذا البوت خاص بمطور Delta SPT فقط.");
    
    const welcomeMessage = `
👋 أهلاً بك حسين في لوحة تحكم Delta SPT!

🤖 الأوامر المتاحة لك:
➕ /add [الاسم] | [الوصف] | [الكود] -> لإضافة سكربت جديد للموقع.
🗑️ /delete -> لعرض قائمة السكربتات وحذف أي سكربت فوراً.
    `;
    bot.sendMessage(msg.chat.id, welcomeMessage);
});

bot.onText(/\/add (.+)/, async (msg, match) => {
    if(!isAdmin(msg)) return;

    const chatId = msg.chat.id;
    const dataString = match[1];
    const parts = dataString.split('|');
    
    if(parts.length < 3) {
        return bot.sendMessage(chatId, "⚠️ الطريقة خاطئة! يرجى الكتابة بهذا الشكل:\n`/add اسم الماب | وصف السكربت | كود اللوا`", {parse_mode: "Markdown"});
    }

    const name = parts[0].trim();
    const desc = parts[1].trim();
    const code = parts.slice(2).join('|').trim();

    try {
        await axios.post(dbURL, { name, desc, code });
        bot.sendMessage(chatId, `✅ تم نشر السكربت بنجاح داخل الموقع!\n📌 الاسم: ${name}`);
    } catch (error) {
        bot.sendMessage(chatId, "❌ حدث خطأ أثناء النشر في Firebase.");
    }
});

bot.onText(/\/delete/, async (msg) => {
    if(!isAdmin(msg)) return;

    const chatId = msg.chat.id;

    try {
        const response = await axios.get(dbURL);
        const data = response.data;

        if(!data) return bot.sendMessage(chatId, "📭 لا توجد سكربتات حالياً في الموقع.");

        bot.sendMessage(chatId, "🔄 جاري جلب السكربتات، اضغط على أمر الحذف بجانب السكربت:");

        Object.entries(data).forEach(([id, script]) => {
            bot.sendMessage(chatId, `📦 ماب: ${script.name}\n📝 الوصف: ${script.desc}\n\n🗑️ لـلـحـذف اضـغـط هنا:\n/del_${id}`);
        });

    } catch (error) {
        bot.sendMessage(chatId, "❌ فشل جلب البيانات من الفايربيس.");
    }
});

bot.on('message', async (msg) => {
    if(!isAdmin(msg)) return;
    
    const text = msg.text || "";
    if(text.startsWith('/del_')) {
        const scriptId = text.replace('/del_', '').trim();
        const deleteURL = `https://delta-spt-default-rtdb.firebaseio.com/scripts/${scriptId}.json`;

        try {
            await axios.delete(deleteURL);
            bot.sendMessage(msg.chat.id, "🗑️ تم حذف السكربت بنجاح واختفى من الموقع فوراً!");
        } catch (error) {
            bot.sendMessage(msg.chat.id, "❌ فشل حذف السكربت من الفايربيس.");
        }
    }
});
