// Plugin Y2mate - YouTube downloader
const fetch = require('node-fetch');
const yts = require('yt-search');

const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|&)v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\_0-9A-Za-z]{11})/;

module.exports = async (X, m) => {
    const command = m.command;
    const args = m.body.trim().split(/ +/).slice(1);
    const text = args.join(" ") || (m.quoted && m.quoted.text);

    switch(command) {
        case 'ytv':
            if (!text) return m.reply('Example: ytv https://youtu.be/abc123');

            if (text.startsWith('y2mate;')) {
                const [_, q, id] = text.split(';');
                try {
                    const result = await downloadYT(id, 'video', q);
                    if (result) {
                        await X.sendMessage(m.chat, {
                            video: { url: result },
                            caption: `🎬 YouTube Video\nQuality: ${q}`
                        }, { quoted: m });
                    }
                } catch (error) {
                    m.reply("❌ Download failed");
                }
                return;
            }

            if (!ytIdRegex.test(text)) {
                return m.reply('❌ Please provide a valid YouTube link');
            }

            try {
                const vid = ytIdRegex.exec(text);
                const videoId = vid[1];
                
                m.reply("🔄 Processing YouTube video...");
                
                // Get video info
                const info = await getYTInfo(videoId);
                if (!info) return m.reply("❌ Failed to get video information");

                // For simplicity, send direct download link
                const downloadUrl = `https://ytdl-youtube.herokuapp.com/api/video?url=https://youtu.be/${videoId}`;
                
                await X.sendMessage(m.chat, {
                    video: { url: downloadUrl },
                    caption: `🎬 **${info.title}**\n⏱️ Duration: ${info.duration}\n📺 Views: ${info.views}`
                }, { quoted: m });

            } catch (error) {
                console.error("YT Video Error:", error);
                m.reply("❌ Failed to download YouTube video");
            }
            break;

        case 'yta':
            if (!text) return m.reply('Example: yta song name OR youtube URL');

            try {
                const vid = ytIdRegex.exec(text);
                let videoId;
                
                if (vid) {
                    videoId = vid[1];
                } else {
                    // Search for the song
                    const search = await yts(text);
                    if (!search.all[0]) return m.reply("❌ No results found");
                    
                    const video = search.all[0];
                    videoId = video.videoId;
                    
                    await X.sendMessage(m.chat, {
                        image: { url: video.thumbnail },
                        caption: `🎵 **Found:** ${video.title}\n👤 **Channel:** ${video.author.name}\n⏱️ **Duration:** ${video.timestamp}\n\n⏳ Downloading audio...`
                    }, { quoted: m });
                }

                // Download audio
                const audioUrl = `https://ytdl-youtube.herokuapp.com/api/audio?url=https://youtu.be/${videoId}`;
                
                await X.sendMessage(m.chat, {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mpeg',
                    ptt: false
                }, { quoted: m });

            } catch (error) {
                console.error("YT Audio Error:", error);
                m.reply("❌ Failed to download YouTube audio");
            }
            break;
    }
};

const getYTInfo = async (videoId) => {
    try {
        const search = await yts({ videoId: videoId });
        return search;
    } catch (error) {
        return null;
    }
};

const downloadYT = async (id, type, quality) => {
    try {
        const url = `https://ytdl-youtube.herokuapp.com/api/${type}?url=https://youtu.be/${id}&quality=${quality}`;
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            return data.download_url;
        }
        return null;
    } catch (error) {
        return null;
    }
};

module.exports.command = ['ytv', 'yta'];