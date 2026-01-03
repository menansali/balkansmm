/**
 * BalkanSMM Discord Bot
 * 
 * Instructions:
 * 1. Install discord.js: npm install discord.js
 * 2. Get Token from Discord Developer Portal
 * 3. Run: node discord_bot.js
 */

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Mock Config - Replace with ENV in production
const TOKEN = process.env.DISCORD_TOKEN || 'MOCK_TOKEN';
const API_URL = 'http://localhost:3001';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('BalkanSMM Bot is Active.');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // !balance <email>
    if (message.content.startsWith('!balance')) {
        const email = message.content.split(' ')[1];
        if (!email) return message.reply('Usage: !balance <email>');

        // Mock DB lookup (In real app, use Prisma directly or API key)
        message.reply(`Checking balance for ${email}... (Simulated: $420.69)`);
    }

    // !services
    if (message.content === '!services') {
        try {
            const res = await axios.get(`${API_URL}/services`);
            const top5 = res.data.slice(0, 5).map(s => `#${s.id} ${s.name} - $${s.rate}`).join('\n');
            message.reply(`**Top 5 Services:**\n${top5}\n...Check website for more.`);
        } catch (e) {
            message.reply('Failed to fetch services.');
        }
    }

    // !order <service_id> <link> <quantity>
    if (message.content.startsWith('!order')) {
        const args = message.content.split(' ');
        if (args.length < 4) return message.reply('Usage: !order <service_id> <link> <quantity>');

        // Mock processing
        message.reply(`✅ Order placed for Service #${args[1]}!\nQuantity: ${args[3]}\nLink: ${args[2]}`);
    }
});

// Since we don't have a real token, we just log the startup logic
console.log("To run this bot, get a token from https://discord.com/developers/applications");
// client.login(TOKEN); 
