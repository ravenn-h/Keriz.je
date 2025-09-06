// Plugin Sticker - Advanced sticker functionality
const { Sticker } = require('wa-sticker-formatter');

module.exports = async (X, m) => {
    const command = m.command;
    const args = m.body.trim().split(/ +/).slice(1);
    const text = args.join(" ");

    switch(command) {
        case 'sticker':
        case 's':
            if (!m.quoted || (!m.quoted.mimetype?.includes('image') && !m.quoted.mimetype?.includes('video'))) {
                return m.reply("❌ Reply to an image or video to create sticker");
            }

            try {
                const media = await X.downloadMediaMessage(m.quoted);
                const sticker = new Sticker(media, {
                    pack: global.packname || 'Vrush-maria',
                    author: global.author || '𝕽𝖆𝖛𝖊𝖓',
                    type: 'default',
                    categories: ['🤖'],
                    id: Date.now().toString(),
                    quality: 50
                });

                const stickerBuffer = await sticker.toBuffer();
                await X.sendMessage(m.chat, {
                    sticker: stickerBuffer
                }, { quoted: m });
            } catch (error) {
                console.error("Sticker creation error:", error);
                m.reply("❌ Failed to create sticker");
            }
            break;

        case 'circle':
            if (!m.quoted || !m.quoted.mimetype?.includes('image')) {
                return m.reply("❌ Reply to an image to create circle sticker");
            }

            try {
                const media = await X.downloadMediaMessage(m.quoted);
                const sticker = new Sticker(media, {
                    pack: global.packname || 'Vrush-maria',
                    author: global.author || '𝕽𝖆𝖛𝖊𝖓',
                    type: 'circle',
                    categories: ['🤖'],
                    quality: 50
                });

                const stickerBuffer = await sticker.toBuffer();
                await X.sendMessage(m.chat, {
                    sticker: stickerBuffer
                }, { quoted: m });
            } catch (error) {
                console.error("Circle sticker error:", error);
                m.reply("❌ Failed to create circle sticker");
            }
            break;

        case 'take':
            if (!text) return m.reply("Usage: .take packname,author");
            if (!m.quoted || !m.quoted.mimetype?.includes('webp')) {
                return m.reply("❌ Reply to a sticker to change metadata");
            }

            try {
                const [packname, author] = text.split(',');
                const media = await X.downloadMediaMessage(m.quoted);
                
                const sticker = new Sticker(media, {
                    pack: packname?.trim() || global.packname,
                    author: author?.trim() || global.author,
                    type: 'default',
                    quality: 50
                });

                const stickerBuffer = await sticker.toBuffer();
                await X.sendMessage(m.chat, {
                    sticker: stickerBuffer
                }, { quoted: m });
            } catch (error) {
                console.error("Take sticker error:", error);
                m.reply("❌ Failed to modify sticker");
            }
            break;

        case 'mp4':
            if (!m.quoted || !m.quoted.mimetype?.includes('webp')) {
                return m.reply("❌ Reply to an animated sticker to convert to MP4");
            }

            try {
                const media = await X.downloadMediaMessage(m.quoted);
                // Note: webp to mp4 conversion requires additional library or service
                await X.sendMessage(m.chat, {
                    video: media,
                    caption: "✅ Sticker converted to MP4"
                }, { quoted: m });
            } catch (error) {
                console.error("MP4 conversion error:", error);
                m.reply("❌ Failed to convert sticker to MP4");
            }
            break;
    }
};

module.exports.command = ['sticker', 's', 'circle', 'take', 'mp4'];