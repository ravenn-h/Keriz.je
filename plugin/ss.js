// Plugin Screenshot - Take website screenshots
const fetch = require('node-fetch');

const isUrl = (url) => {
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return urlRegex.test(url);
};

const takeScreenshot = async (url, mode = 'normal') => {
    try {
        const apiUrl = `https://shot.screenshotapi.net/screenshot?token=demo&url=${encodeURIComponent(url)}&full_page=${mode === 'full' ? 'true' : 'false'}`;
        const response = await fetch(apiUrl);
        
        if (response.ok) {
            return await response.buffer();
        } else {
            throw new Error('Screenshot API failed');
        }
    } catch (error) {
        throw error;
    }
};

module.exports = async (X, m) => {
    const command = m.command;
    const args = m.body.trim().split(/ +/).slice(1);
    const text = args.join(" ") || (m.quoted && m.quoted.text);

    if (command === 'ss') {
        const url = isUrl(text);
        if (!url) return m.reply('*Example:* ss https://google.com');

        try {
            const image = await takeScreenshot(url);
            await X.sendMessage(m.chat, {
                image: image,
                caption: `📸 Screenshot of ${url}`
            }, { quoted: m });
        } catch (error) {
            m.reply('❌ Failed to take screenshot');
        }
    }
    
    if (command === 'fullss') {
        const url = isUrl(text);
        if (!url) return m.reply('*Example:* fullss https://google.com');

        try {
            const image = await takeScreenshot(url, 'full');
            await X.sendMessage(m.chat, {
                image: image,
                caption: `📸 Full page screenshot of ${url}`
            }, { quoted: m });
        } catch (error) {
            m.reply('❌ Failed to take full screenshot');
        }
    }
};

module.exports.command = ['ss', 'fullss'];