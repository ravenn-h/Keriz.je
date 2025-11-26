
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Owner Setting
global.owner = ["2250101676111",]
global.ownername = "𝕽𝖆𝖛𝖊𝖓"

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Bot Setting
global.botname = "Vrush-maria"
global.botver = "1.0.0"
global.idch = "120363400575205721@newsletter"
global.newsletterName = "𝗛𝗜𝗦𝗢𝗞𝗔-𝗠𝗗"
global.typebot = "Case X Plugin"
global.session = "session"
global.thumb = "https://files.catbox.moe/53nyn7.jpeg"
global.wagc = ""
global.welcome = false
global.adminevent = false
global.prefix = "." // ou tout autre préfixe souhaité
global.antiViewOnce = {}
global.autoRead = false
global.autoReadBroadcast = false
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Sticker Marker
global.packname = "Vrush-maria"
global.author = "𝕽𝖆𝖛𝖊𝖓"
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Respon Message
global.mess = {
    success: '✅ Done.',
    admin: '🚨 Admin only.',
    botAdmin: '🤖 Make me admin first.',
    OnlyOwner: '👑 Owner only.',
    OnlyGrup: '👥 Group only.',
    private: '📩 Private chat only.',
    wait: '⏳ Processing...',
    error: '⚠️ Error occurred.',
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// File Update
let fs = require('fs')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update File 📁 : ${__filename}`)
delete require.cache[file]
require(file)
})