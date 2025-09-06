// Plugin RemoveBG - Remove background from images
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

module.exports = async (X, m) => {
    const command = m.command;

    if (command === 'rmbg' || command === 'removebg') {
        if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.includes('image')) {
            return m.reply("❌ Reply to an image to remove background");
        }

        try {
            m.reply("🔄 Removing background...");
            
            const media = await X.downloadMediaMessage(m.quoted);
            
            // Try using remove.bg API alternative
            const form = new FormData();
            form.append('image_file', media, { filename: 'image.jpg' });
            form.append('size', 'auto');
            
            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': process.env.REMOVE_BG_API_KEY || 'demo_key' // You need to set this
                },
                body: form
            });

            if (response.ok) {
                const buffer = await response.buffer();
                await X.sendMessage(m.chat, {
                    image: buffer,
                    caption: "✅ Background removed successfully!"
                }, { quoted: m });
            } else {
                // Fallback method or error
                m.reply("❌ Failed to remove background. Please make sure you have a valid Remove.bg API key.");
            }
            
        } catch (error) {
            console.error("RemoveBG Error:", error);
            m.reply("❌ Error removing background from image");
        }
    }
};

module.exports.command = ['rmbg', 'removebg'];