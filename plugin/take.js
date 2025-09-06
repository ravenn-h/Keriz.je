// Plugin take.js - adapted for this bot structure
module.exports = {
  command: ["take", "mp4"],
  type: "sticker",
  owner: false,
  description: "Changes sticker pack & author name or converts animated sticker to video",
  execute: async ({ X, m, args, command, quoted }) => {
    if (command === "take") {
      if (!m.quoted || !m.quoted.message?.stickerMessage) {
        return m.reply("_Reply to a sticker_");
      }
      
      try {
        const media = await X.downloadMediaMessage(m.quoted);
        const packname = args.length > 0 ? args.join(" ").split(";")[0] : global.packname;
        const author = args.length > 0 && args.join(" ").includes(";") ? args.join(" ").split(";")[1] : global.author;
        
        await X.sendImageAsSticker(m.chat, media, m, {
          packname: packname,
          author: author
        });
      } catch (error) {
        console.error("Take error:", error);
        m.reply("❌ Failed to process sticker");
      }
    }
    
    if (command === "mp4") {
      if (!m.quoted || !m.quoted.message?.stickerMessage) {
        return m.reply("_Reply to an animated sticker!_");
      }
      
      try {
        const media = await X.downloadMediaMessage(m.quoted);
        
        // Convert webp to mp4 using sharp and ffmpeg
        const fs = require('fs');
        const path = require('path');
        const { exec } = require('child_process');
        
        const tempInput = `./tmp/sticker_${Date.now()}.webp`;
        const tempOutput = `./tmp/video_${Date.now()}.mp4`;
        
        fs.writeFileSync(tempInput, media);
        
        exec(`ffmpeg -i ${tempInput} -vcodec libx264 -pix_fmt yuv420p ${tempOutput}`, async (error) => {
          if (error) {
            console.error('MP4 conversion error:', error);
            if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
            return m.reply("❌ Conversion failed");
          }
          
          try {
            const videoBuffer = fs.readFileSync(tempOutput);
            await X.sendMessage(m.chat, {
              video: videoBuffer,
              caption: "✅ Animated sticker converted to video"
            }, { quoted: m });
            
            // Cleanup
            if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
            if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
          } catch (sendError) {
            console.error('Send error:', sendError);
            m.reply("❌ Failed to send video");
          }
        });
      } catch (error) {
        console.error("MP4 error:", error);
        m.reply("❌ Failed to process sticker");
      }
    }
  }
};