//━━━━━━━━━━━━━━━━━━━━━━━━//
// Module
require("./setting")
const { default: makeWASocket, DisconnectReason, makeInMemoryStore, jidDecode, proto, getContentType, useMultiFileAuthState, downloadContentFromMessage } = require("@whiskeysockets/baileys")
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const readline = require("readline");
const _ = require('lodash')
const yargs = require('yargs/yargs')
const FileType = require('file-type')
const PhoneNumber = require('awesome-phonenumber')
const path = require('path')
const fetch = require("node-fetch") 
const { getBuffer } = require('./library/lib/myfunc')
const { imageToWebp, imageToWebp3, videoToWebp, writeExifImg, writeExifImgAV, writeExifVid } = require('./library/lib/exif')
//━━━━━━━━━━━━━━━━━━━━━━━━//
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Connexion Bot
const question = (text) => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); return new Promise((resolve) => { rl.question(text, resolve) }) };

async function Merilda() {
const { state, saveCreds } = await useMultiFileAuthState(session)
const X = makeWASocket({
logger: pino({ level: "silent" }),
printQRInTerminal: false,
auth: state,
connectTimeoutMs: 60000,
defaultQueryTimeoutMs: 0,
keepAliveIntervalMs: 10000,
emitOwnEvents: true,
fireInitQueries: true,
generateHighQualityLinkPreview: true,
syncFullHistory: true,
markOnlineOnConnect: true,
browser: ["Ubuntu", "Chrome", "20.0.04"],
});

if (!X.authState.creds.registered) {
const phoneNumber = await question('Entrez votre numéro WhatsApp :\n');
let code = await X.requestPairingCode(phoneNumber, 'XALICIAX');
code = code?.match(/.{1,4}/g)?.join("-") || code;
console.log(`Code :`, code);
}

store.bind(X.ev)

X.ev.on('messages.upsert', async chatUpdate => {
try {
mek = chatUpdate.messages[0]
if (!mek.message) return
mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
if (mek.key && mek.key.remoteJid === 'status@broadcast') return
if (!X.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
m = smsg(X, mek, store)
require("./socket")(X, m, chatUpdate, store)
} catch (err) {
console.log(err)
}
})

X.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server && decode.user + '@' + decode.server || jid
} else return jid
}

X.getName = (jid, withoutContact= false) => {
id = X.decodeJid(jid)
withoutContact = X.withoutContact || withoutContact 
let v
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {}
if (!(v.name || v.subject)) v = X.groupMetadata(id) || {}
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
})
else v = id === '0@s.whatsapp.net' ? {
id,
name: 'WhatsApp'
} : id === X.decodeJid(X.user.id) ?
X.user :
(store.contacts[id] || {})
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

X.public = true 

X.serializeM = (m) => smsg(X, m, store);
X.ev.on('connection.update', (update) => {
const { connection, lastDisconnect } = update;
if (connection === "close") {
let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
if (reason === DisconnectReason.badSession) {
console.log(`Fichier de session défaillant, veuillez supprimer le dossier AliceSession et tmp puis effectuer un nouveau jumelage`);
X.sendMessage('2250104610403@s.whatsapp.net', {
  text: `⚠️ Vrush-maria Déconnecté : ${reason}\nVeuillez vérifier le terminal ou réparer la session.`
});
  } else if (reason === DisconnectReason.connectionClosed) {
console.log("Connexion fermée, redémarrage en cours.....");
Merilda();
  } else if (reason === DisconnectReason.connectionLost) {
console.log("Connexion perdue avec le serveur, redémarrage en cours...");
Merilda();
  } else if (reason === DisconnectReason.connectionReplaced) {
console.log("Connexion remplacée, une nouvelle session a été ouverte, veuillez redémarrer le bot");
X.sendMessage('2250104610403@s.whatsapp.net', {
  text: `⚠️ Vrush-maria Déconnecté : ${reason}\nVeuillez vérifier le terminal ou réparer la session.`
});
  } else if (reason === DisconnectReason.loggedOut) {
console.log(`Appareil déconnecté, veuillez supprimer le dossier de session puis redémarrer le serveur.`);
X.sendMessage('225010167611@s.whatsapp.net', {
  text: `⚠️ Vrush-maria Déconnecté : ${reason}\nVeuillez vérifier le terminal ou réparer la session.`
});
  } else if (reason === DisconnectReason.restartRequired) {
console.log("Redémarrage du serveur....");
Merilda();
  } else if (reason === DisconnectReason.timedOut) {
console.log("Délai de connexion dépassé, reconnexion en cours ...");
Merilda();
  } else {
console.log(`Raison de déconnexion inconnue : ${reason}|${connection}`);
Merilda();
  }
} else if (connection === "open") {      
try {
X.newsletterFollow('120363400575205721@newsletter')
} catch (e) {
console.error("❌ Erreur lors du suivi du canal :", e);
}
X.sendMessage("2250104610403@s.whatsapp.net", {text: `Vrush-maria connecté avec succès ✅`})
console.log('[ Connecté ✅]' + JSON.stringify(X.user.id, null, 2));
}
});

