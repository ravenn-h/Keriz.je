// Plugin Story - Download stories from social media
const fetch = require('node-fetch');

module.exports = async (X, m) => {
    const command = m.command;
    const args = m.body.trim().split(/ +/).slice(1);
    const text = args.join(" ") || (m.quoted && m.quoted.text);

    if (command === 'story') {
        if (!text) return m.reply("📖 Usage: .story [platform] [username]\n\nExample: .story instagram username");

        const parts = text.split(' ');
        if (parts.length < 2) return m.reply("Please specify platform and username\n\nExample: .story instagram nature");

        const platform = parts[0].toLowerCase();
        const keyword = parts.slice(1).join(' ');

        try {
            m.reply("🔍 Searching for stories...");

            let apiUrl = "";
            switch(platform) {
                case 'instagram':
                case 'ig':
                    apiUrl = `https://api.agatz.xyz/api/instagram-story?keyword=${encodeURIComponent(keyword)}`;
                    break;
                case 'tiktok':
                case 'tt':
                    apiUrl = `https://api.agatz.xyz/api/tiktok-story?keyword=${encodeURIComponent(keyword)}`;
                    break;
                case 'facebook':
                case 'fb':
                    apiUrl = `https://api.agatz.xyz/api/facebook-story?keyword=${encodeURIComponent(keyword)}`;
                    break;
                default:
                    return m.reply("❌ Platform not supported\n\nSupported: instagram, tiktok, facebook");
            }

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result && data.result.length > 0) {
                const stories = data.result.slice(0, 3);
                
                for (let i = 0; i < stories.length; i++) {
                    const story = stories[i];
                    
                    if (story.type === 'image' && story.url) {
                        await X.sendMessage(m.chat, {
                            image: { url: story.url },
                            caption: `📸 Story ${platform.toUpperCase()} ${i+1}/${stories.length}\n\n🔍 Keyword: ${keyword}`
                        }, { quoted: m });
                    } else if (story.type === 'video' && story.url) {
                        await X.sendMessage(m.chat, {
                            video: { url: story.url },
                            caption: `🎬 Story ${platform.toUpperCase()} ${i+1}/${stories.length}\n\n🔍 Keyword: ${keyword}`
                        }, { quoted: m });
                    }
                    
                    if (i < stories.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                
                m.reply(`✅ ${stories.length} stories found and sent!`);
            } else {
                m.reply(`❌ No stories found for "${keyword}" on ${platform}`);
            }
        } catch (error) {
            console.error("Story Download Error:", error);
            m.reply("❌ Error downloading stories. Please try again later.");
        }
    }
};

module.exports.command = ['story'];