X.ev.on('creds.update', saveCreds)

X.sendText = (jid, text, quoted = '', options) => X.sendMessage(jid, { text: text, ...options }, { quoted })

X.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        let type = await X.getFile(path, true)
        let {
            res,
            data: file,
            filename: pathFile
        } = type
        if (res && res.status !== 200 || file.length <= 65536) {
            try {
                throw {
                    json: JSON.parse(file.toString())
                }
            }
            catch (e) {
                if (e.json) throw e.json
            }
        }
        let opt = {
            filename
        }
        if (quoted) opt.quoted = quoted
        if (!type) options.asDocument = true
        let mtype = '',
            mimetype = type.mime,
            convert
        if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
        else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
        else if (/video/.test(type.mime)) mtype = 'video'
        else if (/audio/.test(type.mime)) {
            // Note: toPTT and toAudio functions need to be implemented
            mtype = 'audio'
            // convert = await (ptt ? toPTT : toAudio)(file, type.ext),
            // file = convert.data,
            // pathFile = convert.filename,
            // mimetype = 'audio/ogg; codecs=opus'
        }
        else mtype = 'document'
        if (options.asDocument) mtype = 'document'

        delete options.asSticker
        delete options.asLocation
        delete options.asVideo
        delete options.asDocument
        delete options.asImage

        let message = {
            ...options,
            caption,
            ptt,
            [mtype]: {
                url: pathFile
            },
            mimetype
        }
        let m
        try {
            m = await X.sendMessage(jid, message, {
                ...opt,
                ...options
            })
        }
        catch (e) {
            //console.error(e)
            m = null
        }
        finally {
            if (!m) m = await X.sendMessage(jid, {
                ...message,
                [mtype]: file
            }, {
                ...opt,
                ...options
            })
            file = null
            return m
        }
    }
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Paramètres de bienvenue

    X.ev.on('group-participants.update', async (anu) => {
        if (global.welcome){
console.log(anu)
try {
let metadata = await X.groupMetadata(anu.id)
let participants = anu.participants
for (let num of participants) {
try {
ppuser = await X.profilePictureUrl(num, 'image')
} catch (err) {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
try {
ppgroup = await X.profilePictureUrl(anu.id, 'image')
} catch (err) {
ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
}
memb = metadata.participants.length
groupwelcome = await getBuffer(ppuser)
groupleft = await getBuffer(ppuser)
                if (anu.action == 'add') {
                const Xbuffer = await getBuffer(ppuser)
                let XName = num
                    const members = metadata.participants.length
                Xbody = `
┏──────────────────────⏣ 
@${XName.split("@")[0]}
┣──────────────────────⏣
┣⛩️•   𝗕𝗶𝗲𝗻𝘃𝗲𝗻𝘂𝗲 𝗱𝗮𝗻𝘀 
┣${metadata.subject}
┣⛩️•   𝗠𝗲𝗺𝗯𝗿𝗲 : 
┣${members}ème
└───────────────┈ ⳹`
X.sendMessage(anu.id,
 { text: Xbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": groupwelcome,
"sourceUrl": `${wagc}`}}})
                } else if (anu.action == 'remove') {
                        const Xbuffer = await getBuffer(ppuser)
                        let XName = num
                    const Xmembers = metadata.participants.length
                    Xbody = `
┏──────────────────────⏣ 
┣@${XName.split("@")[0]}
┣──────────────────────⏣
┣⛩️•   𝗔 𝗾𝘂𝗶𝘁𝘁𝗲́  
┣${metadata.subject}
┣⛩️•   𝗠𝗲𝗺𝗯𝗿𝗲 : 
┣${members}ème
└───────────────┈ ⳹`
X.sendMessage(anu.id,
 { text: Xbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": groupleft,
"sourceUrl": `${wagc}`}}})
}
}
} catch (err) {
console.log(err)
}
}
})
//━━━━━━━━━━━━━━━━━━━━━//
    X.ev.on('group-participants.update', async (anu) => {
        if (global.adminevent){
console.log(anu)
try {
let participants = anu.participants
for (let num of participants) {
try {
ppuser = await X.profilePictureUrl(num, 'image')
} catch (err) {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
try {
ppgroup = await X.profilePictureUrl(anu.id, 'image')
} catch (err) {
ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
}
 if (anu.action == 'promote') {
let XName = num
Xbody = ` 
━━━━━━━━━━━━━━━━━━━━━
         *[ PROMOTION ]*
@${XName.split("@")[0]}, Félicitations ! Tu es maintenant *Admin* de ce groupe 
━━━━━━━━━━━━━━━━━━━━━`
   X.sendMessage(anu.id,
 { text: Xbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": groupwelcome,
"sourceUrl": `${wagc}`}}})
} else if (anu.action == 'demote') {
let XName = num
Xbody = `
━━━━━━━━━━━━━━━━━━━━━
         *[ RÉTROGRADATION ]*
@${XName.split("@")[0]}, Dommage ! Tu n'es plus *Admin* de ce groupe 
━━━━━━━━━━━━━━━━━━━━━`
X.sendMessage(anu.id,
 { text: Xbody,
 contextInfo:{
 mentionedJid:[num],
 "externalAdReply": {"showAdAttribution": true,
 "containsAutoReply": true,
 "title": ` ${global.botname}`,
"body": `${ownername}`,
 "previewType": "PHOTO",
"thumbnailUrl": ``,
"thumbnail": groupleft,
"sourceUrl": `${wagc}`}}})
}
}
} catch (err) {
console.log(err)
}
}
})
//━━━━━━━━━━━━━━━━━━━━━━━━//
// types de messages
X.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(quoted, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
let type = await FileType.fromBuffer(buffer)
// Generate safe filename if undefined
if (!filename || filename === 'undefined') {
  filename = `media_${Date.now()}`
}
// Ensure tmp directory exists
if (!fs.existsSync('./tmp')) {
  fs.mkdirSync('./tmp', { recursive: true })
}
let trueFileName = attachExtension ? (`./tmp/${filename}.${type.ext}`) : `./tmp/${filename}`
await fs.writeFileSync(trueFileName, buffer)
return trueFileName
}

X.sendStickerFromUrl = async(from, PATH, quoted, options = {}) => {
let { writeExif } = require('./tmp')
let types = await X.getFile(PATH, true)
let { filename, size, ext, mime, data } = types
let type = '', mimetype = mime, pathFile = filename
let media = { mimetype: mime, data }
pathFile = await writeExif(media, { packname: options.packname ? options.packname : packname, author: options.author ? options.author : '2250104610403', categories: options.categories ? options.categories : [] })
await fs.promises.unlink(filename)
await X.sendMessage(from, {sticker: {url: pathFile}}, {quoted})
return fs.promises.unlink(pathFile)
}

X.sendTextWithMentions = async (jid, text, quoted, options = {}) => X.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })

X.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
return buffer
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
X.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)}
await X.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer}

X.sendImageAsStickerAV = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImgAV(buff, options)
} else {
buffer = await imageToWebp2(buff)}
await X.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer}

X.sendImageAsStickerAvatar = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp3(buff)}
await X.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer}
 //📈————————————————————————— [ © 𝕽𝖆𝖛𝖊𝖓 ] —————————————————————————📉\\
X.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)}
await X.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer}
//━━━━━━━━━━━━━━━━━━━━━━━━//
//━━━━━━━━━━━━━━━━━━━━━━━━//

return X
}

Merilda()

function smsg(X, m, store) {
if (!m) return m
let M = proto.WebMessageInfo
if (m.key) {
m.id = m.key.id
m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
m.chat = m.key.remoteJid
m.fromMe = m.key.fromMe
m.isGroup = m.chat.endsWith('@g.us')
m.sender = X.decodeJid(m.fromMe && X.user.id || m.participant || m.key.participant || m.chat || '')
if (m.isGroup) m.participant = X.decodeJid(m.key.participant) || ''
}
if (m.message) {
m.mtype = getContentType(m.message)
m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
if (m.quoted) {
let type = getContentType(quoted)
m.quoted = m.quoted[type]
if (['productMessage'].includes(type)) {
type = getContentType(m.quoted)
m.quoted = m.quoted[type]
}
if (typeof m.quoted === 'string') m.quoted = {
text: m.quoted
}
m.quoted.mtype = type
m.quoted.id = m.msg.contextInfo.stanzaId
m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
m.quoted.sender = X.decodeJid(m.msg.contextInfo.participant)
m.quoted.fromMe = m.quoted.sender === X.decodeJid(X.user.id)
m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
m.getQuotedObj = m.getQuotedMessage = async () => {
if (!m.quoted.id) return false
let q = await store.loadMessage(m.chat, m.quoted.id, X)
 return exports.smsg(X, q, store)
}
let vM = m.quoted.fakeObj = M.fromObject({
key: {
remoteJid: m.quoted.chat,
fromMe: m.quoted.fromMe,
id: m.quoted.id
},
message: quoted,
...(m.isGroup ? { participant: m.quoted.sender } : {})
})
m.quoted.delete = () => X.sendMessage(m.quoted.chat, { delete: vM.key })
m.quoted.copyNForward = (jid, forceForward = false, options = {}) => X.copyNForward(jid, vM, forceForward, options)
m.quoted.download = () => X.downloadMediaMessage(m.quoted)
}
}
if (m.msg.url) m.download = () => X.downloadMediaMessage(m.msg)
m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? X.sendMedia(chatId, text, 'file', '', m, { ...options }) : X.sendText(chatId, text, m, { ...options })
m.copy = () => exports.smsg(X, M.fromObject(M.toObject(m)))
m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => X.copyNForward(jid, m, forceForward, options)

return m
}
//━━━━━━━━━━━━━━━━━━━━━━━━//
// Mise à jour de fichier
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Mise à jour du fichier 📁 : ${__filename}`)
delete require.cache[file]
require(file)
})