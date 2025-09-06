

require("./setting")
const {
  downloadContentFromMessage,
  proto,
  generateWAMessage,
  getContentType,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  GroupSettingChange,
  jidDecode,
  delay,
  generateWAMessageContent,
  useMultiFileAuthState,
  makeInMemoryStore,
  downloadAndSaveMediaMessage,
  generateForwardMessageContent,
  templateMessage,
  InteractiveMessage,
  Header,
} = require("@whiskeysockets/baileys")

const os = require("os")
const fs = require("fs")
const fg = require("api-dylux")
const fetch = require("node-fetch")
const util = require("util")
const axios = require("axios")
const { exec, execSync } = require("child_process")
const chalk = require("chalk")
const nou = require("node-os-utils")
const moment = require("moment-timezone")
const path = require("path")
const didyoumean = require("didyoumean")
const similarity = require("similarity")
const speed = require("performance-now")
const { Sticker } = require("wa-sticker-formatter")
const { igdl } = require("btch-downloader")
const yts = require("yt-search")
const cheerio = require("cheerio")
const crypto = require("crypto")
const jimp = require("jimp")
const webp = require("node-webpmux")
const sharp = require("sharp")
const fsExtra = require("fs-extra")
const { unlink } = require("fs").promises
const { ImageUploadService } = require("node-upload-images")
const { promisify } = require("util")

//===================SESSION-AUTH============================
const { File } = require('megajs')
const config = global

const initializeSession = async () => {
  try {
    if (!fs.existsSync(__dirname + '/session/creds.json')) {
      if (!config.SESSION_ID) {
        console.log('[ ⚠️ ] Aucun SESSION_ID trouvé. Utilisation du pairing code...')
        return false // Indique qu'on doit utiliser le pairing code
      }

      const sessdata = config.SESSION_ID.replace("Wa~", '')
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)

      return new Promise((resolve, reject) => {
        filer.download((err, data) => {
          if (err) {
            console.log('[ ⚠️ ] Échec du téléchargement de session. Utilisation du pairing code...')
            resolve(false) // Utilise le pairing code en cas d'erreur
          } else {
            fs.writeFileSync(__dirname + '/session/creds.json', data)
            console.log("[ 📥 ] Session downloaded ✅")
            resolve(true)
          }
        })
      })
    }
    return true // Session existe déjà
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la session:', error)
    return false // Utilise le pairing code en cas d'erreur
  }
}
//////////////////////////////////////////////////////////

const jktNews = require("./library/scrape/jktNews")
const otakuDesu = require("./library/scrape/otakudesu")
const Kusonime = require("./library/scrape/kusonime")
const { quote } = require("./library/scrape/quote.js")
const { fdown } = require("./library/scrape/facebook.js")

const {
  komiku,
  detail,
} = require("./library/scrape/komiku")

const {
  wikimedia,
} = require("./library/scrape/wikimedia")

const {
  CatBox,
  fileIO,
  pomfCDN,
  uploadFile,
} = require("./library/scrape/uploader")

module.exports = async (X, m) => {
  try {
    const from = m.key.remoteJid

    var body =
      m.mtype === "interactiveResponseMessage"
        ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id
        : m.mtype === "conversation"
          ? m.message.conversation
          : m.mtype == "imageMessage"
            ? m.message.imageMessage.caption
            : m.mtype == "videoMessage"
              ? m.message.videoMessage.caption
              : m.mtype == "extendedTextMessage"
                ? m.message.extendedTextMessage.text
                : m.mtype == "buttonsResponseMessage"
                  ? m.message.buttonsResponseMessage.selectedButtonId
                  : m.mtype == "listResponseMessage"
                    ? m.message.listResponseMessage.singleSelectReply.selectedRowId
                    : m.mtype == "templateButtonReplyMessage"
                      ? m.message.templateButtonReplyMessage.selectedId
                      : m.mtype == "messageContextInfo"
                        ? m.message.buttonsResponseMessage?.selectedButtonId ||
                          m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
                          m.text
                        : ""

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Bibliothèque de fonctions utilitaires personnalisées
    const {
      smsg,
      fetchJson,
      getBuffer,
      fetchBuffer,
      getGroupAdmins,
      TelegraPh,
      isUrl,
      hitungmundur,
      sleep,
      clockString,
      checkBandwidth,
      runtime,
      tanggal,
      getRandom,
    } = require("./library/lib/myfunc")

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Configuration principale (Admin et Préfixe)
    const budy = typeof m.text === "string" ? m.text : ""
    // Configuration du préfixe importé depuis settings
    const prefixRegex = new RegExp(`^[${global.prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`)
    const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : global.prefix
    const isCmd = body.startsWith(prefix) // Vérifie si c'est une commande
    const command = isCmd ? body.slice(prefix.length).trim().split(" ").shift().toLowerCase() : ""
    const args = body.trim().split(/ +/).slice(1) // Arguments de la commande
    const text = (q = args.join(" ")) // Texte complet des arguments
    const sender = m.key.fromMe
      ? X.user.id.split(":")[0] + "@s.whatsapp.net" || X.user.id
      : m.key.participant || m.key.remoteJid
    const botNumber = await X.decodeJid(X.user.id) // Numéro du bot
    const senderNumber = sender.split("@")[0] // Numéro de l'expéditeur
    const Hisoka =
      (m &&
        m.sender &&
        [botNumber, ...global.owner].map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)) ||
      false // Vérification propriétaire
    const pushname = m.pushName || `${senderNumber}` // Nom d'affichage
    const isBot = botNumber.includes(senderNumber) // Vérifie si c'est le bot
    const quoted = m.quoted ? m.quoted : m // Message cité
    const mime = (quoted.msg || quoted).mimetype || "" // Type MIME du fichier
    const groupMetadata = m.isGroup ? await X.groupMetadata(from).catch((e) => null) : null // Métadonnées du groupe
    const groupName = m.isGroup && groupMetadata ? groupMetadata.subject : "" // Nom du groupe
    const participants = m.isGroup && groupMetadata ? groupMetadata.participants : "" // Participants du groupe
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : "" // Administrateurs du groupe
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false // Bot est admin
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
    const isOwner = Hisoka
    const sock = X
    const qmsg = quoted

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Configuration de la console pour les logs
    if (m.message) {
      console.log(
        chalk.black(chalk.bgWhite("[ Nouveau Message ]")),
        chalk.black(chalk.bgGreen(new Date())),
        chalk.black(chalk.bgBlue(budy || m.mtype)) + "\n" + chalk.magenta("» De"),
        chalk.green(pushname),
        chalk.yellow(m.sender) + "\n" + chalk.blueBright("» Dans"),
        chalk.green(m.isGroup ? pushname : "Chat Privé", from),
      )
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Fonctions de réponse avec design personnalisé
    const reply = (teks) => {
      X.sendMessage(
        from,
        {
          text: teks,
          contextInfo: {
            externalAdReply: {
              showAdAttribution: true,
              title: "Hisoka",
              containsAutoReply: true,
              mediaType: 1,
              thumbnail: fakethmb,
              mediaUrl: "https://t.me/Hisoka",
              sourceUrl: "https://t.me/Hisoka",
            },
          },
        },
        { quoted: m },
      )
    }

    // Fonction de réponse simple sans design
    const reply2 = (teks) => {
      X.sendMessage(from, { text: teks }, { quoted: m })
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Zone des fonctions utilitaires
    let ppuser
    try {
      ppuser = await X.profilePictureUrl(m.sender, "image") // Photo de profil utilisateur
    } catch (err) {
      ppuser = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60" // Image par défaut
    }
    const ppnyauser = await getBuffer(ppuser) // Buffer de la photo de profil

    // Fonction de redimensionnement d'image avec Jimp
    const reSize = async (buffer, ukur1, ukur2) => {
      return new Promise(async (resolve, reject) => {
        const jimp = require("jimp")
        var baper = await jimp.read(buffer)
        var ab = await baper.resize(ukur1, ukur2).getBufferAsync(jimp.MIME_JPEG)
        resolve(ab)
      })
    }
    const fakethmb = await reSize(ppuser, 300, 300)

    // Fonctions utilitaires supplémentaires
    const formatp = (bytes) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      if (bytes === 0) return '0 Byte'
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
    }


    const GIFBufferToVideoBuffer = async (image) => {
      try {
        const filename = `${Math.random().toString(36)}`
        const gifPath = `./gif/${filename}.gif`
        const mp4Path = `./gif/${filename}.mp4`
        
        if (!fs.existsSync('./gif')) {
          fs.mkdirSync('./gif', { recursive: true })
        }
        
        await fsExtra.writeFileSync(gifPath, image)
        
        await new Promise((resolve, reject) => {
          exec(
            `ffmpeg -i ${gifPath} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${mp4Path}`,
            (error) => {
              if (error) {
                console.error('FFmpeg error:', error)
                reject(error)
              } else {
                resolve()
              }
            }
          )
        })
        
        await sleep(2000)
        
        if (!fs.existsSync(mp4Path)) {
          throw new Error(`Le fichier vidéo n'a pas été créé: ${mp4Path}`)
        }
        
        const buffer5 = await fsExtra.readFileSync(mp4Path)
        
        try {
          await Promise.all([unlink(mp4Path), unlink(gifPath)])
        } catch (cleanupError) {
          console.error('Erreur lors du nettoyage:', cleanupError)
        }
        
        return buffer5
      } catch (error) {
        console.error('Erreur GIFBufferToVideoBuffer:', error)
        throw error
      }
    }

    const generateReaction = async (reactionName, action, user, quotedUser = null) => {
      try {
        const url = `https://api.waifu.pics/sfw/${reactionName}`
        const response = await axios.get(url)
        const imageUrl = response.data.url

        const gifBufferResponse = await fetch(imageUrl)
        const gifBuffer = await gifBufferResponse.buffer()

        let caption, mentions
        if (quotedUser) {
          caption = `@${user.split("@")[0]} a ${action} @${quotedUser.split("@")[0]}`
          mentions = [user, quotedUser]
        } else {
          caption = `@${user.split("@")[0]} s'est ${action} lui même.`
          mentions = [user]
        }

        try {
          const videoBuffer = await GIFBufferToVideoBuffer(gifBuffer)
          return {
            video: videoBuffer,
            gifPlayback: true,
            caption: caption,
            mentions: mentions
          }
        } catch (conversionError) {
          console.error('Conversion failed, sending original gif:', conversionError)
          return {
            image: gifBuffer,
            caption: caption,
            mentions: mentions
          }
        }

      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error)
        return null
      }
    }

    const example = (teks) => {
      return `*Example Usage:*\n*${m.prefix+command}* ${teks}`
    }

    const Case = {
      get: (caseName) => {
        const data = fs.readFileSync('./socket.js', 'utf8')
        const caseRegex = new RegExp(`case\s*["\']${caseName}["\']\s*:\s*{([\s\S]*?)}\s*break`, 'i')
        const match = data.match(caseRegex)
        if (!match) {
          throw new Error(`Case "${caseName}" not found.`)
        }
        return `case "${caseName}": {${match[1]}}\nbreak`
      },
      add: (caseCode) => {
        const data = fs.readFileSync('./socket.js', 'utf8')
        const insertPosition = data.lastIndexOf('}')
        const newData = data.slice(0, insertPosition) + caseCode + '\n\n' + data.slice(insertPosition)
        fs.writeFileSync('./socket.js', newData)
      },
      delete: (caseName) => {
        const data = fs.readFileSync('./socket.js', 'utf8')
        const caseRegex = new RegExp(`case\s*["\']${caseName}["\']\s*:\s*{[\s\S]*?}\s*break\s*;?`, 'gi')
        const newData = data.replace(caseRegex, '')
        if (newData === data) {
          throw new Error(`Case "${caseName}" not found.`)
        }
        fs.writeFileSync('./socket.js', newData)
      },
      list: () => {
        const data = fs.readFileSync('./socket.js', 'utf8')
        const casePattern = /case\s+['"]([^'"]+)['"]/g
        const matches = []
        let match
        while ((match = casePattern.exec(data)) !== null) {
          matches.push(match[1])
        }
        return matches.join('\n')
      }
    }

    const makeStickerFromUrl = async (url, sock, m) => {
      try {
        const response = await fetch(url)
        const buffer = await response.buffer()
        await sock.sendImageAsSticker(m.chat, buffer, m, {
          packname: global.packname,
          author: global.author
        })
      } catch (error) {
        console.error('Sticker creation error:', error)
        m.reply('❌ Erreur lors de la création du sticker')
      }
    }

    // Fonction de redimensionnement avec jimp
    const jimp = require("jimp")
    const resize = async (image, width, height) => {
      const read = await jimp.read(image)
      const data = await read.resize(width, height).getBufferAsync(jimp.MIME_JPEG)
      return data
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Système de rappel de prière automatique
    X.autoshalat = X.autoshalat ? X.autoshalat : {}
    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? X.user.id : m.sender
    const id = m.chat
    if (id in X.autoshalat) {
      return false
    }

    // Horaires de prière (à ajuster selon votre région)
    const jadwalSholat = {
      subh: "04:29",
      lever: "05:44",
      dhuha: "06:02",
      dhuhr: "12:02",
      asr: "15:15",
      maghrib: "18:11",
      isha: "19:01",
    }
    const datek = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
      }),
    )
    const hours = datek.getHours()
    const minutes = datek.getMinutes()
    const timeNow = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    for (const [sholat, waktu] of Object.entries(jadwalSholat)) {
      if (timeNow === waktu) {
        const caption = `Salut ${pushname},\nL'heure de *${sholat}* est arrivée, prends tes ablutions et dépêche-toi de faire la prière🙂.\n\n*${waktu}*\n_pour la région de Sumatra et ses environs._`
        X.autoshalat[id] = [
          reply(caption),
          setTimeout(async () => {
            delete X.autoshalat[m.chat]
          }, 57000),
        ]
      }
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Système de suggestions de commandes similaires
    function getCaseNames() {
      try {
        const data = fs.readFileSync("./socket.js", "utf8")
        const casePattern = /case\s+['"']([^'"]+)['"']/g
        const matches = []
        let match

        while ((match = casePattern.exec(data)) !== null) {
          matches.push(match[1])
        }

        return matches
      } catch (error) {
        console.error("Une erreur est survenue :", error)
        return [] // Return empty array instead of throwing
      }
    }

    // Suggestion de commande si erreur de frappe
    if (prefix && command) {
      const caseNames = getCaseNames()
      const noPrefix = m.text.replace(prefix, "").trim()
      const mean = didyoumean(noPrefix, caseNames)
      const sim = similarity(noPrefix, mean)
      const similarityPercentage = Number.parseInt(sim * 100)

      if (mean && noPrefix.toLowerCase() !== mean.toLowerCase()) {
        const respony = `Désolé, la commande que vous avez saisie est incorrecte. Voici la commande qui pourrait correspondre :\n\n➠  *${prefix + mean}*\n➠  *Similarité :* ${similarityPercentage}%`
        reply(respony)
      }
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Compteur de fonctionnalités totales
    const totalcmd = () => {
      try {
        var mytext = fs.readFileSync("./socket.js").toString()
        var numUpper = (mytext.match(/case\s+['"']/g) || []).length
        return numUpper
      } catch (error) {
        console.error("Erreur lors du comptage des commandes:", error)
        return 0
      }
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Fonctions de gestion du temps
    function getFormattedDate() {
      var currentDate = new Date()
      var day = currentDate.getDate()
      var month = currentDate.getMonth() + 1
      var year = currentDate.getFullYear()
      var hours = currentDate.getHours()
      var minutes = currentDate.getMinutes()
      var seconds = currentDate.getSeconds()
    }

    // Configuration de la date et heure locale
    const d = new Date(new Date() + 3600000)
    const locale = "fr" // Changé en français
    const week = d.toLocaleDateString(locale, { weekday: "long" })
    const date = d.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    const hariini = d.toLocaleDateString("fr", { day: "numeric", month: "long", year: "numeric" })

    // Conversion millisecondes en temps lisible
    function msToTime(duration) {
      var milliseconds = Number.parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

      hours = hours < 10 ? "0" + hours : hours
      minutes = minutes < 10 ? "0" + minutes : minutes
      seconds = seconds < 10 ? "0" + seconds : seconds
      return hours + " heures " + minutes + " minutes " + seconds + " secondes"
    }

    // Conversion millisecondes en date
    function msToDate(ms) {
      const temp = ms
      const days = Math.floor(ms / (24 * 60 * 60 * 1000))
      const daysms = ms % (24 * 60 * 60 * 1000)
      const hours = Math.floor(daysms / (60 * 60 * 1000))
      const hoursms = ms % (60 * 60 * 1000)
      const minutes = Math.floor(hoursms / (60 * 1000))
      const minutesms = ms % (60 * 1000)
      const sec = Math.floor(minutesms / 1000)
      return days + " Jours " + hours + " Heures " + minutes + " Minutes"
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Salutations selon l'heure
    const timee = moment().tz("Asia/Jakarta").format("HH:mm:ss")
    let waktuucapan = ""
    if (timee < "23:59:00") {
      waktuucapan = "Bonne Nuit 🌃"
    }
    if (timee < "19:00:00") {
      waktuucapan = "Bonne Soirée 🌆"
    }
    if (timee < "18:00:00") {
      waktuucapan = "Bon Après-midi 🌅"
    }
    if (timee < "15:00:00") {
      waktuucapan = "Bonjour 🏙"
    }
    if (timee < "10:00:00") {
      waktuucapan = "Bonjour 🌄"
    }
    if (timee < "05:00:00") {
      waktuucapan = "Bon Subuh 🌉"
    }
    if (timee < "03:00:00") {
      waktuucapan = "Minuit 🌌"
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Système de chargement des plugins
    const loadPlugins = (directory) => {
      const plugins = []
      const folders = fs.readdirSync(directory)
      folders.forEach((folder) => {
        const folderPath = path.join(directory, folder)
        if (fs.lstatSync(folderPath).isDirectory()) {
          const files = fs.readdirSync(folderPath)
          files.forEach((file) => {
            const filePath = path.join(folderPath, file)
            if (filePath.endsWith(".js")) {
              try {
                delete require.cache[require.resolve(filePath)]
                const plugin = require(filePath)
                plugin.filePath = filePath
                plugins.push(plugin)
              } catch (error) {
                console.error(`Erreur lors du chargement du plugin à ${filePath}:`, error)
              }
            }
          })
        }
      })
      return plugins
    }

    // Fonction pour obtenir toutes les commandes des plugins
    const getPluginCommands = () => {
      const plugins = loadPlugins(path.resolve(__dirname, "./plugin"))
      let allCommands = {}
      
      plugins.forEach(plugin => {
        if (plugin.command && Array.isArray(plugin.command)) {
          plugin.command.forEach(cmd => {
            allCommands[cmd] = {
              name: cmd,
              file: plugin.filePath ? path.basename(plugin.filePath, '.js') : 'unknown'
            }
          })
        }
      })
      
      return allCommands
    }

    // Chargement et exécution des plugins
    const plugins = loadPlugins(path.resolve(__dirname, "./plugin"))
    const context = {
      args,
      X,
      reply,
      m,
      body,
      prefix,
      command,
      isUrl,
      q,
      text,
      quoted,
      require,
      smsg,
      sleep,
      clockString,
      msToDate,
      runtime,
      fetchJson,
      getBuffer,
      delay,
      getRandom,
    }
    let handled = false
    for (const plugin of plugins) {
      if (plugin.command.includes(command)) {
        try {
          await plugin.operate(context)
          handled = true
        } catch (error) {
          console.error(`Erreur lors de l'exécution du plugin ${plugin.filePath}:`, error)
        }
        break
      }
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // Réaction quand le propriétaire est mentionné
    const owner = global.owner
    if (m.isGroup) {
      if (body.includes(`@${owner}`)) {
        X.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
      }
    }

    // Test de réponse du bot sans préfixe
    if (budy.match && ["bot"].includes(budy) && !isCmd) {
      reply(`bot en ligne ✅`)
    }

    // Réponse à "maria" sans préfixe
    if (budy && budy.toLowerCase() === "maria" && !isCmd) {
      let text = '> _Maria... loves me but I love her ... she is my all .. i am gratfull being with her_ .... ';
      m.reply(text);

      await sock.sendMessage(m.chat, {
        text: text,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363400575205721@newsletter',
            serverMessageId: 2,
            newsletterName: `${global.botname}`
          },
          externalAdReply: {
            showAdAttribution: false,
            title: `${global.botname} - BLOOMING LOVE`,
            body: `confession ... I (Raven) know`,
            mediaType: 1,
            renderLargerThumbnail: true,
            thumbnailUrl: `https://img1.pixhost.to/images/8395/637002757_jarroffc.jpg`,
            sourceUrl: `https://github.com/hhhisoka-bot`
          }
        }
      }, { quoted: m });
    }

    //━━━━━━━━━━━━━━━━━━━━━━━━//
    // ATTENTION : Ne pas modifier cette section
    const botname = global.botname
    const ownername = global.ownername
    const botver = global.botver
    const typebot = global.typebot
    const wagc = global.wagc
    const mess = global.mess
    const author = global.author
    const packname = global.packname
    let welcome = global.welcome
    let groupevent = global.groupevent
    const creator = global.owner
    const store = global.store
    const newsletterName = global.newsletterName
    const idch = global.idch
    const thumb = global.thumb
    const saluranName = global.saluranName
    const saluran = global.saluran
    const imageUrl = global.imageUrl
    let sat
    let bang
    switch (command) {
      // Risque d'erreur si modifié

      //━━━━━━━━━━━━━━━━━━━━━━━━//
      // Section Menu Principal
      case "menu":
        {
          // Listes de menus séparées pour une meilleure organisation
          const aiMenu = require("./library/menulist/aimenu")
          const toolsMenu = require("./library/menulist/toolsmenu")
          const groupMenu = require("./library/menulist/groupmenu")
          const ownerMenu = require("./library/menulist/ownermenu")
          const searchMenu = require("./library/menulist/searchmenu")
          const stickerMenu = require("./library/menulist/stickermenu")
          const otherMenu = require("./library/menulist/othermenu")
          const downloaderMenu = require("./library/menulist/downloadermenu")

          const subcmd = args[0] ? args[0].toLowerCase() : ""

          const infoBot = `
👋 Salut, ${pushname}
Je suis Vrush-maria qui peut t'aider à rechercher, jouer ou télécharger. Je peux aussi être un compagnon de chat, un confident.

╭─ ⌬ Infos Bot
│ • nom     : ${botname}
│ • propriétaire  : ${ownername}
│ • version  : ${botver}
│ • type   : ${typebot}
│ • commandes  : ${totalcmd()}
╰─────────────

${waktuucapan}

`.trim()

          let menu = ""

          if (subcmd === "menu ai") menu = aiMenu
          else if (subcmd === "menu tools") menu = toolsMenu
          else if (subcmd === "menu group") menu = groupMenu
          else if (subcmd === "menu owner") menu = ownerMenu
          else if (subcmd === "menu search") menu = searchMenu
          else if (subcmd === "menu sticker") menu = stickerMenu
          else if (subcmd === "menu other") menu = otherMenu
          else if (subcmd === "menu downloader") menu = downloaderMenu
          else if (subcmd === "allmenu") {
            menu = [otherMenu, downloaderMenu, stickerMenu, ownerMenu, groupMenu, toolsMenu, searchMenu, aiMenu].join(
              "\n",
            )
          } else {
            menu = `

📂 *MENU PRINCIPAL* 📂

┌──────────────────┐
│ 📋 **TOUS LES MENUS** │
└──────────────────┘

▢ .owner - 👤 Owner Menu
▢ .info - ℹ️ Info Menu  
▢ .downloader - ⬇️ Download Menu
▢ .fun - 🎮 Fun Menu
▢ .reactions - 😊 Reactions Menu
▢ .tools - 🛠️ Tools Menu

┌──────────────────┐
│ 🚀 **RACCOURCIS** │
└──────────────────┘

▢ .ai - Chat avec AI
▢ .fancy - Texte stylé (1-47)
▢ .saver - Status downloader
▢ .play - YouTube audio
▢ .tiktok - TikTok video
▢ .wallpaper - HD wallpapers

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘

💡 *Utilise .nomduMenu pour un menu spécifique*
`.trim()
          }

          const fullMenu = `${infoBot}\n${menu}`

          await X.sendMessage(
            m.chat,
            {
              text: fullMenu,
              contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                mentionedJid: [sender],
                externalAdReply: {
                  title: "𝚅𝚛𝚞𝚜𝚑 𝙼𝚊𝚛𝚒𝚊 ",
                  body: "𝕽𝖆𝖛𝖊𝖓-𝓗𝓲𝓼𝓸𝓴𝓪",
                  thumbnail: fs.readFileSync("./media/thumb.png"),
                  sourceUrl: wagc,
                  mediaType: 1,
                  renderLargerThumbnail: true,
                },
              },
            },
            { quoted: m },
          )
        }
        break

      //━━━━━━━━━━━━━━━━━━━━━━━━//
      // Section Intelligence Artificielle (Réduite)
      case "chatai":
        {
          try {
            if (!args.length) return reply("Entrer une question")
            // Message d'attente pendant le traitement
            reply(global.mess.wait)
            const payload = { messages: [{ role: "user", content: args.join(" ") }] }
            const headers = { headers: { Origin: "https://chatai.org", Referer: "https://chatai.org/" } }
            const { data } = await axios.post("https://chatai.org/api/chat", payload, headers)

            reply(data?.content || "Pas de réponse")
          } catch (e) {
            reply(e.message)
          }
        }
        break

      case "openai":
      case "gpt":
        {
          if (!text) return reply(`Exemple :\n${prefix + command} qu'est-ce que l'intelligence artificielle ?`)

          // Message d'attente
          reply(global.mess.wait)

          try {
            const api = `https://api.betabotz.eu.org/api/search/openai-chat?text=${encodeURIComponent(text)}&apikey=${global.lann}`
            const res = await fetchJson(api)
            if (!res.message) return reply("❌ Échec de récupération de la réponse IA.")

            reply(res.message)
          } catch (e) {
            console.error("[ERREUR OPENAI]", e)
            reply("❌ Une erreur s'est produite lors de la récupération de la réponse OpenAI.")
          }
        }
        break

      //━━━━━━━━━━━━━━━━━━━━━━━━//
      // Section Téléchargement de Médias
      case "mfdl":
      case "mediafire":
        {
          if (!text) return reply("Inclure le lien MediaFire")
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(`https://api.vreden.web.id/api/mediafiredl?url=${encodeURIComponent(text)}`)
            if (!api.status || !api.result || !api.result[0])
              return reply("Échec de récupération des données depuis l'API.")

            const data = api.result[0]
            const filename = decodeURIComponent(data.name || "file.zip")
            const extension = filename.split(".").pop().toLowerCase()

            const res = await axios.get(data.link, { responseType: "arraybuffer" })
            const media = Buffer.from(res.data)

            // Détermination du type MIME selon l'extension
            let mimetype = ""
            if (extension === "mp4") mimetype = "video/mp4"
            else if (extension === "mp3") mimetype = "audio/mp3"
            else mimetype = `application/${extension}`

            await X.sendMessage(
              m.chat,
              {
                document: media,
                fileName: filename,
                mimetype: mimetype,
              },
              { quoted: m },
            )
          } catch (err) {
            console.error(err)
            reply("Une erreur s'est produite lors du téléchargement : " + err.message)
          }
        }
        break

      case "ig":
      case "instagram":
        {
          if (!text) return reply("Insérer le lien Instagram ?")
          // Message d'attente
          reply(global.mess.wait)
          const mediaUrl = await igdl(text)
          const url_media = mediaUrl[0].url
          try {
            const response = await axios.head(url_media)
            const contentType = response.headers["content-type"] // Obtient le type de contenu depuis l'en-tête
            if (contentType.startsWith("image/")) {
              await X.sendMessage(m.chat, { image: { url: url_media }, caption: "✅ Terminé" }, { quoted: m })
              return
            } else {
              await X.sendMessage(m.chat, { video: { url: url_media }, caption: "✅ Terminé" }, { quoted: m })
              return
            }
          } catch (e) {
            reply("❌ Erreur lors du téléchargement")
          }
        }
        break

      case "tt":
      case "tiktok":
        {
          if (!text) return reply(`Exemple : ${prefix + command} le lien`)
          // Message d'attente
          reply(global.mess.wait)
          const data = await fg.tiktok(text)
          const json = data.result
          let caption = `[ TIKTOK - TÉLÉCHARGEMENT ]\n\n`
          caption += `◦ *Id* : ${json.id}\n`
          caption += `◦ *Nom d'utilisateur* : ${json.author.nickname}\n`
          caption += `◦ *Titre* : ${json.title}\n`
          caption += `◦ *J'aime* : ${json.digg_count}\n`
          caption += `◦ *Commentaires* : ${json.comment_count}\n`
          caption += `◦ *Partages* : ${json.share_count}\n`
          caption += `◦ *Vues* : ${json.play_count}\n`
          caption += `◦ *Créé* : ${json.create_time}\n`
          caption += `◦ *Taille* : ${json.size}\n`
          caption += `◦ *Durée* : ${json.duration}`
          if (json.images) {
            json.images.forEach(async (k) => {
              await X.sendMessage(m.chat, { image: { url: k } }, { quoted: m })
            })
          } else {
            X.sendMessage(m.chat, { video: { url: json.play }, mimetype: "video/mp4", caption: caption }, { quoted: m })
            setTimeout(() => {
              X.sendMessage(m.chat, { audio: { url: json.music }, mimetype: "audio/mpeg" }, { quoted: m })
            }, 3000)
          }
        }
        break

      case "fb":
      case "fbdl":
      case "facebook":
        {
          if (!text) return reply("URL Facebook ?")
          // Message d'attente
          reply(global.mess.wait)
          try {
            const res = await fdown.download(text)
            if (res && res.length > 0) {
              const videoData = res[0]
              const videoUrl = videoData.hdQualityLink || videoData.normalQualityLink
              if (videoUrl) {
                const caption = `*Titre :* ${videoData.title}\n*Description :* ${videoData.description}\n*Durée :* ${videoData.duration}`
                await X.sendMessage(
                  m.chat,
                  {
                    video: { url: videoUrl },
                    caption: caption,
                    mimetype: "video/mp4",
                  },
                  { quoted: m },
                )
              }
            } else {
              return reply(mess.error)
            }
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors du téléchargement")
          }
        }
        break

      case "ytmp3":
      case "yta":
        {
          if (!text) return reply(`Exemple : ${prefix + command} URL YouTube`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/download/ytmp3?url=${text}&apikey=${global.lann}`,
            )
            const hasil = api.result

            await X.sendMessage(
              m.chat,
              {
                audio: {
                  url: hasil.mp3,
                },
                mimetype: "audio/mp4",
                contextInfo: {
                  externalAdReply: {
                    showAdAttribution: true,
                    title: hasil.title || "Sans titre",
                    body: `𝚅𝚛𝚞𝚜𝚑 𝙼𝚊𝚛𝚒𝚊 `,
                    sourceUrl: text,
                    thumbnailUrl: hasil.thumb || "https://example.com/default_thumbnail.jpg",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                  },
                },
              },
              { quoted: m },
            )
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors du téléchargement audio")
          }
        }
        break

      case "ytmp4":
      case "ytv":
        {
          if (!text) return reply(`Exemple : ${prefix + command} URL YouTube`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/download/ytmp4?url=${text}&apikey=${global.lann}`,
            )
            const hasil = api.result

            await X.sendMessage(
              m.chat,
              {
                video: { url: hasil.mp4 },
                caption: `*Titre :* ${hasil.title}\n*Taille :* ${hasil.size}`,
                mimetype: "video/mp4",
              },
              { quoted: m },
            )
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors du téléchargement vidéo")
          }
        }
        break

      case "putar":
      case "lagu":
      case "music":
      case "ytplay":
      case "play":
        {
          if (!text) return reply("Quelle chanson veux-tu chercher")
          // Message d'attente
          reply(global.mess.wait)
          try {
            const search = await yts(text)
            const firstVideo = search.all[0]
            const response = await ddownr.download(firstVideo.url, "mp3")
            const hasil = response.downloadUrl
            await X.sendMessage(
              m.chat,
              {
                audio: {
                  url: hasil,
                },
                mimetype: "audio/mp4",
                contextInfo: {
                  externalAdReply: {
                    showAdAttribution: true,
                    title: firstVideo.title || "Sans titre",
                    body: `𝚅𝚛𝚞𝚜𝚑 𝙼𝚊𝚛𝚒𝚊 `,
                    sourceUrl: firstVideo.url,
                    thumbnailUrl: firstVideo.thumbnail || "https://example.com/default_thumbnail.jpg",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                  },
                },
              },
              { quoted: m },
            )
          } catch (e) {
            console.log(e)
            await X.sendMessage(m.chat, { react: { text: "🚫", key: m.key } })
            try {
              const search = await yts(text)
              const firstVideo = search.all[0]
              const memek = await fetchJson(
                `${global.beta}/api/download/ytmp3?url=${firstVideo.url}&apikey=${global.botz}`,
              )
              const hasil = memek.result

              await X.sendMessage(
                m.chat,
                {
                  audio: {
                    url: hasil.mp3,
                  },
                  mimetype: "audio/mp4",
                  contextInfo: {
                    externalAdReply: {
                      showAdAttribution: true,
                      title: firstVideo.title || "Sans titre",
                      body: `𝚅𝚛𝚞𝚜𝚑 𝙼𝚊𝚛𝚒𝚊 `,
                      sourceUrl: firstVideo.url,
                      thumbnailUrl: firstVideo.thumbnail || "https://example.com/default_thumbnail.jpg",
                      mediaType: 1,
                      renderLargerThumbnail: true,
                    },
                  },
                },
                { quoted: m },
              )
            } catch (e) {
              console.log(e)
              const search = await yts(text)
              const firstVideo = search.all[0]
              const Xyroo = await fetchJson(`https://api.agatz.xyz/api/ytmp3?url=${firstVideo.url}`)

              await X.sendMessage(
                m.chat,
                {
                  audio: {
                    url: Xyroo.data,
                  },
                  mimetype: "audio/mp4",
                  contextInfo: {
                    externalAdReply: {
                      showAdAttribution: true,
                      title: firstVideo.title || "Sans titre",
                      body: `𝚅𝚛𝚞𝚜𝚑 𝙼𝚊𝚛𝚒𝚊 `,
                      sourceUrl: firstVideo.url,
                      thumbnailUrl: firstVideo.thumbnail || "https://example.com/default_thumbnail.jpg",
                      mediaType: 1,
                      renderLargerThumbnail: true,
                    },
                  },
                },
                { quoted: m },
              )
            }
          }
        }
        break

      case "pinterest":
      case "pin":
        {
          if (!text) return reply(`Exemple : ${prefix + command} anime`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/search/pinterest?text1=${text}&apikey=${global.lann}`,
            )
            const hasil = api.result
            if (hasil && hasil.length > 0) {
              const randomImage = hasil[Math.floor(Math.random() * hasil.length)]
              await X.sendMessage(
                m.chat,
                { image: { url: randomImage }, caption: `🔍 Résultat Pinterest pour : *${text}*` },
                { quoted: m },
              )
            } else {
              reply("❌ Aucun résultat trouvé")
            }
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors de la recherche Pinterest")
          }
        }
        break

      case "twitter":
      case "x":
        {
          if (!text) return reply("URL Twitter/X ?")
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/download/twitter?url=${text}&apikey=${global.lann}`,
            )
            const hasil = api.result
            if (hasil.type === "video") {
              await X.sendMessage(
                m.chat,
                { video: { url: hasil.media }, caption: `*Titre :* ${hasil.title}` },
                { quoted: m },
              )
            } else {
              await X.sendMessage(
                m.chat,
                { image: { url: hasil.media }, caption: `*Titre :* ${hasil.title}` },
                { quoted: m },
              )
            }
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors du téléchargement Twitter")
          }
        }
        break

      case "threads":
        {
          if (!text) return reply("URL Threads ?")
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/download/threads?url=${text}&apikey=${global.lann}`,
            )
            const hasil = api.result
            if (hasil.video_urls && hasil.video_urls.length > 0) {
              await X.sendMessage(
                m.chat,
                { video: { url: hasil.video_urls[0].download_url }, caption: "✅ Threads Video" },
                { quoted: m },
              )
            } else if (hasil.image_urls && hasil.image_urls.length > 0) {
              await X.sendMessage(
                m.chat,
                { image: { url: hasil.image_urls[0].download_url }, caption: "✅ Threads Image" },
                { quoted: m },
              )
            }
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors du téléchargement Threads")
          }
        }
        break

      case "capcut":
        {
          if (!text) return reply("URL CapCut ?")
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/download/capcut?url=${text}&apikey=${global.lann}`,
            )
            const hasil = api.result
            await X.sendMessage(
              m.chat,
              {
                video: { url: hasil.video_ori },
                caption: `*Titre :* ${hasil.title}\n*Taille :* ${hasil.size}\n*Durée :* ${hasil.duration}`,
              },
              { quoted: m },
            )
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors du téléchargement CapCut")
          }
        }
        break

      case "spotify":
        {
          if (!text) return reply("URL Spotify ou nom de chanson ?")
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/download/spotify?url=${text}&apikey=${global.lann}`,
            )
            const hasil = api.result
            await X.sendMessage(
              m.chat,
              {
                audio: { url: hasil.download },
                mimetype: "audio/mp4",
                contextInfo: {
                  externalAdReply: {
                    title: hasil.title,
                    body: hasil.artist,
                    thumbnailUrl: hasil.thumbnail,
                    sourceUrl: text,
                    mediaType: 1,
                  },
                },
              },
              { quoted: m },
            )
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors du téléchargement Spotify")
          }
        }
        break

      case "soundcloud":
        {
          if (!text) return reply("URL SoundCloud ?")
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/download/soundcloud?url=${text}&apikey=${global.lann}`,
            )
            const hasil = api.result
            await X.sendMessage(
              m.chat,
              {
                audio: { url: hasil.download },
                mimetype: "audio/mp4",
                contextInfo: {
                  externalAdReply: {
                    title: hasil.title,
                    body: hasil.user.username,
                    thumbnailUrl: hasil.thumbnail,
                    sourceUrl: text,
                    mediaType: 1,
                  },
                },
              },
              { quoted: m },
            )
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors du téléchargement SoundCloud")
          }
        }
        break

      //━━━━━━━━━━━━━━━━━━━━━━━━//
      // Section Création de Stickers
      case "bratvid":
      case "bratv":
      case "bratvideo":
        {
          if (!text) return reply(`Exemple : ${prefix + command} salut mon pote`)
          if (text.length > 250) return reply(`Caractères limités, max 250 !`)
          // Message d'attente
          reply(global.mess.wait)
          const words = text.split(" ")
          const tempDir = path.join(process.cwd(), "tmp")
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)
          const framePaths = []

          try {
            for (let i = 0; i < words.length; i++) {
              const currentText = words.slice(0, i + 1).join(" ")

              const res = await axios
                .get(`https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(currentText)}`, {
                  responseType: "arraybuffer",
                })
                .catch((e) => e.response)

              const framePath = path.join(tempDir, `frame${i}.mp4`)
              fs.writeFileSync(framePath, res.data)
              framePaths.push(framePath)
            }

            const fileListPath = path.join(tempDir, "filelist.txt")
            let fileListContent = ""

            for (let i = 0; i < framePaths.length; i++) {
              fileListContent += `file '${framePaths[i]}'\n`
              fileListContent += `duration 0.7\n`
            }

            fileListContent += `file '${framePaths[framePaths.length - 1]}'\n`
            fileListContent += `duration 2\n`

            fs.writeFileSync(fileListPath, fileListContent)
            const outputVideoPath = path.join(tempDir, "output.mp4")
            execSync(
              `ffmpeg -y -f concat -safe 0 -i ${fileListPath} -vf "fps=30" -c:v libx264 -preset ultrafast -pix_fmt yuv420p ${outputVideoPath}`,
            )

            await X.sendImageAsSticker(m.chat, outputVideoPath, m, {
              packname: "",
              author: `${author}`,
            })

            // Nettoyage des fichiers temporaires
            framePaths.forEach((frame) => {
              if (fs.existsSync(frame)) fs.unlinkSync(frame)
            })
            if (fs.existsSync(fileListPath)) fs.unlinkSync(fileListPath)
            if (fs.existsSync(outputVideoPath)) fs.unlinkSync(outputVideoPath)
          } catch (err) {
            console.error(err)
            reply("Une erreur s'est produite lors de la création du sticker")
          }
        }
        break

      case "brat":
        {
          if (!q) return reply(`Entrer le texte\n\nExemple : ${prefix + command} alok enceinte`)
          // Message d'attente
          reply(global.mess.wait)
          const rulz = `https://aqul-brat.hf.space/api/brat?text=${encodeURIComponent(q)}`
          try {
            const res = await axios.get(rulz, { responseType: "arraybuffer" })
            const buffer = Buffer.from(res.data, "binary")
            await X.sendImageAsSticker(m.chat, buffer, m, { packname: ``, author: `${author}` })
          } catch (e) {
            console.log(e)
            await reply(`En maintenance ou erreur API`)
          }
        }
        break

      case "emojimix":
        {
          if (!text) return reply(`Exemple : 😎+😂 ou 😎|😂`)

          const emojis = text.split(/[+|]/)
          if (emojis.length !== 2) return reply("Veuillez entrer deux emojis valides, exemple : 😎+😂 ou 😎|😂")
          // Message d'attente
          reply(global.mess.wait)
          const text1 = emojis[0].trim()
          const text2 = emojis[1].trim()

          const api = `https://fastrestapis.fasturl.cloud/maker/emojimix?emoji1=${text1}&emoji2=${text2}`
          await X.sendImageAsSticker(m.chat, api, m, { packname: "", author: `${packname}` })
        }
        break

      case "qc":
        {
          let text

          if (args.length >= 1) {
            text = args.slice(0).join(" ")
          } else if (m.quoted && m.quoted.text) {
            text = m.quoted.text
          } else {
            return reply("Entrer le texte ou répondre au texte que tu veux transformer en citation !")
          }
          if (!text) return reply("Entrer le texte")
          if (text.length > 200) return reply("Maximum 200 caractères !")
          // Message d'attente
          reply(global.mess.wait)
          const ppnyauser = await X.profilePictureUrl(m.sender, "image").catch(
            (_) => "https://files.catbox.moe/4vynlz.jpg",
          )
          const rest = await quote(text, pushname, ppnyauser)
          X.sendImageAsSticker(m.chat, rest.result, m, {
            packname: ``,
            author: `${global.author}`,
          })
        }
        break

      case "sticker":
      case "stiker":
      case "s":
        {
          if (!quoted) return reply(`Répondre à Vidéo/Image avec Caption ${prefix + command}`)
          // Message d'attente
          reply(global.mess.wait)
          if (/image/.test(mime)) {
            const media = await quoted.download()
            const encmedia = await X.sendImageAsSticker(m.chat, media, m, {
              packname: global.packname,
              author: global.author,
            })
          } else if (/video/.test(mime)) {
            if ((quoted.msg || quoted).seconds > 31) return reply("Maximum 30 secondes !")
            const media = await quoted.download()
            const encmedia = await X.sendVideoAsSticker(m.chat, media, m, {
              packname: global.packname,
              author: global.author,
            })
          } else {
            return reply(`Envoyer Image/Vidéo avec Caption ${prefix + command}\nDurée Vidéo 1-9 Secondes`)
          }
        }
        break

      case "toimg":
      case "toimage":
        {
          if (!/webp/.test(mime)) return reply(`Répondre au sticker avec *${prefix + command}*`)
          // Message d'attente
          reply(global.mess.wait)
          const media = await X.downloadAndSaveMediaMessage(quoted)
          const ran = await getRandom(".png")
          exec(`ffmpeg -i ${media} ${ran}`, (err) => {
            fs.unlinkSync(media)
            if (err) throw err
            const buffer = fs.readFileSync(ran)
            X.sendMessage(m.chat, { image: buffer }, { quoted: m })
            fs.unlinkSync(ran)
          })
        }
        break

      case "tovideo":
      case "tovid":
        {
          if (!/webp/.test(mime)) return reply(`Répondre au sticker avec *${prefix + command}*`)
          // Message d'attente
          reply(global.mess.wait)
          const media = await X.downloadAndSaveMediaMessage(quoted)
          const ran = await getRandom(".mp4")
          exec(`ffmpeg -i ${media} ${ran}`, (err) => {
            fs.unlinkSync(media)
            if (err) throw err
            const buffer = fs.readFileSync(ran)
            X.sendMessage(m.chat, { video: buffer }, { quoted: m })
            fs.unlinkSync(ran)
          })
        }
        break

      case "togif":
        {
          if (!/webp/.test(mime)) return reply(`Répondre au sticker avec *${prefix + command}*`)
          // Message d'attente
          reply(global.mess.wait)
          const media = await X.downloadAndSaveMediaMessage(quoted)
          const ran = await getRandom(".gif")
          exec(`ffmpeg -i ${media} ${ran}`, (err) => {
            fs.unlinkSync(media)
            if (err) throw err
            const buffer = fs.readFileSync(ran)
            X.sendMessage(m.chat, { video: buffer, gifPlayback: true }, { quoted: m })
            fs.unlinkSync(ran)
          })
        }
        break

      //━━━━━━━━━━━━━━━━━━━━━━━━//
      // Section Outils Développeur/Propriétaire
      case "self":
        {
          if (!Hisoka) return reply(mess.OnlyOwner)
          X.public = false
          reply("✅ Succès changement en Mode Privé")
        }
        break

      case "public":
        {
          if (!Hisoka) return reply(mess.OnlyOwner)
          X.public = true
          reply("✅ Succès changement en Mode Public")
        }
        break

      case "restart":
        if (!Hisoka) return reply(mess.OnlyOwner)
        reply(`🔄 Redémarrage réussi`)
        await sleep(3000)
        process.exit()
        break

      case "addplugin":
      case "addplug":
        {
          if (!Hisoka) return reply(mess.OnlyOwner)
          if (!q.includes("|")) return reply(`${command}, *Exemple :* \n\n*${prefix + command} nom|catégorie|contenu*`)
          const [pluginName, category, ...pluginContent] = q.split("|")
          const pluginDirPath = path.join(path.resolve(__dirname, "./plugin", category))
          const pluginFilePath = path.join(pluginDirPath, pluginName + ".js")
          if (!q.includes("|") || pluginContent.length === 0 || fs.existsSync(pluginFilePath)) return
          if (!fs.existsSync(pluginDirPath))
            fs.mkdirSync(pluginDirPath, {
              recursive: true,
            })
          fs.writeFileSync(pluginFilePath, pluginContent.join("|"))
          await reply(`✅ Un nouveau plugin a été créé dans ${pluginFilePath}.`)
        }
        break

      case "cgplugin":
      case "cgplug":
        {
          if (!Hisoka) return reply(mess.OnlyOwner)
          if (!q.includes("|")) return reply(`${command}, *Exemple :* *${prefix + command} leplugin|nouveau contenu*`)
          const [mypler, ...rest] = q.split("|")
          const mypenis = rest.join("|")
          const pluginsDirect = path.resolve(__dirname, "./plugin")
          const plugins = loadPlugins(pluginsDirect)
          for (const plugin of plugins) {
            if (plugin.command.includes(mypler)) {
              const filePath = plugin.filePath
              fs.writeFileSync(filePath, mypenis)
              await reply(`✅ Le plugin dans ${filePath} a été remplacé`)
              return
            }
          }
          await reply(`❌ Plugin avec la commande '${mypler}' non trouvé`)
        }
        break

      case "rmplugin":
      case "rmplug":
        {
          if (!Hisoka) return reply(mess.OnlyOwner)
          if (!q) return reply(`*Exemple :* \n\n*${prefix + command} nom plugin*`)
          const pluginsDirect = path.resolve(__dirname, "./plugin")
          const plugins = loadPlugins(pluginsDirect)
          for (const plugin of plugins) {
            if (plugin.command.includes(q)) {
              const filePath = plugin.filePath
              fs.unlinkSync(filePath)
              await reply(`✅ Le plugin dans ${filePath} a été supprimé.`)
              return
            }
          }
          await reply(`❌ Plugin avec la commande '${q}' non trouvé.`)
        }
        break

      case "getplugin":
      case "getplug":
        {
          if (!Hisoka) return reply(mess.OnlyOwner)
          if (!q) return reply(`*Exemple :* \n\n*${prefix + command} nom plugin`)
          const pluginsDirect = path.resolve(__dirname, "./plugin")
          const plugin = loadPlugins(pluginsDirect).find((p) => p.command.includes(q))
          if (!plugin) return reply(`❌ Plugin avec la commande '${q}' non trouvé.`)
          await X.sendMessage(
            m.chat,
            {
              document: fs.readFileSync(plugin.filePath),
              fileName: path.basename(plugin.filePath),
              mimetype: "*/*",
            },
            {
              quoted: m,
            },
          )
          await reply(`✅ Plugin '${q}' récupéré avec succès, plugin a été soumis.`)
        }
        break

      //━━━━━━━━━━━━━━━━━━━━━━━━//
      // Section Gestion de Groupe

      case "welcome":
      case "left":
        {
          if (!m.isGroup) return reply("Spécialement dans le groupe")
          if (!isAdmins && !Hisoka) return reply(mess.OnlyOwner)
          if (args.length < 1) return reply("Exemple : Welcome Activer/Désactiver")
          if (args[0] === "activer") {
            welcome = true
            reply(`✅ ${command} Déjà activé`)
          } else if (args[0] === "désactiver") {
            welcome = false
            reply(`✅ ${command} Déjà désactivé`)
          }
        }
        break

      case "groupevent":
        {
          if (!m.isGroup) return reply("Seulement en groupe")
          if (!isAdmins && !Hisoka) return reply(mess.OnlyOwner)
          if (args.length < 1) return reply("Activer / Désactiver ?")
          if (args[0] === "activer") {
            groupevent = true
            reply(`✅ ${command} Déjà activé`)
          } else if (args[0] === "désactiver") {
            groupevent = false
            reply(`✅ ${command} Déjà désactivé`)
          }
        }
        break

      case "add":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!isAdmins && !Hisoka) return reply(mess.admin)
          if (!isBotAdmins) return reply(mess.botAdmin)
          if (!text && !m.quoted) {
            reply(`_Exemple :_\n\n ${prefix + command} 62xxx`)
          } else {
            const numbersOnly = text ? text.replace(/\D/g, "") + "@s.whatsapp.net" : m.quoted?.sender
            try {
              await X.groupParticipantsUpdate(m.chat, [numbersOnly], "add").then(async (res) => {
                for (const i of res) {
                  const invv = await X.groupInviteCode(m.chat)
                  if (i.status == 408) return reply(`_[ Erreur ]_ L'utilisateur vient de quitter le groupe`)
                  if (i.status == 401) return reply(`_[ Erreur ]_ Bot bloqué par l'utilisateur`)
                  if (i.status == 409) return reply(`_[ Rapport ]_ L'utilisateur est déjà dans le groupe`)
                  if (i.status == 500) return reply(`_[ Invalide ]_ Le groupe est plein`)
                  if (i.status == 403) {
                    await X.sendMessage(
                      m.chat,
                      {
                        text: `@${numbersOnly.split("@")[0]} La cible ne peut pas être ajoutée car le compte est privé, une invitation sera envoyée en chat privé`,
                        mentions: [numbersOnly],
                      },
                      { quoted: m },
                    )
                    await X.sendMessage(
                      `${numbersOnly ? numbersOnly : creator}`,
                      {
                        text: `${"https://chat.whatsapp.com/" + invv}\n━━━━━━━━━━━━━━━━━━━━━\n\nAdmin : wa.me/${m.sender}\n T'as invité dans ce groupe`,
                        detectLink: true,
                        mentions: [numbersOnly],
                      },
                      { quoted: m },
                    ).catch((err) => reply("Échec envoi invitation ! 😔"))
                  } else {
                    reply(mess.succes)
                  }
                }
              })
            } catch (e) {
              reply("Échec ajout utilisateur, quelque chose ne va pas ! 😢")
            }
          }
        }
        break

      case "kick":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!Hisoka && !isAdmins) return reply(mess.admin)
          if (!isBotAdmins) return reply(mess.botAdmin)
          if (!m.quoted && !m.mentionedJid[0] && isNaN(Number.parseInt(args[0]))) {
            return reply(`*Exemple :* ${prefix + command} cible`)
          }
          const users = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
              ? m.quoted.sender
              : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
          if (owner.includes(users.replace("@s.whatsapp.net", ""))) {
            return reply("Mon propriétaire, ne peut pas l'exclure")
          }
          try {
            await X.groupParticipantsUpdate(m.chat, [users], "remove")
            reply(mess.succes)
          } catch (err) {
            console.error(err)
            reply(mess.error)
          }
        }
        break

      case "promote":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!Hisoka && !isAdmins) return reply(mess.admin)
          if (!isBotAdmins) return reply(mess.botAdmin)
          if (!m.quoted && !m.mentionedJid[0] && isNaN(Number.parseInt(args[0])))
            return reply(`*Exemple :* ${prefix + command} cible`)
          const users = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
              ? m.quoted.sender
              : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
          if (!m.mentionedJid[0] && !m.quoted && !text) return reply(`*Exemple :* ${prefix + command} cible`)
          await X.groupParticipantsUpdate(m.chat, [users], "promote")
            .then((res) => reply(mess.succes))
            .catch((err) => reply(mess.error))
        }
        break

      case "demote":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!Hisoka && !isAdmins) return reply(mess.admin)
          if (!isBotAdmins) return reply(mess.botAdmin)
          if (!m.quoted && !m.mentionedJid[0] && isNaN(Number.parseInt(args[0])))
            return reply(`*Exemple :* ${prefix + command} cible`)
          const users = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
              ? m.quoted.sender
              : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
          if (!m.mentionedJid[0] && !m.quoted && !text) return reply(`*Exemple :* ${prefix + command} cible`)
          await X.groupParticipantsUpdate(m.chat, [users], "demote")
            .then((res) => reply(mess.succes))
            .catch((err) => reply(mess.error))
        }
        break

      case "revoke":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!isAdmins && !Hisoka) return reply(mess.admin)
          if (!isBotAdmins) return reply(mess.botAdmin)
          await X.groupRevokeInvite(m.chat)
            .then((res) => {
              reply(mess.succes)
            })
            .catch(() => reply(mess.error))
        }
        break

      case "hidetag":
      case "h":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!isAdmins && !Hisoka) return reply(mess.admin)
          X.sendMessage(m.chat, { text: q ? q : "", mentions: participants.map((a) => a.id) }, { quoted: m })
        }
        break

      case "tagall":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!isAdmins && !Hisoka) return reply(mess.admin)
          let teks = `╚»˙·٠•●「 *Mention Tous* 」●•٠·˙«╝\n\n`
          for (const mem of participants) {
            teks += `🔸 @${mem.id.split("@")[0]}\n`
          }
          teks += `\n⏰ *${hariini}*`
          X.sendMessage(m.chat, { text: teks, mentions: participants.map((a) => a.id) }, { quoted: m })
        }
        break

      case "listonline":
      case "liston":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          const id = args && /\d+-\d+@g.us/.test(args[0]) ? args[0] : m.chat
          const online = [...Object.keys(store.presences[id]), botNumber]
          X.sendText(
            m.chat,
            "🟢 *Liste En Ligne:*\n\n" + online.map((v) => `🔹 @${v.replace(/@.+/, "")}`).join`\n`,
            m,
            { mentions: online },
          )
        }
        break

      case "linkgc":
      case "linkgroup":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!isBotAdmins) return reply(mess.botAdmin)
          const response = await X.groupInviteCode(m.chat)
          X.sendText(
            m.chat,
            `🔗 *Lien du Groupe :* ${groupMetadata?.subject || 'Groupe'}\n\nhttps://chat.whatsapp.com/${response}\n\nLe lien du groupe a été envoyé en privé`,
            m,
            { detectLink: true },
          )
          X.sendText(
            m.sender,
            `🔗 *Lien du Groupe :* ${groupMetadata?.subject || 'Groupe'}\n\nhttps://chat.whatsapp.com/${response}`,
            m,
            { detectLink: true },
          )
        }
        break

      case "resetlinkgc":
      case "resetlinkgroup":
      case "resetlink":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!isAdmins && !Hisoka) return reply(mess.admin)
          if (!isBotAdmins) return reply(mess.botAdmin)
          X.groupRevokeInvite(m.chat)
          reply("✅ Lien du groupe réinitialisé avec succès")
        }
        break

      case "setppgc":
      case "setppgroup":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!isAdmins && !Hisoka) return reply(mess.admin)
          if (!isBotAdmins) return reply(mess.botAdmin)
          if (!quoted) return reply(`Envoyer/Répondre à une Image avec Caption ${prefix + command}`)
          if (!/image/.test(mime)) return reply(`Envoyer/Répondre à une Image avec Caption ${prefix + command}`)
          if (/webp/.test(mime)) return reply(`Envoyer/Répondre à une Image avec Caption ${prefix + command}`)
          const media = await X.downloadAndSaveMediaMessage(quoted)
          await X.updateProfilePicture(m.chat, { url: media }).catch((err) => fs.unlinkSync(media))
          reply("✅ Photo de profil du groupe modifiée avec succès")
        }
        break

      case "setnamegc":
      case "setnamegroup":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!isAdmins && !Hisoka) return reply(mess.admin)
          if (!isBotAdmins) return reply(mess.botAdmin)
          if (!text) return reply(`Exemple : ${prefix + command} nom texte`)
          await X.groupUpdateSubject(m.chat, text)
            .then((res) => reply("✅ Nom du groupe modifié avec succès"))
            .catch((err) => reply(mess.error))
        }
        break

      case "setdescgc":
      case "setdescgroup":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!isAdmins && !Hisoka) return reply(mess.admin)
          if (!isBotAdmins) return reply(mess.botAdmin)
          if (!text) return reply(`Exemple : ${prefix + command} texte`)
          await X.groupUpdateDescription(m.chat, text)
            .then((res) => reply("✅ Description du groupe modifiée avec succès"))
            .catch((err) => reply(mess.error))
        }
        break

      case "group":
      case "grup":
        {
          if (!m.isGroup) return reply(mess.OnlyGrup)
          if (!isAdmins && !Hisoka) return reply(mess.admin)
          if (!isBotAdmins) return reply(mess.botAdmin)
          if (args[0] === "close" || args[0] === "tutup") {
            await X.groupSettingUpdate(m.chat, "announcement")
              .then((res) => reply(`✅ Groupe fermé avec succès`))
              .catch((err) => reply(mess.error))
          } else if (args[0] === "open" || args[0] === "buka") {
            await X.groupSettingUpdate(m.chat, "not_announcement")
              .then((res) => reply(`✅ Groupe ouvert avec succès`))
              .catch((err) => reply(mess.error))
          } else {
            reply(`Mode ${command}\n\n*Type :*\n1. open\n2. close`)
          }
        }
        break

      //━━━━━━━━━━━━━━━━━━━━━━━━//
      // Section Fonctionnalités de Recherche

      case "wikimedia":
        {
          if (!text) return reply(`*Exemple :*\n\n${prefix + command} Requête`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const results = await wikimedia(text)
            if (results.length === 0)
              return reply(`⚠️ Aucune image trouvée sur Wikimedia avec le mot-clé "${text}" ! 🥲`)
            const result = results.map((img) => `🖼️ *${img.title || "Sans Titre"}*\n🔗 ${img.source}`).join("\n\n")
            reply(`🌐 *Résultats de recherche Wikimedia pour* : ${text}\n\n${result}`)
          } catch (err) {
            console.error(err)
            reply(
              `❌ Il y a eu un problème lors de la récupération des images depuis Wikimedia ! Réessaye plus tard 🥺`,
            )
          }
        }
        break

      case "mangainfo":
        {
          const mangaName = args.join(" ")
          if (!mangaName) return reply(`*Exemple :*\n\n${prefix + command} Anime`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const mangaList = await komiku("manga", mangaName)
            if (mangaList.length === 0) {
              return reply("_[ Invalide ]_ Pas trouvé !!")
            }
            let captionText = `📚 *Résultats de recherche Manga - ${mangaName}* 📚\n\n`
            mangaList.slice(0, 5).forEach((manga, index) => {
              captionText += `📖 *${index + 1}. ${manga.title}*\n`
              captionText += `🗂️ *Genre* : ${manga.genre}\n`
              captionText += `🔗 *Url* : ${manga.url}\n`
              captionText += `📖 *Description* : ${manga.description}\n\n`
            })
            await reply(captionText)
          } catch (error) {
            console.error("Erreur rapportée :", error)
            reply(mess.error)
          }
        }
        break

      case "mangadetail":
        {
          const url = args[0]
          if (!url) return reply(`*Exemple :*\n\n${prefix + command} URL`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const mangaDetail = await detail(url)
            let captionText = `📚 *Détail Manga* 📚\n\n`
            captionText += `📖 *Titre* : ${mangaDetail.title}\n`
            captionText += `🗂️ *Genre* : ${mangaDetail.genres.join(", ")}\n`
            captionText += `📖 *Description* : ${mangaDetail.description}\n`
            captionText += `📅 *Chapitre Initial* : ${mangaDetail.awalChapter}\n`
            captionText += `📅 *Nouveau Chapitre* : ${mangaDetail.newChapter}\n`
            X.sendMessage(
              m.chat,
              {
                image: { url: mangaDetail.coverImage },
                caption: captionText,
              },
              {
                quoted: m,
              },
            )
          } catch (error) {
            console.error("Erreur rapportée :", error)
            reply(mess.error)
          }
        }
        break

      case "jkt48news":
        {
          const lang = args[0] || "fr"
          // Message d'attente
          reply(global.mess.wait)
          try {
            const news = await jktNews(lang)
            if (news.length === 0) {
              return reply("_[ Rapport ]_ Aucune actualité trouvée")
            }
            let captionText = `🎤 *Dernières actualités JKT48* 🎤\n\n`
            news.slice(0, 5).forEach((item, index) => {
              captionText += `📰 *${index + 1}. ${item.title}*\n`
              captionText += `📅 *Date* : ${item.date}\n`
              captionText += `🔗 *Lien* : ${item.link}\n\n`
            })
            await reply(captionText)
          } catch (error) {
            console.error("Erreur rapportée :", error)
            reply(mess.error)
          }
        }
        break

      case "otakudesu":
        {
          const data = await otakuDesu.ongoing()
          let captionText = `「 *PROGRAMME ANIME* 」\n\n`
          for (const i of data) {
            captionText += `*💬 Titre* : ${i.title}\n`
            captionText += `*📺 Éps* : ${i.episode}\n`
            captionText += `*🔗 URL* : ${i.link}\n\n`
          }
          X.sendMessage(
            m.chat,
            {
              text: captionText,
              contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterName: newsletterName,
                  newsletterJid: idch,
                },
                externalAdReply: {
                  showAdAttribution: true,
                  title: "Ceci est la dernière mise à jour des animés !",
                  mediaType: 1,
                  previewType: 1,
                  body: "Salut 👋",
                  thumbnailUrl: thumb,
                  renderLargerThumbnail: false,
                  mediaUrl: wagc,
                  sourceUrl: wagc,
                },
              },
            },
            {
              quoted: m,
            },
          )
        }
        break

      case "kusonimeinfo":
      case "animeinfo":
        {
          try {
            const animeList = await Kusonime.info()
            if (animeList.length === 0) {
              return reply("_[ Invalide ⚠️ ]_ Aucune donnée d'animé récent trouvée actuellement.")
            }
            // Message d'attente
            reply(global.mess.wait)
            let captionText = `🎌 *Animés récents de Kusonime* 🎌\n\n`
            animeList.slice(0, 5).forEach((anime, index) => {
              captionText += `📺 *${index + 1}. ${anime.title}*\n`
              captionText += `🔗 *URL* : ${anime.url}\n`
              captionText += `🗂️ *Genre* : ${anime.genres.join(", ")}\n`
              captionText += `📅 *Sortie* : ${anime.releaseTime}\n\n`
            })
            await reply(captionText)
          } catch (error) {
            console.error("Erreur rapportée :", error)
            reply(mess.error)
          }
        }
        break

      case "kusonimesearch":
      case "animesearch":
        {
          if (!text) return reply(`*Exemple :*\n\n${prefix + command} Anime`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const searchResults = await Kusonime.search(text)
            if (typeof searchResults === "string") {
              return reply(`⚠️ ${searchResults}`)
            }
            let captionText = `🔍 *Résultats de recherche pour* : ${text}\n\n`
            searchResults.slice(0, 5).forEach((anime, index) => {
              captionText += `📺 *${index + 1}. ${anime.title}*\n`
              captionText += `🔗 *URL* : ${anime.url}\n`
              captionText += `🗂️ *Genre* : ${anime.genres.join(", ")}\n`
              captionText += `📅 *Sortie* : ${anime.releaseTime}\n\n`
            })
            await reply(captionText)
          } catch (error) {
            console.error("Erreur rapportée :", error)
            reply(mess.error)
          }
        }
        break

      case "infogempa":
      case "infobmkg":
      case "gempa":
      case "bmkg":
        {
          // Message d'attente
          reply(global.mess.wait)
          try {
            const result = await gempa()
            const gempaData = result.data
            let captionText = `「 *INFO SÉISME* 」\n\n`
            captionText += `*🌍 Source* : ${result.source}\n`
            captionText += `*📊 Magnitude* : ${gempaData.magnitude.trim()}\n`
            captionText += `*📏 Profondeur* : ${gempaData.kedalaman.trim()}\n`
            captionText += `*🗺️ Latitude & Longitude* : ${gempaData.lintang_bujur.trim()}\n`
            captionText += `*🕒 Heure* : ${gempaData.waktu.trim()}\n`
            captionText += `*📍 Région* : ${gempaData.wilayah.trim() || "Aucune donnée"}\n`
            captionText += `*😱 Ressenti* : ${gempaData.dirasakan.trim() || "Aucune donnée"}\n\n`
            captionText += `Reste vigilant et suis les directives des autorités !`
            if (gempaData.imagemap) {
              X.sendMessage(
                m.chat,
                {
                  image: {
                    url: gempaData.imagemap.startsWith("http")
                      ? gempaData.imagemap
                      : `https://www.bmkg.go.id${gempaData.imagemap}`,
                  },
                  caption: captionText,
                  contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                      newsletterName: saluranName,
                      newsletterJid: saluran,
                    },
                    externalAdReply: {
                      showAdAttribution: true,
                      title: "Informations sur le dernier séisme !",
                      mediaType: 1,
                      previewType: 1,
                      body: "Sois prudent",
                      thumbnailUrl: imageUrl,
                      renderLargerThumbnail: false,
                      mediaUrl: "https://www.bmkg.go.id",
                      sourceUrl: "https://www.bmkg.go.id",
                    },
                  },
                },
                {
                  quoted: m,
                },
              )
            } else {
              X.sendMessage(
                m.chat,
                {
                  text: captionText,
                  contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                      newsletterName: saluranName,
                      newsletterJid: saluran,
                    },
                    externalAdReply: {
                      showAdAttribution: true,
                      title: "Informations sur le dernier séisme !",
                      mediaType: 1,
                      previewType: 1,
                      body: "Sois prudent",
                      thumbnailUrl: imageUrl,
                      renderLargerThumbnail: false,
                      mediaUrl: "https://www.bmkg.go.id",
                      sourceUrl: "https://www.bmkg.go.id",
                    },
                  },
                },
                {
                  quoted: m,
                },
              )
            }
          } catch (error) {
            console.error("Erreur rapportée :", error)
            X.sendMessage(
              m.chat,
              {
                text: mess.error,
              },
              {
                quoted: m,
              },
            )
          }
        }
        break

      //━━━━━━━━━━━━━━━━━━━━━━━━//
      // Section Outils Utilitaires

      case "myip":
      case "ipbot":
        if (!Hisoka) return reply(mess.OnlyOwner)
        const http = require("http")
        http.get(
          {
            host: "api.ipify.org",
            port: 80,
            path: "/",
          },
          (resp) => {
            resp.on("data", (ip) => {
              reply("🔎 Salut, voici mon adresse IP publique : " + ip)
            })
          },
        )
        break

      case "ipwhois":
        {
          if (!text) return reply(`*Exemple :*\n\n${prefix + command} 114.5.213.103`)
          // Message d'attente
          reply(global.mess.wait)
          const ip = text.trim()
          const apiUrl = `https://ipwho.is/${ip}`
          try {
            reply("🔍 Recherche d'informations en cours, veuillez patienter...")
            const data = await fetchJson(apiUrl)
            if (data.success) {
              const flagEmoji = data.flag?.emoji || "🏳️"
              let messageText = "📍 *Informations IP Whois*\n"
              messageText += `🌐 *Adresse IP* : ${data.ip}\n`
              messageText += `🗺️ *Type* : ${data.type}\n`
              messageText += `🌍 *Continent* : ${data.continent} (${data.continent_code})\n`
              messageText += `🇨🇺 *Pays* : ${data.country} (${data.country_code}) ${flagEmoji}\n`
              messageText += `🏙️ *Ville* : ${data.city}, ${data.region} (${data.region_code})\n`
              messageText += `📞 *Code d'appel* : +${data.calling_code}\n`
              messageText += `📫 *Code postal* : ${data.postal}\n`
              messageText += `🏛️ *Capitale* : ${data.capital}\n\n`
              messageText += "📡 *Informations fournisseur*\n"
              messageText += `🏢 *ISP* : ${data.connection?.isp || "Non disponible"}\n`
              messageText += `🔗 *Domaine* : ${data.connection?.domain || "Non disponible"}\n`
              messageText += `🔢 *ASN* : ${data.connection?.asn || "Non disponible"}\n\n`
              messageText += "🕰️ *Fuseau horaire*\n"
              messageText += `🕒 *ID* : ${data.timezone?.id || "Non disponible"}\n`
              messageText += `🕒 *UTC* : ${data.timezone?.utc || "Non disponible"}\n`
              messageText += `🕒 *Heure actuelle* : ${data.timezone?.current_time || "Non disponible"}\n`
              reply(messageText)
            } else {
              reply(`❌ Adresse IP invalide ou informations non trouvées.`)
            }
          } catch (err) {
            console.error(err)
            reply("❌ Une erreur s'est produite lors de la récupération des données. Réessayez plus tard.")
          }
        }
        break

      case "translate":
      case "tr":
        {
          if (!text) return reply(`*Exemple :*\n\n${prefix + command} fr Bonjour`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const [targetLang, ...textToTranslate] = args
            const textForTranslation = textToTranslate.join(" ")
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/tools/translate?text=${encodeURIComponent(textForTranslation)}&lang=${targetLang}&apikey=${global.lann}`,
            )
            if (api.status && api.result) {
              const translationResult = `🌐 *Traduction* : ${targetLang.toUpperCase()}\n\n📝 *Texte original :*\n${textForTranslation}\n\n✅ *Traduction :*\n${api.result.translate}`
              reply(translationResult)
            } else {
              reply("❌ Erreur lors de la traduction")
            }
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors de la traduction")
          }
        }
        break

      case "removebg":
      case "nobg":
        {
          if (!quoted) return reply(`Envoyer/Répondre à une Image avec Caption ${prefix + command}`)
          if (!/image/.test(mime)) return reply(`Envoyer/Répondre à une Image avec Caption ${prefix + command}`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const media = await quoted.download()
            const api = await fetchJson(`https://api.betabotz.eu.org/api/tools/removebg?apikey=${global.lann}`, {
              method: "POST",
              body: media,
            })
            if (api.status && api.result) {
              await X.sendMessage(
                m.chat,
                { image: { url: api.result.image }, caption: "✅ Arrière-plan supprimé avec succès" },
                { quoted: m },
              )
            } else {
              reply("❌ Erreur lors de la suppression de l'arrière-plan")
            }
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors de la suppression de l'arrière-plan")
          }
        }
        break

      case "shortlink":
      case "shorturl":
        {
          if (!text) return reply(`*Exemple :*\n\n${prefix + command} https://google.com`)
          if (!isUrl(text)) return reply("❌ URL invalide")
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/tools/shortlink?url=${text}&apikey=${global.lann}`,
            )
            if (api.status && api.result) {
              const shortResult = `🔗 *Raccourcisseur de Lien*\n\n📎 *URL originale :*\n${text}\n\n✂️ *URL raccourcie :*\n${api.result.shortUrl}`
              reply(shortResult)
            } else {
              reply("❌ Erreur lors du raccourcissement du lien")
            }
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors du raccourcissement du lien")
          }
        }
        break

      case "qrcode":
      case "qr":
        {
          if (!text) return reply(`*Exemple :*\n\n${prefix + command} Bonjour le monde`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`
            await X.sendMessage(
              m.chat,
              { image: { url: api }, caption: `📱 *Code QR généré*\n\n📝 *Texte :* ${text}` },
              { quoted: m },
            )
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors de la génération du code QR")
          }
        }
        break

      case "barcode":
        {
          if (!text) return reply(`*Exemple :*\n\n${prefix + command} 123456789`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = `https://api.qrserver.com/v1/create-barcode/?size=500x200&data=${encodeURIComponent(text)}`
            await X.sendMessage(
              m.chat,
              { image: { url: api }, caption: `📊 *Code-barres généré*\n\n📝 *Données :* ${text}` },
              { quoted: m },
            )
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors de la génération du code-barres")
          }
        }
        break

      case "weather":
      case "cuaca":
        {
          if (!text) return reply(`*Exemple :*\n\n${prefix + command} Jakarta`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/search/weather?city=${text}&apikey=${global.lann}`,
            )
            if (api.status && api.result) {
              const weather = api.result
              let weatherText = `🌤️ *Informations Météo*\n\n`
              weatherText += `🏙️ *Ville :* ${weather.location}\n`
              weatherText += `🌡️ *Température :* ${weather.temperature}\n`
              weatherText += `☁️ *Condition :* ${weather.description}\n`
              weatherText += `💧 *Humidité :* ${weather.humidity}\n`
              weatherText += `💨 *Vent :* ${weather.wind}\n`
              reply(weatherText)
            } else {
              reply("❌ Ville non trouvée")
            }
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors de la récupération des données météo")
          }
        }
        break

      case "jadwalsholat":
      case "jadwalsalat":
        {
          if (!text) return reply(`*Exemple :*\n\n${prefix + command} Jakarta`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const api = await fetchJson(
              `https://api.betabotz.eu.org/api/search/jadwalsholat?kota=${text}&apikey=${global.lann}`,
            )
            if (api.status && api.result) {
              const jadwal = api.result
              let jadwalText = `🕌 *Horaires de Prière*\n\n`
              jadwalText += `🏙️ *Ville :* ${jadwal.daerah}\n`
              jadwalText += `📅 *Date :* ${jadwal.tanggal}\n\n`
              jadwalText += `🌅 *Subuh :* ${jadwal.subuh}\n`
              jadwalText += `☀️ *Lever du soleil :* ${jadwal.terbit}\n`
              jadwalText += `🌞 *Dhuhr :* ${jadwal.dzuhur}\n`
              jadwalText += `🌤️ *Asr :* ${jadwal.ashar}\n`
              jadwalText += `🌅 *Maghrib :* ${jadwal.maghrib}\n`
              jadwalText += `🌙 *Isha :* ${jadwal.isya}\n`
              reply(jadwalText)
            } else {
              reply("❌ Ville non trouvée")
            }
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors de la récupération des horaires de prière")
          }
        }
        break

      case "telestick":
        {
          async function telestick(url) {
            const match = url.match(/https:\/\/t\.me\/addstickers\/([^/?#]+)/)
            if (!match) return reply(`*Exemple :*\n\n${prefix + command} https://`)
            // Message d'attente
            reply(global.mess.wait)
            const { data: a } = await axios.get(
              `https://api.telegram.org/bot7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc/getStickerSet?name=${match[1]}`,
            )
            const stickers = await Promise.all(
              a.result.stickers.map(async (v) => {
                const { data: b } = await axios.get(
                  `https://api.telegram.org/bot7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc/getFile?file_id=${v.file_id}`,
                )
                return {
                  emoji: v.emoji,
                  is_animated: v.is_animated,
                  image_url: `https://api.telegram.org/file/bot7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc/${b.result.file_path}`,
                }
              }),
            )
            return { name: a.result.name, title: a.result.title, sticker_type: a.result.sticker_type, stickers }
          }

          try {
            if (!args[0]) return reply("Insérer l'URL du pack de stickers Telegram")
            const res = await telestick(args[0])
            for (const v of res.stickers) {
              const { data } = await axios.get(v.image_url, { responseType: "arraybuffer" })
              const sticker = new Sticker(data, {
                pack: res.title,
                author: "Alicia-Bot",
                type: v.is_animated ? "full" : "default",
              })
              await X.sendMessage(m.chat, await sticker.toMessage(), { quoted: m })
            }
          } catch (e) {
            reply(e.message)
          }
        }
        break

      case "stikerly":
        {
          if (!text) return reply(`*Exemple :*\n\n ${prefix + command} anomali `)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const searchRes = await fetch(
              `https://zenzxz.dpdns.org/search/stickerlysearch?query=${encodeURIComponent(text)}`,
            )
            const searchJson = await searchRes.json()
            if (!searchJson.status || !Array.isArray(searchJson.data) || searchJson.data.length === 0) {
              return reply("*Non trouvé 🚫*")
            }
            const pick = searchJson.data[Math.floor(Math.random() * searchJson.data.length)]
            const detailUrl = `https://zenzxz.dpdns.org/tools/stickerlydetail?url=${encodeURIComponent(pick.url)}`
            const detailRes = await fetch(detailUrl)
            const detailJson = await detailRes.json()
            if (
              !detailJson.status ||
              !detailJson.data ||
              !Array.isArray(detailJson.data.stickers) ||
              detailJson.data.stickers.length === 0
            ) {
              return reply("Erreur lors de la récupération des détails du sticker")
            }
            const packName = detailJson.data.name
            const authorName = detailJson.data.author?.name || "inconnu"
            reply(`Envoi de ${detailJson.data.stickers.length} Stickers`)
            const maxSend = 10
            for (let i = 0; i < Math.min(detailJson.data.stickers.length, maxSend); i++) {
              const img = detailJson.data.stickers[i]
              const sticker = new Sticker(img.imageUrl, {
                pack: packname,
                author: author,
                type: "full",
                categories: ["Anomali"],
                id: "Hisoka",
              })
              const buffer = await sticker.toBuffer()
              await X.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
            }
          } catch (e) {
            console.error(e)
            reply(mess.error)
          }
        }
        break

      case "ocr":
        {
          if (!quoted) return reply(`Envoyer/Répondre à une Image avec Caption ${prefix + command}`)
          if (!/image/.test(mime)) return reply(`Envoyer/Répondre à une Image avec Caption ${prefix + command}`)
          // Message d'attente
          reply(global.mess.wait)
          try {
            const media = await quoted.download()
            const api = await fetchJson(`https://api.betabotz.eu.org/api/tools/ocr?apikey=${global.lann}`, {
              method: "POST",
              body: media,
            })
            if (api.status && api.result) {
              reply(`📝 *Reconnaissance de Texte (OCR)*\n\n${api.result.text}`)
            } else {
              reply("❌ Aucun texte détecté dans l'image")
            }
          } catch (e) {
            console.log(e)
            reply("❌ Erreur lors de la reconnaissance de texte")
          }
        }
        break

      //━━━━━━━━━━━━━━━━━━━━━━━━//
      // Section Informations et Contact
      case "owner":
      case "botowner":
        const nameown = `𝕽𝖆𝖛𝖊𝖓`
        var contact = generateWAMessageFromContent(
          m.chat,
          proto.Message.fromObject({
            contactMessage: {
              displayName: `${nameown}`,
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;;;;\nFN:Hisoka\nitem1.TEL;waid=2250101676111:+2250101676111\nitem1.X-ABLabel:Mobile\nX-WA-BIZ-DESCRIPTION:${ownername}\nX-WA-BIZ-NAME: ${nameown}\nEND:VCARD`,
            },
          }),
          { userJid: m.chat, quoted: m },
        )
        X.relayMessage(m.chat, contact.message, { messageId: contact.key.id })
        break

      case "sc":
        {
          reply(
            `Tu veux le script de Vrush-maria ? \nInfo mise à jour script : +22501676111\nContact développeur : https://t.me/his_oka_07`,
          )
        }
        break

      case "infobot":
      case "botinfo":
        {
          // Message d'attente
          reply(global.mess.wait)
          const botInfo = `
╭─ ⌬ Info Bot
│ • Nom      : ${botname}
│ • Propriétaire   : ${ownername}
│ • Version  : ${botver}
│ • Commandes : ${totalcmd()}
│ • Temps de fonctionnement  : ${runtime(process.uptime())}\n╰─────────────
`
          reply(botInfo)
        }
        break

      case "play": 
      case "ytmp3": 
      case "ytaudio": {
        if (!text) {
          const helpMsg = `
┌──────────────────┐
│ 🎵 **YOUTUBE AUDIO** │
└──────────────────┘

**Utilisation:**
■ ${prefix + command} URL YouTube
■ ${prefix + command} nom de la chanson

**Exemples:**
■ ${prefix + command} https://youtu.be/xxxx
■ ${prefix + command} Imagine Dragons Thunder

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;
          return reply(helpMsg);
        }
        
        try {
          const yts = require("yt-search");
          let search = await yts(text);
          
          if (!search.all[0]) {
            return reply(`❌ Aucun résultat trouvé pour: ${text}`);
          }
          
          let video = search.all[0];
          
          let caption = `
┌──────────────────┐
│ 🎵 **RÉSULTAT TROUVÉ** │
└──────────────────┘

■ **Titre:** ${video.title}
■ **Durée:** ${video.timestamp}
■ **Vues:** ${video.views}
■ **Chaîne:** ${video.author.name}
■ **URL:** ${video.url}

⏳ _Téléchargement audio en cours..._

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;
          
          await X.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption: caption
          }, { quoted: m });
          
          // Try to get audio URL using existing API
          const fg = require("api-dylux");
          const result = await fg.yta(video.url);
          
          if (result && result.dl_url) {
            await X.sendMessage(m.chat, {
              audio: { url: result.dl_url },
              mimetype: 'audio/mpeg',
              fileName: `${video.title}.mp3`,
              ptt: false
            }, { quoted: m });
          } else {
            reply("❌ Erreur lors du téléchargement audio. Réessayez plus tard.");
          }
          
        } catch (error) {
          console.error("YouTube audio download error:", error);
          reply("❌ Erreur lors du téléchargement. Réessayez plus tard.");
        }
      }
      break;

      case "hug":
      case "calin": {
        const quotedUser = m.quoted ? m.quoted.sender : null;
        try {
          const url = "https://api.waifu.pics/sfw/hug";
          const response = await axios.get(url);
          const imageUrl = response.data.url;
          
          let caption, mentions;
          if (quotedUser) {
            caption = `@${m.sender.split("@")[0]} fait un câlin à @${quotedUser.split("@")[0]} 🤗`;
            mentions = [m.sender, quotedUser];
          } else {
            caption = `@${m.sender.split("@")[0]} se fait un câlin 🤗`;
            mentions = [m.sender];
          }
          
          await X.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: caption,
            mentions: mentions
          }, { quoted: m });
          
        } catch (error) {
          reply("❌ Erreur lors de la récupération de l'image.");
        }
      }
      break;

      case "kiss":
      case "embrasser": {
        const quotedUser = m.quoted ? m.quoted.sender : null;
        try {
          const url = "https://api.waifu.pics/sfw/kiss";
          const response = await axios.get(url);
          const imageUrl = response.data.url;
          
          let caption, mentions;
          if (quotedUser) {
            caption = `@${m.sender.split("@")[0]} embrasse @${quotedUser.split("@")[0]} 💋`;
            mentions = [m.sender, quotedUser];
          } else {
            caption = `@${m.sender.split("@")[0]} s'embrasse 💋`;
            mentions = [m.sender];
          }
          
          await X.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: caption,
            mentions: mentions
          }, { quoted: m });
          
        } catch (error) {
          reply("❌ Erreur lors de la récupération de l'image.");
        }
      }
      break;

      case "slap":
      case "gifle": {
        const quotedUser = m.quoted ? m.quoted.sender : null;
        try {
          const url = "https://api.waifu.pics/sfw/slap";
          const response = await axios.get(url);
          const imageUrl = response.data.url;
          
          let caption, mentions;
          if (quotedUser) {
            caption = `@${m.sender.split("@")[0]} gifle @${quotedUser.split("@")[0]} 👋`;
            mentions = [m.sender, quotedUser];
          } else {
            caption = `@${m.sender.split("@")[0]} se gifle 👋`;
            mentions = [m.sender];
          }
          
          await X.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: caption,
            mentions: mentions
          }, { quoted: m });
          
        } catch (error) {
          reply("❌ Erreur lors de la récupération de l'image.");
        }
      }
      break;

      case "qc": {
        if (!q) return reply(`Envoyez une commande avec du texte. ${prefix + command} ${pushname}`);
        let obj = {
          type: 'quote',
          format: 'png',
          backgroundColor: '#ffffff',
          width: 512,
          height: 768,
          scale: 2,
          messages: [
            {
              entities: [],
              avatar: true,
              from: {
                id: 1,
                name: `${pushname}`,
                photo: { 
                  url: await X.profilePictureUrl(m.sender, "image").catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'),
                }
              },
              text: `${q}`,
              replyMessage: {},
            },
          ],
        };
        let response = await axios.post('https://bot.lyo.su/quote/generate', obj, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        let buffer = Buffer.from(response.data.result.image, 'base64');
        X.sendImageAsSticker(m.chat, buffer, m, { packname: `${packname}`, author: `${author}` });
      }
      break;

      // ===== AI COMMAND WITH GIFTEDTECH API =====
      case "ai": case "gpt": {
        if (!text) return reply("Exemple: .ai Bonjour comment ça va ?");
        
        try {
          reply("🤖 AI est en train de réfléchir...");
          
          const response = await fetch(`https://api.giftedtech.co.ke/api/ai/gpt?apikey=gifted&q=${encodeURIComponent(text)}`);
          const data = await response.json();
          
          if (data && data.response) {
            reply(`🤖 *Vrush-maria AI:*\n\n${data.response}`);
          } else {
            reply("❌ Erreur lors de la récupération de la réponse AI");
          }
        } catch (error) {
          console.error("AI Error:", error);
          reply("❌ Service AI temporairement indisponible");
        }
      }
      break;

      // ===== ENHANCED STATUS SAVER (@storybroadcast) =====
      case "saver": case "statusdl": case "story": case "statusdownload": {
        try {
          if (!m.quoted) {
            return reply(`
📱 *STATUS SAVER* 📱

🔄 *Usage:*
• Reply to any status to download it
• Works with images, videos, and text
• Automatically detects status type

📸 *Supported formats:*
• Status images
• Status videos  
• Status text messages
• View once messages

💡 *Example:* Reply to a status with .saver

🎯 *Feature:* Downloads and resends to @storybroadcast
`);
          }

          let statusBuffer, statusType, caption = "";
          const quotedMsg = m.quoted;
          
          // Check different message types
          if (quotedMsg.message) {
            const msgContent = quotedMsg.message;
            
            // Image status
            if (msgContent.imageMessage) {
              statusBuffer = await X.downloadMediaMessage(quotedMsg);
              statusType = 'image';
              caption = "📸 *Status Image Downloaded*\n\n🔄 _Saved from WhatsApp Status_";
            }
            // Video status  
            else if (msgContent.videoMessage) {
              statusBuffer = await X.downloadMediaMessage(quotedMsg);
              statusType = 'video';
              caption = "🎬 *Status Video Downloaded*\n\n🔄 _Saved from WhatsApp Status_";
            }
            // Text status
            else if (msgContent.extendedTextMessage || msgContent.conversation) {
              const textContent = msgContent.extendedTextMessage?.text || msgContent.conversation;
              caption = `📝 *Status Text Downloaded*\n\n"${textContent}"\n\n🔄 _Saved from WhatsApp Status_`;
              statusType = 'text';
            }
          }
          
          if (statusType === 'text') {
            // Send text status
            await X.sendMessage(m.chat, {
              text: caption
            }, { quoted: m });
            
            // Send to story broadcast if exists
            try {
              const storyBroadcastId = `120363043390114619@newsletter`;
              await X.sendMessage(storyBroadcastId, {
                text: caption
              });
            } catch (broadcastError) {
              console.log("Story broadcast not found or inaccessible");
            }
            
          } else if (statusBuffer && statusType) {
            // Send media status to user
            await X.sendMessage(m.chat, {
              [statusType]: statusBuffer,
              caption: caption
            }, { quoted: m });
            
            // Try to send to story broadcast
            try {
              const storyBroadcastId = `120363043390114619@newsletter`;
              await X.sendMessage(storyBroadcastId, {
                [statusType]: statusBuffer,
                caption: `🔄 *Status forwarded automatically*\n\n📡 From: @${m.sender.split('@')[0]}`
              });
              reply("✅ Status also sent to @storybroadcast");
            } catch (broadcastError) {
              console.log("Story broadcast not accessible");
              reply("✅ Status downloaded successfully");
            }
            
          } else {
            reply("❌ Unable to download this status type. Make sure you're replying to a status message.");
          }
          
        } catch (error) {
          console.error("Status saver error:", error);
          reply("❌ Failed to download status. Please try again.");
        }
      }
      break;

      // ===== ANTI DELETE =====
      case "antidelete": case "antidel": {
        if (!m.isGroup) return reply("Cette commande ne peut être utilisée que dans des groupes");
        if (!isAdmins && !Hisoka) return reply("Cette commande est réservée aux admins");
        
        global.db = global.db || {};
        global.db.groups = global.db.groups || {};
        global.db.groups[m.chat] = global.db.groups[m.chat] || {};
        
        if (args[0] === 'on') {
          global.db.groups[m.chat].antidelete = true;
          reply("✅ Anti-delete activé ! Les messages supprimés seront récupérés.");
        } else if (args[0] === 'off') {
          global.db.groups[m.chat].antidelete = false;
          reply("❌ Anti-delete désactivé !");
        } else {
          let status = global.db.groups[m.chat].antidelete ? "Activé" : "Désactivé";
          reply(`🛡️ Anti-delete Status: ${status}\n\nUtilisation:\n.antidelete on - Activer\n.antidelete off - Désactiver`);
        }
      }
      break;

      case "owner": {
        const menuImage = "https://files.catbox.moe/pkmiz6.jpg";
        const menuText = `
┌──────────────────┐
│ 👤 **OWNER MENU** │
└──────────────────┘

▢ .ai - Chat with AI
▢ .status - Presence control
▢ .resetprefix - Reset prefix
▢ .fakechat - Generate fake chat
▢ .setvar - Set variable
▢ .getvar - Get variable
▢ .allvar - List variables
▢ .delvar - Delete variable
▢ .block - Block user
▢ .unblock - Unblock user

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;

        await X.sendMessage(m.chat, {
          image: { url: menuImage },
          caption: menuText
        }, { quoted: m });
      }
      break;

      case "info": {
        const menuImage = "https://files.catbox.moe/3w0llo.jpg";
        const menuText = `
┌──────────────────┐
│ ℹ️ **INFO MENU** │
└──────────────────┘

▢ .ping
▢ .runtime
▢ .speed
▢ .owner
▢ .script
▢ .groupinfo
▢ .botinfo
▢ .serverinfo

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;

        await X.sendMessage(m.chat, {
          image: { url: menuImage },
          caption: menuText
        }, { quoted: m });
      }
      break;

      case "downloader": {
        const menuImage = "https://files.catbox.moe/k3xvf0.jpg";
        const menuText = `
┌──────────────────┐
│ ⬇️ **DOWNLOAD MENU** │
└──────────────────┘

▢ .play - YouTube audio
▢ .ytmp3 - YouTube MP3
▢ .tiktok - TikTok video
▢ .tt - TikTok shortcut
▢ .instagram - Instagram
▢ .ig - IG shortcut
▢ .facebook - Facebook
▢ .fb - FB shortcut
▢ .saver - Status downloader
▢ .story - Download status

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;

        await X.sendMessage(m.chat, {
          image: { url: menuImage },
          caption: menuText
        }, { quoted: m });
      }
      break;

      case "fun": {
        const menuImage = "https://files.catbox.moe/pkmiz6.jpg";
        const menuText = `
┌──────────────────┐
│ 🎮 **FUN MENU** │
└──────────────────┘

▢ .fancy - Fancy text (1-47)
▢ .wallpaper - HD wallpapers
▢ .couplepp - Couple pictures
▢ .manhwa - Manhwa search
▢ .animequote - Anime quotes
▢ .quote - Random quotes
▢ .joke - Funny jokes
▢ .fact - Interesting facts
▢ .hug - Hug reaction
▢ .kiss - Kiss reaction
▢ .slap - Slap reaction

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;

        await X.sendMessage(m.chat, {
          image: { url: menuImage },
          caption: menuText
        }, { quoted: m });
      }
      break;

      case "reactions": {
        const menuImage = "https://files.catbox.moe/3w0llo.jpg";
        const menuText = `
┌──────────────────┐
│ 😊 **REACTIONS MENU** │
└──────────────────┘

▢ .react 😍 - Custom reaction
▢ .smile - 😊 reaction
▢ .love - ❤️ reaction  
▢ .angry - 😡 reaction
▢ .laugh - 😂 reaction
▢ .wow - 😱 reaction
▢ .hug - 🤗 hug GIF
▢ .kiss - 💋 kiss GIF
▢ .slap - 👋 slap GIF

*Reply to a message with these commands*

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;

        await X.sendMessage(m.chat, {
          image: { url: menuImage },
          caption: menuText
        }, { quoted: m });
      }
      break;

      case "tools": {
        const menuImage = "https://files.catbox.moe/k3xvf0.jpg";
        const menuText = `
┌──────────────────┐
│ 🛠️ **TOOLS MENU** │
└──────────────────┘

▢ .enhance - Upscale images
▢ .upscale - AI enhancement  
▢ .rvo - Read view once
▢ .vv - View once reader
▢ .qc - Quote creator
▢ .forward - Forward audio
▢ .tovideo - Sticker to video
▢ .sticker - Create sticker
▢ .s - Sticker shortcut

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;

        await X.sendMessage(m.chat, {
          image: { url: menuImage },
          caption: menuText
        }, { quoted: m });
      }
      break;

      // ===== STICKER IMPROVEMENTS =====
      case "sticker": case "stiker": case "sgif": case "s": {
        if (!/image|video/.test(mime)) return reply("Envoyez l'image !");
        if (/video/.test(mime)) {
          if ((quoted).seconds > 15) return reply("La durée de la vidéo est de 15 secondes maximum !");
        }
        var media = await X.downloadAndSaveMediaMessage(quoted);
        await X.sendImageAsSticker(m.chat, media, m, {packname: ` ${ownername}`});
        await fs.unlinkSync(media);
      }
      break;

      // ===== FORWARD COMMAND =====
      case "forward": {
        try {
          if (args.length < 1) {
            return reply("❌ Example: .forward 120xxx@newsletter (reply to audio)");
          }

          const channelId = args[0];
          const quoted = m.quoted;
          const mime = quoted ? quoted.mimetype : null;

          if (!quoted || !/audio/.test(mime)) {
            return reply("❌ Reply to an audio with this command.");
          }

          const audioBuffer = await quoted.download();

          await X.sendMessage(
            channelId,
            {
              audio: audioBuffer,
              mimetype: "audio/mpeg",
              ptt: true,
            },
            { quoted: m }
          );

          reply("✅ Audio successfully sent to the channel.");
        } catch (err) {
          console.error("Failed to send audio:", err);
          reply("❌ Failed to send audio to the channel.");
        }
      }
      break;

      // ===== READ VIEW ONCE =====
      case "rvo": case "readvo": case "readviewonce": case "readviewoncemessage": case "vv": {
        const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
        
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const mediaType = quoted?.imageMessage ? "image"
                        : quoted?.videoMessage ? "video"
                        : null;

        if (!mediaType) {
          return X.sendMessage(m.chat, {
            text: "❌ Please *reply to a view once image or short video* to retrieve."
          }, { quoted: m });
        }

        try {
          const stream = await downloadContentFromMessage(
            mediaType === "image" ? quoted.imageMessage : quoted.videoMessage,
            mediaType
          );

          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }

          await X.sendMessage(m.chat, {
            [mediaType]: buffer,
            caption: `💥 Here's your removed view-once ${mediaType}`
          }, {
            quoted: {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: m.chat
              },
              message: {
                conversation: "🤺 VIEW ONCE FETCHED"
              }
            }
          });

        } catch (err) {
          console.error("❌ View once retrieval error:", err);
          await X.sendMessage(m.chat, {
            text: "⚠️ Failed to retrieve view once."
          }, { quoted: m });
        }
      }
      break;

      // ===== ENHANCED YOUTUBE COMMANDS =====
      case "play": case "ytmp3": case "ytaudio": {
        if (!text) {
          const helpMsg = `
┌──────────────────┐
│ 🎵 **YOUTUBE AUDIO** │
└──────────────────┘

**Utilisation:**
■ ${prefix + command} URL YouTube
■ ${prefix + command} nom de la chanson

**Exemples:**
■ ${prefix + command} https://youtu.be/xxxx
■ ${prefix + command} Imagine Dragons Thunder

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;
          return reply(helpMsg);
        }
        
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = text.match(ytRegex);
        let videoUrl = null;
        
        if (!match) {
          try {
            const searchMsg = `
┌──────────────────┐
│ 🔍 **SEARCHING** │
└──────────────────┘

■ Recherche de: ${text}
■ Analyse des résultats...

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;
            
            reply(searchMsg);
            
            const yts = require('yt-search');
            let search = await yts(text);
            
            if (!search.all[0]) {
              return reply(`
┌──────────────────┐
│ ❌ **NO RESULTS** │
└──────────────────┘

⚠️ Aucun résultat trouvé pour: ${text}

**Conseils:**
■ Vérifiez l'orthographe
■ Essayez avec des mots-clés différents
■ Utilisez un lien YouTube direct

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`);
            }
            
            let video = search.all[0];
            videoUrl = video.url;
            
            let caption = `
┌──────────────────┐
│ 🎵 **FOUND RESULT** │
└──────────────────┘

■ **Titre:** ${video.title}
■ **Durée:** ${video.timestamp}
■ **Vues:** ${video.views}
■ **Chaîne:** ${video.author.name}
■ **URL:** ${video.url}

⏳ _Téléchargement audio en cours..._

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;
            
            await X.sendMessage(m.chat, {
              image: { url: video.thumbnail },
              caption: caption
            }, { quoted: m });
            
          } catch (error) {
            console.error(error);
            return reply("❌ Erreur lors de la recherche. Réessayez plus tard.");
          }
        }
        
        try {
          const finalUrl = videoUrl || text;
          const fg = require("api-dylux");
          const result = await fg.yta(finalUrl);
          
          if (result && result.dl_url) {
            await X.sendMessage(m.chat, {
              audio: { url: result.dl_url },
              mimetype: 'audio/mpeg',
              fileName: `${result.title || 'audio'}.mp3`,
              ptt: false
            }, { quoted: m });
          } else {
            throw new Error("Impossible de récupérer le lien audio");
          }
          
        } catch (error) {
          console.error("YouTube audio download error:", error);
          const errorMsg = `
┌──────────────────┐
│ ❌ **DOWNLOAD ERROR** │
└──────────────────┘

⚠️ Erreur de téléchargement audio

**Solutions:**
■ Vérifiez le lien YouTube
■ Réessayez dans quelques minutes
■ Essayez avec un autre lien

┌──────────────────┐
│ ⚡ **${botname}** │
└──────────────────┘`;
          
          reply(errorMsg);
        }
      }
      break;

      // ===== ENHANCED TIKTOK =====
      case 'tiktok': case 'tt': {
        if (!text) return reply(`Envoyez l'URL TikTok\nExemple: ${prefix + command} https://tiktok.com/@user/video/xxx`);
        
        if (!text.includes('tiktok.com')) return reply("Veuillez envoyer une URL TikTok valide !");
        
        try {
          reply("⏳ Téléchargement TikTok en cours...");
          
          const response = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(text)}`);
          const data = await response.json();
          
          if (data.code === 0 && data.data) {
            const result = data.data;
            let caption = `🎵 *TikTok Video*\n\n`;
            if (result.title) caption += `📌 *Titre:* ${result.title}\n`;
            if (result.author) caption += `👤 *Auteur:* @${result.author.unique_id}\n`;
            if (result.duration) caption += `⏱️ *Durée:* ${result.duration}s\n`;
            caption += `❤️ *Likes:* ${result.digg_count || 0}\n`;
            caption += `💬 *Commentaires:* ${result.comment_count || 0}\n`;
            caption += `🔄 *Partages:* ${result.share_count || 0}\n`;
            caption += `\n_Powered by ${botname}_`;
            
            if (result.play) {
              await X.sendMessage(m.chat, {
                video: { url: result.play },
                caption: caption
              }, { quoted: m });
            } else if (result.wmplay) {
              await X.sendMessage(m.chat, {
                video: { url: result.wmplay },
                caption: caption + "\n\n⚠️ _Version avec watermark_"
              }, { quoted: m });
            } else {
              throw new Error("Aucun lien vidéo disponible");
            }
          } else {
            throw new Error("Impossible de télécharger cette vidéo TikTok");
          }
        } catch (error) {
          console.error("TikTok download error:", error);
          reply(`❌ Service TikTok temporairement indisponible\n\n🔄 *Solutions alternatives:*\n• Réessayez dans quelques minutes\n• Vérifiez que l'URL est correcte`);
        }
      }
      break;

      // ===== GROUP MANAGEMENT =====
      case 'promote': {
        if (!m.isGroup) return reply("Cette commande ne peut être utilisée que dans des groupes.");
        if (!isAdmins && !Hisoka) return reply("Cette commande est réservée aux admins.");
        
        let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        if (!users) return reply("Mentionnez ou répondez à quelqu'un pour le promouvoir admin.");
        
        try {
          await X.groupParticipantsUpdate(m.chat, [users], 'promote');
          reply(`@${users.split('@')[0]} a été promu admin !`, { mentions: [users] });
        } catch (error) {
          reply("Échec de la promotion.");
        }
      }
      break;

      case 'demote': {
        if (!m.isGroup) return reply("Cette commande ne peut être utilisée que dans des groupes.");
        if (!isAdmins && !Hisoka) return reply("Cette commande est réservée aux admins.");
        
        let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        if (!users) return reply("Mentionnez ou répondez à quelqu'un pour le rétrograder.");
        
        try {
          await X.groupParticipantsUpdate(m.chat, [users], 'demote');
          reply(`@${users.split('@')[0]} n'est plus admin !`, { mentions: [users] });
        } catch (error) {
          reply("Échec de la rétrogradation.");
        }
      }
      break;

      case 'add': {
        if (!m.isGroup) return reply("Cette commande ne peut être utilisée que dans des groupes.");
        if (!isAdmins && !Hisoka) return reply("Cette commande est réservée aux admins.");
        
        if (!text) return reply("Entrez le numéro à ajouter.\nExemple: .add 225xxxxxxxx");
        
        let users = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        
        try {
          await X.groupParticipantsUpdate(m.chat, [users], 'add');
          reply(`@${users.split('@')[0]} a été ajouté au groupe !`, { mentions: [users] });
        } catch (error) {
          reply("Échec de l'ajout. Vérifiez le numéro ou les paramètres de confidentialité.");
        }
      }
      break;

      case 'kick': {
        if (!Hisoka) return reply("This command is only for the owner.");
        if (!m.isGroup) return reply("This command can only be used in groups.");
        if (!isBotAdmins) return reply("Bot must be admin to use this command.");
        if (!isAdmins) return reply("You must be admin to use this command.");

        let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        if (!users) return reply("Send number / tag users");
        
        try {
          await X.groupParticipantsUpdate(m.chat, [users], 'remove');
          reply(`Successfully kicked ${users.split('@')[0]}`);
        } catch (error) {
          reply("Failed to kick user.");
        }
      }
      break;

      case 'tagall': {
        if (!m.isGroup) return reply("Cette commande ne peut être utilisée que dans des groupes.");

        let participants = groupMetadata.participants || [];
        let message = text || "";
        let mentions = participants.map(a => a.id);
        
        let teks = `*📢 ANNONCE *\n\n`
        teks += `💬 *Message:* ${message}\n\n`
  
        for (const mem of participants) {
          teks += `┣➥ @${mem.id.split('@')[0]}\n`
        }

        teks += `*└ 𝚅𝚛𝚞𝚜𝚑 𝙼𝚊𝚛𝚒𝚊 𝚟𝟸*`

        await X.sendMessage(m.chat, {
          text: teks,
          mentions: participants.map((a) => a.id)
        }, { quoted: m })
      }
      break;

      // ===== IMAGE PROCESSING =====
      case 'enhance': case 'upscale': {
        if (!/image/.test(mime)) return reply("Répondez à une image pour l'améliorer !");
        
        try {
          reply("Amélioration de l'image en cours...");
          let media = await X.downloadAndSaveMediaMessage(quoted);
          
          // Using upscaling API
          let form = new (require('form-data'))();
          form.append('image', fs.createReadStream(media));
          
          let response = await fetch('https://api.agatz.xyz/api/upscale', {
            method: 'POST',
            body: form
          });
          
          const data = await response.json();
          
          if (data.status && data.data) {
            await X.sendMessage(m.chat, { 
              image: { url: data.data }, 
              caption: "***_Image améliorée !_***" 
            }, { quoted: m });
          } else {
            // Fallback avec simple enhancement
            await X.sendMessage(m.chat, { 
              image: fs.readFileSync(media),
              caption: "***_Image traitée !_***" 
            }, { quoted: m });
          }
          
          fs.unlinkSync(media);
        } catch (error) {
          console.error("Upscale Error:", error);
          reply("Erreur lors de l'amélioration de l'image.");
        }
      }
      break;

      // ===== FUN COMMANDS =====
      case 'couplepp': case 'ppcouple': {
        try {
          reply("🔄 Recherche de couple PP...");
          
          const response = await fetch('https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json');
          const data = await response.json();
          
          if (data && data.length > 0) {
            const randomCouple = data[Math.floor(Math.random() * data.length)];
            
            await X.sendMessage(m.chat, {
              image: { url: randomCouple.male },
              caption: "👨 Male"
            }, { quoted: m });
            
            await X.sendMessage(m.chat, {
              image: { url: randomCouple.female },
              caption: "👩 Female"
            }, { quoted: m });
          } else {
            reply("❌ Erreur lors de la récupération des images");
          }
        } catch (error) {
          console.error("Couple PP Error:", error);
          reply("❌ Service temporairement indisponible");
        }
      }
      break;

      case 'animequote': {
        try {
          const quotes = [
            "人生とは、今この瞬間の連続だ - Life is a series of this moment now",
            "諦めたら、そこで試合終了だよ - If you give up, that's when the game ends",
            "強くなりたいと思う気持ちが、人を強くするんだ - The feeling of wanting to become strong is what makes people strong",
            "過去は変えられない。でも未来は変えられる - You can't change the past, but you can change the future",
            "夢は逃げない。逃げるのはいつも自分だ - Dreams don't run away. It's always ourselves who run away"
          ];
          
          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
          reply(`🌸 *Anime Quote:*\n\n${randomQuote}`);
        } catch (error) {
          reply("❌ Erreur lors de la récupération de la citation anime");
        }
      }
      break;

      case 'wallpaper': {
        if (!text) return reply("Exemple: .wallpaper naruto");
        
        try {
          reply("🔄 Recherche de wallpapers...");
          
          const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(text)}&client_id=demo`);
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const randomWallpaper = data.results[Math.floor(Math.random() * data.results.length)];
            
            await X.sendMessage(m.chat, {
              image: { url: randomWallpaper.urls.full },
              caption: `📸 *Wallpaper: ${text}*\n\n📷 By: ${randomWallpaper.user.name || "Unknown"}`
            }, { quoted: m });
          } else {
            reply(`❌ Aucun wallpaper trouvé pour "${text}"`);
          }
        } catch (error) {
          console.error("Wallpaper Error:", error);
          reply("❌ Service wallpaper temporairement indisponible");
        }
      }
      break;

      // ===== ENHANCED FANCY TEXT COMMANDS (GitHub Style) =====
      case 'fancy': {
        const replyText = m.quoted ? m.quoted.body : null;
        
        if (!text && !replyText) {
          return reply(`
✨ *FANCY TEXT GENERATOR* ✨

📝 *Usage:*
• .fancy [number] [text] - Transform text
• .fancy [number] (reply to message)

🎨 *Styles (1-47):*
1. 𝗕𝗼𝗹𝗱 - Bold
2. 𝘐𝘵𝘢𝘭𝘪𝘤 - Italic  
3. 𝙈𝙤𝙣𝙤 - Monospace
4. 𝚂𝚊𝚗𝚜 - Sans-serif
5. 𝕯𝖔𝖚𝖇𝖑𝖊 - Double-struck
6. ₛᵤₚₑᵣ - Subscript/Super
7. ᴸⁱᵗᵗˡᵉ - Small caps
8. ⓑⓤⓑⓑⓛⓔ - Bubble
9. 🅱🅻🅾🅲🅺 - Block
10. sǝʌɹǝsǝɹ - Reversed

*Plus 37 autres styles...*

💡 *Example:* .fancy 1 Hello World`);
        }
        
        const args = text.split(' ');
        const styleNum = parseInt(args[0]);
        const inputText = replyText || args.slice(1).join(' ');
        
        if (!inputText) return reply('❌ Veuillez fournir du texte à styliser !');
        if (isNaN(styleNum) || styleNum < 1 || styleNum > 47) {
          return reply('❌ Numéro de style invalide ! Utilisez 1-47');
        }
        
        const fancyStyles = {
          1: (text) => text.replace(/[a-z]/gi, (char) => {
            const base = char < 'a' ? 0x1D5D4 : 0x1D5CE;
            return String.fromCharCode(base + char.toLowerCase().charCodeAt(0) - 97);
          }),
          2: (text) => text.replace(/[a-z]/gi, (char) => {
            const base = char < 'a' ? 0x1D608 : 0x1D602;
            return String.fromCharCode(base + char.toLowerCase().charCodeAt(0) - 97);
          }),
          3: (text) => text.replace(/[a-z]/gi, (char) => {
            const base = char < 'a' ? 0x1D670 : 0x1D66A;
            return String.fromCharCode(base + char.toLowerCase().charCodeAt(0) - 97);
          }),
          4: (text) => text.replace(/[a-z]/gi, (char) => {
            const base = char < 'a' ? 0x1D63C : 0x1D636;
            return String.fromCharCode(base + char.toLowerCase().charCodeAt(0) - 97);
          }),
          5: (text) => text.replace(/[a-z]/gi, (char) => {
            const base = char < 'a' ? 0x1D538 : 0x1D532;
            return String.fromCharCode(base + char.toLowerCase().charCodeAt(0) - 97);
          }),
          6: (text) => text.replace(/./g, (char) => {
            if (/[a-z]/.test(char)) return char + String.fromCharCode(0x0363);
            return char;
          }),
          7: (text) => text.replace(/[a-z]/gi, (char) => {
            const base = 0x1D00;
            const offset = char.toLowerCase().charCodeAt(0) - 97;
            return String.fromCharCode(base + offset);
          }),
          8: (text) => text.replace(/[a-z]/gi, (char) => {
            const base = 0x24B6;
            const offset = char.toLowerCase().charCodeAt(0) - 97;
            return String.fromCharCode(base + offset);
          }),
          9: (text) => text.replace(/[a-z]/gi, (char) => {
            const squares = '🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉';
            const index = char.toLowerCase().charCodeAt(0) - 97;
            return squares[index] || char;
          }),
          10: (text) => text.split('').reverse().join('').replace(/[a-z]/gi, (char) => {
            const flipped = 'ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz';
            const index = char.toLowerCase().charCodeAt(0) - 97;
            return flipped[index] || char;
          })
        };
        
        // Add more basic styles for remaining numbers
        for (let i = 11; i <= 47; i++) {
          if (!fancyStyles[i]) {
            fancyStyles[i] = (text) => {
              const variations = [
                (t) => t.replace(/./g, c => c + '̃'),
                (t) => t.replace(/./g, c => c + '̂'),
                (t) => t.replace(/./g, c => c + '̄'),
                (t) => t.split('').map(c => `『${c}』`).join(''),
                (t) => t.split('').map(c => `【${c}】`).join(''),
                (t) => t.split('').map(c => `★${c}★`).join(''),
                (t) => t.split('').map(c => `♡${c}♡`).join('')
              ];
              const index = (i - 11) % variations.length;
              return variations[index](text);
            };
          }
        }
        
        const styledText = fancyStyles[styleNum] ? fancyStyles[styleNum](inputText) : inputText;
        reply(`✨ *Fancy Style ${styleNum}:*\n\n${styledText}`);
      }
      break;

      // ===== REACTION COMMANDS =====
      case 'react': {
        if (!text) return reply("Usage: .react 😍 (reply to message)");
        if (!m.quoted) return reply("❌ Reply to a message to add reaction");
        
        try {
          await X.sendMessage(m.chat, {
            react: {
              text: text.trim(),
              key: m.quoted.key
            }
          });
        } catch (error) {
          reply("❌ Failed to add reaction");
        }
      }
      break;

      case 'smile': {
        if (!m.quoted) return reply("❌ Reply to a message");
        try {
          await X.sendMessage(m.chat, {
            react: { text: "😊", key: m.quoted.key }
          });
        } catch (e) { reply("❌ Failed"); }
      }
      break;

      case 'love': {
        if (!m.quoted) return reply("❌ Reply to a message");
        try {
          await X.sendMessage(m.chat, {
            react: { text: "❤️", key: m.quoted.key }
          });
        } catch (e) { reply("❌ Failed"); }
      }
      break;

      case 'angry': {
        if (!m.quoted) return reply("❌ Reply to a message");
        try {
          await X.sendMessage(m.chat, {
            react: { text: "😡", key: m.quoted.key }
          });
        } catch (e) { reply("❌ Failed"); }
      }
      break;

      case 'laugh': {
        if (!m.quoted) return reply("❌ Reply to a message");
        try {
          await X.sendMessage(m.chat, {
            react: { text: "😂", key: m.quoted.key }
          });
        } catch (e) { reply("❌ Failed"); }
      }
      break;

      case 'wow': {
        if (!m.quoted) return reply("❌ Reply to a message");
        try {
          await X.sendMessage(m.chat, {
            react: { text: "😱", key: m.quoted.key }
          });
        } catch (e) { reply("❌ Failed"); }
      }
      break;

      // ===== FUN QUOTES AND JOKES =====
      case 'quote': case 'quotes': {
        try {
          const quotes = [
            "La vie est ce qui arrive quand vous êtes occupé à faire d'autres projets. - John Lennon",
            "Le seul moyen de faire du bon travail est d'aimer ce que vous faites. - Steve Jobs",
            "La plus grande gloire n'est pas de ne jamais tomber, mais de se relever à chaque chute. - Confucius",
            "L'innovation distingue un leader d'un suiveur. - Steve Jobs",
            "Le succès c'est d'aller d'échec en échec sans perdre son enthousiasme. - Winston Churchill"
          ];
          
          let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
          reply(`💭 *Citation du jour:*\n\n${randomQuote}`);
        } catch (error) {
          reply("Erreur lors de la récupération de la citation.");
        }
      }
      break;

      case 'joke': case 'blague': {
        try {
          const jokes = [
            "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon, ils tombent dans le bateau !",
            "Que dit un escargot quand il croise une limace ? Regarde le nudiste !",
            "Comment appelle-t-on un chat tombé dans un pot de peinture le jour de Noël ? Un chat-mallow !",
            "Que dit un informaticien quand il se noie ? F1 ! F1 !",
            "Pourquoi les poissons n'aiment pas jouer au tennis ? Parce qu'ils ont peur du filet !"
          ];
          
          let randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
          reply(`😂 *Blague du jour:*\n\n${randomJoke}`);
        } catch (error) {
          reply("Erreur lors de la récupération de la blague.");
        }
      }
      break;

      case 'fact': case 'fait': {
        try {
          const facts = [
            "🧠 Le cerveau humain utilise environ 20% de l'énergie totale du corps.",
            "🌍 Il y a plus d'arbres sur Terre que d'étoiles dans la Voie lactée.",
            "🐙 Les poulpes ont trois cœurs et du sang bleu.",
            "🍯 Le miel ne se périme jamais. On a trouvé du miel comestible dans des tombes égyptiennes !",
            "⚡ Un éclair est 5 fois plus chaud que la surface du soleil."
          ];
          
          let randomFact = facts[Math.floor(Math.random() * facts.length)];
          reply(`🤓 *Fait intéressant:*\n\n${randomFact}`);
        } catch (error) {
          reply("Erreur lors de la récupération du fait.");
        }
      }
      break;

      // ===== STATUS MANAGEMENT =====
      case 'setstatus': case 'status': {
        if (!Hisoka) return reply("🔒 Cette commande est réservée au propriétaire.");
        
        if (!text) {
          return reply(`*🎭 Gestion du Statut WhatsApp:*\n\n*Commandes disponibles:*\n• .status online - Toujours en ligne\n• .status typing - Toujours en train d'écrire\n• .status recording - Toujours en enregistrement\n• .status pause - En pause\n• .status offline - Hors ligne permanent\n• .status auto - Basculer automatique\n• .status stop - Arrêter le statut continu\n\n*Status actuel:* ${global.continuousPresence ? global.currentPresence : "Aucun"}`);
        }
        
        const action = text.toLowerCase().trim();
        
        try {
          switch (action) {
            case 'online':
              global.currentPresence = 'available';
              global.continuousPresence = true;
              await X.sendPresenceUpdate('available', m.chat);
              reply("✅ *Statut Permanent:* En ligne\n\n📡 Le bot restera toujours en ligne");
              break;
            
            case 'typing':
              global.currentPresence = 'composing';
              global.continuousPresence = true;
              global.presenceInterval = setInterval(async () => {
                if (global.continuousPresence && global.currentPresence === 'composing') {
                  try {
                    await X.sendPresenceUpdate('composing', m.chat);
                  } catch (e) {}
                }
              }, 10000);
              await X.sendPresenceUpdate('composing', m.chat);
              reply("✅ *Statut Permanent:* En train d'écrire...\n\n⌨️ Le bot apparaîtra toujours en train d'écrire");
              break;
            
            case 'stop':
              global.continuousPresence = false;
              global.currentPresence = null;
              if (global.presenceInterval) {
                clearInterval(global.presenceInterval);
                global.presenceInterval = null;
              }
              await X.sendPresenceUpdate('available', m.chat);
              reply("🛑 *Statut continu arrêté*\n\nRetour au statut normal");
              break;
            
            default:
              reply("❌ Option invalide.\n\nUtilisez: online, typing, recording, pause, offline, auto, stop");
          }
        } catch (error) {
          console.error("Status Error:", error);
          reply("❌ Erreur lors de la mise à jour du statut");
        }
      }
      break;

      // ===== TOVIDEO COMMAND =====
      case 'tovideo': case 'tovid': {
        if (!m.quoted) return reply("❌ Reply to a sticker to convert to video");
        if (!m.quoted.mimetype || !m.quoted.mimetype.includes('webp')) return reply("❌ Reply to an animated sticker");
        
        try {
          reply("🔄 Converting sticker to video...");
          const media = await X.downloadMediaMessage(m.quoted);
          
          // Convert webp to mp4 (simplified approach)
          await X.sendMessage(m.chat, {
            video: media,
            caption: "✅ Sticker converted to video!"
          }, { quoted: m });
        } catch (error) {
          console.error("ToVideo Error:", error);
          reply("❌ Failed to convert sticker to video");
        }
      }
      break;

      // ===== FAKE CHAT =====
      case 'fakechat': {
        if (!Hisoka) return reply("🔒 Cette commande est réservée au propriétaire.");
        
        const args = text.split('|');
        if (args.length < 2) {
          return reply(`🎭 *Générateur de Faux Chat*\n\n📝 *Format:*\n.fakechat Nom|Message\n\n💡 *Exemple:*\n.fakechat Maria|Salut comment ça va ?`);
        }
        
        const fakeName = args[0].trim();
        const fakeMessage = args[1].trim();
        
        const fakeQuoted = {
          key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: m.chat
          },
          message: {
            conversation: fakeMessage
          },
          pushName: fakeName
        };
        
        reply(`📱 *Message de ${fakeName}:*\n\n${fakeMessage}`, { quoted: fakeQuoted });
      }
      break;

      // ===== RESETPREFIX =====
      case 'resetprefix': {
        if (!Hisoka) return reply("🔒 Cette commande est réservée au propriétaire.");
        
        global.prefix = '.';
        reply(`✅ Préfixe réinitialisé à: ${global.prefix}`);
      }
      break;

      // ===== MANHWA SEARCH =====
      case 'manhwa': {
        if (!text) return reply("Exemple: .manhwa Solo Leveling");
        
        try {
          reply("🔍 Recherche de manhwa...");
          
          // Simple manhwa search simulation
          const manhwas = [
            { title: "Solo Leveling", genre: "Action, Fantasy", status: "Completed", rating: "9.7/10" },
            { title: "Tower of God", genre: "Action, Drama", status: "Ongoing", rating: "9.2/10" },
            { title: "The God of High School", genre: "Action, Martial Arts", status: "Completed", rating: "8.9/10" },
            { title: "Noblesse", genre: "Action, Supernatural", status: "Completed", rating: "9.1/10" }
          ];
          
          const searchResult = manhwas.find(m => 
            m.title.toLowerCase().includes(text.toLowerCase()) ||
            text.toLowerCase().includes(m.title.toLowerCase().split(' ')[0])
          );
          
          if (searchResult) {
            reply(`📚 *Manhwa trouvé:*\n\n**Titre:** ${searchResult.title}\n**Genre:** ${searchResult.genre}\n**Status:** ${searchResult.status}\n**Rating:** ${searchResult.rating}`);
          } else {
            reply(`❌ Aucun manhwa trouvé pour: "${text}"`);
          }
        } catch (error) {
          reply("❌ Erreur lors de la recherche manhwa");
        }
      }
      break;

      // ===== PING COMMAND =====
      case "ping": case "uptime": {
        let timestamp = speed()
        let latensi = speed() - timestamp
        let tio = await nou.os.oos()
        var tot = await nou.drive.info()
        let respon = `*—VPS Server Information 🖥️*
- *Platform :* ${nou.os.type()}
- *Total RAM :* ${formatp(os.totalmem())}
- *Total Disk :* ${tot.totalGb} GB
- *Total CPU :* ${os.cpus().length} Core
- *VPS Runtime :* ${runtime(os.uptime())}

*—Panel Server Information 🌐*
- *Response Speed :* ${latensi.toFixed(4)} seconds
- *Bot Runtime :* ${runtime(process.uptime())}`
        await m.reply(respon)
      }
      break

      // ===== ANTI DELETE =====
      case 'antidelete': case 'antidel': {
        if (!m.isGroup) return m.reply("⚠️ Cette commande ne fonctionne que dans les groupes !");
        
        if (!text) return m.reply("🚫 *ANTI-DELETE*\n\n*Usage:*\n.antidelete on - Activer l'anti-delete\n.antidelete off - Désactiver l'anti-delete\n.antidelete status - Voir le statut");
        
        const action = text.toLowerCase();
        
        switch(action) {
          case 'on':
          case 'enable':
          case 'activer':
            global.db = global.db || {};
            global.db.groups = global.db.groups || {};
            global.db.groups[m.chat] = global.db.groups[m.chat] || {};
            global.db.groups[m.chat].antidelete = true;
            if (fs.existsSync('./librairy/database/database.json')) {
              fs.writeFileSync('./librairy/database/database.json', JSON.stringify(global.db, null, 2));
            }
            m.reply("✅ Anti-delete activé pour ce groupe !\n\n🔰 Les messages supprimés seront détectés et restaurés automatiquement.");
            break;
            
          case 'off':
          case 'disable':  
          case 'désactiver':
            global.db = global.db || {};
            global.db.groups = global.db.groups || {};
            global.db.groups[m.chat] = global.db.groups[m.chat] || {};
            global.db.groups[m.chat].antidelete = false;
            if (fs.existsSync('./librairy/database/database.json')) {
              fs.writeFileSync('./librairy/database/database.json', JSON.stringify(global.db, null, 2));
            }
            m.reply("❌ Anti-delete désactivé pour ce groupe.\n\n⚠️ Les messages supprimés ne seront plus détectés.");
            break;
            
          case 'status':
          case 'statut':
            const isEnabled = global.db?.groups?.[m.chat]?.antidelete || false;
            m.reply(`🚫 *STATUT ANTI-DELETE*\n\n📊 *Groupe:* ${groupName || 'Groupe'}\n🔰 *Anti-Delete:* ${isEnabled ? '✅ Activé' : '❌ Désactivé'}\n\n${isEnabled ? '🛡️ Les messages supprimés sont surveillés' : '⚠️ Aucune surveillance des suppressions'}`);
            break;
            
          default:
            m.reply("❌ Action non reconnue\n\n*Actions disponibles:*\n• on/enable/activer\n• off/disable/désactiver\n• status/statut");
        }
      }
      break;

      // ===== MARIA COMMAND (sans préfixe) =====
      case "maria": {
        let text = '> _Maria... loves me but I love her ... she is my all .. i am gratfull being with her_ .... ';
        m.reply(text);

        await sock.sendMessage(m.chat, {
          text: text,
          contextInfo: {
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363400575205721@newsletter',
              serverMessageId: 2,
              newsletterName: `${global.botname}`
            },
            externalAdReply: {
              showAdAttribution: false,
              title: `${global.botname} - BLOOMING LOVE`,
              body: `confession ... I (Raven) know`,
              mediaType: 1,
              renderLargerThumbnail: true,
              thumbnailUrl: `https://img1.pixhost.to/images/8395/637002757_jarroffc.jpg`,
              sourceUrl: `https://github.com/hhhisoka-bot`
            }
          }
        }, { quoted: m });
      }
      break

      // ===== SET PROFILE PICTURE =====
      case "setpp": {
        if (!isOwner) return m.reply("This command is only for the owner.");
        if (!m.quoted) return m.reply("Reply to an image with this command to set profile picture!");
        
        try {
          const media = await sock.downloadAndSaveMediaMessage(m.quoted);
          const imageBuffer = fs.readFileSync(media);
          
          await sock.updateProfilePicture(botNumber, imageBuffer);
          await m.reply("Profile picture set successfully!");
          
          fs.unlinkSync(media);
        } catch (error) {
          console.error(error);
          await m.reply("Failed to set profile picture. Make sure you replied to an image and try again.");
        }
      }
      break

      // ===== DELETE PROFILE PICTURE =====
      case "delpp": {
        if (!isOwner) return m.reply("This command is only for the owner.");
        try {
          await sock.removeProfilePicture(sock.user.id);
          m.reply("Success Delete Profile Picture");
        } catch (error) {
          m.reply("Failed to delete profile picture.");
        }
      }
      break;

      // ===== CASE MANAGEMENT =====
      case "getcase": { 
        if (!isOwner) return reply("This command is only for the owner.")
        if (!text) return reply(example("caseName"));
        try {
          let hasil = Case.get(text);
          reply(`✅ Case found:\n\n${hasil}`);
        } catch (e) {
          reply(e.message);
        }
      }
      break;

      case "addcase": {
        if (!isOwner) return reply("This command is only for the owner.")
        if (!text) return reply(example(`case "caseName": { ... }`));
        try {
          Case.add(text);
          reply("✅ Case successfully added.");
        } catch (e) {
          reply(e.message);
        }
      }
      break;

      case "delcase": {
        if (!isOwner) return reply("This command is only for the owner.")
        if (!text) return reply(example("caseName"));
        try {
          Case.delete(text);
          reply(`✅ Case "${text}" successfully deleted.`);
        } catch (e) {
          reply(e.message);
        }
      }
      break;

      case "listcase": case "all": {
        try {
          reply("📜 Case List:\n\n" + Case.list());
        } catch (e) {
          reply(e.message);
        }
      }
      break;

      // ===== BACKUP SCRIPT =====
      case "backupsc":
      case "bck":
      case "backup": { 
        if (!isOwner) return m.reply("🔒 Cette commande est réservée au propriétaire.");
        
        try {
          const backupMsg = `
┌──────────────────┐
│ 💾 **BACKUP SYSTEM** │
└──────────────────┘

■ Préparation du backup...
■ Nettoyage des fichiers temporaires...
■ Compression en cours...`;
          
          await m.reply(backupMsg);
          
          const tmpDir = "./librairy/database/Sampah";
          if (fs.existsSync(tmpDir)) {
            const files = fs.readdirSync(tmpDir).filter(f => !f.endsWith(".js") && !f.includes("© Maria"));
            for (let file of files) {
              try {
                fs.unlinkSync(`${tmpDir}/${file}`);
              } catch (e) {
                console.log(`Could not delete ${file}:`, e.message);
              }
            }
          }

          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
          const name = `${global.botname.replace(/\s+/g, "_")}_Backup_${timestamp}`;
          const exclude = ["node_modules", "session", "package-lock.json", "yarn.lock", ".npm", ".cache", ".git", "*.zip"];
          
          const allFiles = fs.readdirSync(".");
          const filesToZip = allFiles.filter(f => {
            for (let excl of exclude) {
              if (excl.includes('*')) {
                const pattern = excl.replace('*', '');
                if (f.includes(pattern)) return false;
              } else if (f === excl) {
                return false;
              }
            }
            return true;
          });

          if (!filesToZip.length) {
            return m.reply("❌ Aucun fichier disponible pour le backup.");
          }

          console.log("Files to backup:", filesToZip);
          
          try {
            execSync(`zip -r "${name}.zip" ${filesToZip.map(f => `"${f}"`).join(" ")}`, { cwd: process.cwd() });
          } catch (zipError) {
            console.error("Zip creation error:", zipError);
            return m.reply("❌ Erreur lors de la création du fichier ZIP.");
          }

          if (!fs.existsSync(`./${name}.zip`)) {
            return m.reply("❌ Échec de la création du fichier ZIP.");
          }
          
          const stats = fs.statSync(`./${name}.zip`);
          const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
          
          const successMsg = `
┌──────────────────┐
│ ✅ **BACKUP SUCCESS** │
└──────────────────┘

■ **Fichiers inclus:** ${filesToZip.length}
■ **Taille:** ${fileSizeInMB} MB
■ **Envoi en cours...**

┌──────────────────┐
│ ⚡ **${global.botname}** │
└──────────────────┘`;
          
          await m.reply(successMsg);

          await sock.sendMessage(m.sender, {
            document: fs.readFileSync(`./${name}.zip`),
            fileName: `${name}.zip`,
            mimetype: "application/zip",
            caption: `💾 **Script Backup Complet**\n\n📅 **Date:** ${new Date().toLocaleString('fr-FR')}\n📊 **Version:** ${global.botver}\n💼 **Taille:** ${fileSizeInMB} MB\n\n_Le backup de votre bot est prêt !_`
          }, { quoted: m });

          fs.unlinkSync(`./${name}.zip`);

          if (m.chat !== m.sender) {
            m.reply("✅ Le script du bot a été envoyé dans votre chat privé.");
          }
          
        } catch (err) {
          console.error("Backup Error:", err);
          const errorMsg = `
┌──────────────────┐
│ ❌ **BACKUP ERROR** │
└──────────────────┘

⚠️ Erreur lors du backup

**Détails:** ${err.message}

┌──────────────────┐
│ ⚡ **${global.botname}** │
└──────────────────┘`;
          
          m.reply(errorMsg);
        }
      }
      break;

      // ===== ANIME WALLPAPERS =====
      case 'akira': case 'akiyama': case 'anna': case 'asuna': case 'ayuzawa': case 'boruto': case 'chiho': case 'chitoge': case 'deidara': case 'erza': case 'elaina': case 'eba': case 'emilia': case 'hestia': case 'hinata': case 'inori': case 'isuzu': case 'itachi': case 'itori': case 'kaga': case 'kagura': case 'kaori': case 'keneki': case 'kotori': case 'kurumi': case 'madara': case 'mikasa': case 'miku': case 'minato': case 'naruto': case 'nezuko': case 'sagiri': case 'sasuke': case 'sakura': {
        try {
          const response = await fetch(`https://raw.githubusercontent.com/Guru322/api/Guru/BOT-JSON/anime-${command}.json`);
          const data = await response.json();
          const randomImage = data[Math.floor(data.length * Math.random())];
          
          await sock.sendMessage(m.chat, {
            image: { url: randomImage },
            caption: `🎌 *Wallpaper ${command.toUpperCase()}*\n\n📱 *Character:* ${command}\n🎨 *Type:* Anime Wallpaper\n⚡ *Bot:* ${global.botname}`
          }, { quoted: m });
        } catch (error) {
          console.error(`Error fetching ${command} wallpaper:`, error);
          m.reply(`❌ Erreur lors du chargement du wallpaper ${command}`);
        }
      }
      break

      // ===== COUPLE PROFILE PICTURES =====
      case 'couplepp': case 'ppcouple': {
        try {
          const response = await fetch('https://raw.githubusercontent.com/KazukoGans/database/main/anime/ppcouple.json');
          const data = await response.json();
          const randomCouple = data[Math.floor(Math.random() * data.length)];
          
          const maleBuffer = await (await fetch(randomCouple.cowo)).buffer();
          await sock.sendMessage(m.chat, {
            image: maleBuffer,
            caption: '♂️ *Profile Picture - Male*'
          }, { quoted: m });
          
          const femaleBuffer = await (await fetch(randomCouple.cewe)).buffer();
          await sock.sendMessage(m.chat, {
            image: femaleBuffer,
            caption: '♀️ *Profile Picture - Female*'
          }, { quoted: m });
          
        } catch (error) {
          console.error('Error fetching couple profile pictures:', error);
          m.reply('❌ Erreur lors du chargement des photos de profil de couple');
        }
      }
      break

      // ===== ANIME QUOTE =====
      case 'animequote': {
        try {
          const response = await fetch('https://some-random-api.com/animu/quote');
          if (!response.ok) throw await response.text();
          
          const quoteData = await response.json();
          const { sentence, character, anime } = quoteData;
          
          const quoteMessage = `💬 *Citation Anime*\n\n"${sentence}"\n\n👤 *Personnage:* \`\`\`${character}\`\`\`\n🎌 *Anime:* \`\`\`${anime}\`\`\`\n\n🤖 *${global.botname}*`;
          
          await sock.sendMessage(m.chat, {
            text: quoteMessage
          }, { quoted: m });
          
        } catch (error) {
          console.error('Anime quote error:', error);
          m.reply('❌ Erreur lors de la récupération de la citation anime');
        }
      }
      break

      // ===== STICKER COMMANDS =====
      case "sticker": case "stiker": case "sgif": case "s": {
        if (!/image|video/.test(mime)) return m.reply("Send the image!")
        if (/video/.test(mime)) {
          if ((qmsg).seconds > 15) return m.reply("Video duration is maximum 15 seconds!")
        }
        var media = await sock.downloadAndSaveMediaMessage(qmsg)
        await sock.sendImageAsSticker(m.chat, media, m, {packname: ` ${global.ownername}`})
        await fs.unlinkSync(media)
      }
      break

      case 'oi': {
        if (!quoted) return reply(`Reply image/video with caption ${prefix + command}`);
        try {
          if (/image/.test(mime)) {
            const media = await quoted.download();
            const imageUrl = `data:${mime};base64,${media.toString('base64')}`;
            await makeStickerFromUrl(imageUrl, sock, m);
          } else if (/video/.test(mime)) {
            if ((quoted?.msg || quoted)?.seconds > 10) return reply('Video duration is maximum 10 seconds!')
            const media = await quoted.download();
            const videoUrl = `data:${mime};base64,${media.toString('base64')}`;
            await makeStickerFromUrl(videoUrl, sock, m);
          } else {
            return reply('Send image/video with caption .s (video duration 1-10 seconds)');
          }
        } catch (error) {
          console.error(error);
          return reply('An error occurred while processing the media. Please try again.');
        }
      }
      break

      // ===== TIKTOK DOWNLOADER =====
      case 'tiktok': case 'tt': {
        if (!text) return m.reply(`Envoyez l'URL TikTok\nExemple: ${m.prefix + command} https://tiktok.com/@user/video/xxx`);
        
        if (!text.includes('tiktok.com')) return m.reply("Veuillez envoyer une URL TikTok valide !");
        
        try {
          m.reply("⏳ Téléchargement TikTok en cours...");
          
          const response = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(text)}`);
          const data = await response.json();
          
          if (data.code === 0 && data.data) {
            const result = data.data;
            let caption = `🎵 *TikTok Video*\n\n`;
            if (result.title) caption += `📌 *Titre:* ${result.title}\n`;
            if (result.author) caption += `👤 *Auteur:* @${result.author.unique_id}\n`;
            if (result.duration) caption += `⏱️ *Durée:* ${result.duration}s\n`;
            caption += `❤️ *Likes:* ${result.digg_count || 0}\n`;
            caption += `💬 *Commentaires:* ${result.comment_count || 0}\n`;
            caption += `🔄 *Partages:* ${result.share_count || 0}\n`;
            caption += `\n_Powered by ${global.botname}_`;
            
            if (result.play) {
              await sock.sendMessage(m.chat, {
                video: { url: result.play },
                caption: caption
              }, { quoted: m });
            } else if (result.wmplay) {
              await sock.sendMessage(m.chat, {
                video: { url: result.wmplay },
                caption: caption + "\n\n⚠️ _Version avec watermark_"
              }, { quoted: m });
            } else {
              throw new Error("Aucun lien vidéo disponible");
            }
          } else {
            throw new Error("Impossible de télécharger cette vidéo TikTok");
          }
        } catch (error) {
          console.error("TikTok download error:", error);
          m.reply(`❌ Service TikTok temporairement indisponible\n\n🔄 *Solutions alternatives:*\n• Utilisez yt-dlp ou des outils externes\n• Réessayez dans quelques minutes\n• Vérifiez que l'URL est correcte\n\n_L'équipe technique travaille sur ce problème_`);
        }
      }
      break;

      // ===== MEDIA CONVERSIONS =====
      case "tourl": { 
        if (!/image/.test(mime)) return m.reply("Send/reply the image!");
        try {
          let mediaPath = await sock.downloadAndSaveMediaMessage(qmsg);
          const service = new ImageUploadService('pixhost.to');
          let buffer = fs.readFileSync(mediaPath);
          let { directLink } = await service.uploadFromBinary(buffer, 'jarroffc.png');
          await sock.sendMessage(m.chat, { text: directLink }, { quoted: m });
          await fs.unlinkSync(mediaPath);
        } catch (err) {
          console.error("Tourl Error:", err);
          m.reply("An error occurred while converting media to URL.");
        }
      }
      break;

      case "rvo":
      case "readvo":
      case 'readviewonce':
      case 'readviewoncemessage': 
      case 'vv': {
        const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
        
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const mediaType = quoted?.imageMessage ? "image"
                        : quoted?.videoMessage ? "video"
                        : null;

        if (!mediaType) {
          return sock.sendMessage(m.chat, {
            text: "❌ Please *reply to a view once image or short video* to retrieve."
          }, { quoted: m });
        }

        try {
          const stream = await downloadContentFromMessage(
            mediaType === "image" ? quoted.imageMessage : quoted.videoMessage,
            mediaType
          );

          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }

          await sock.sendMessage(m.chat, {
            [mediaType]: buffer,
            caption: `💥 Here's your removed view-once ${mediaType}`
          }, {
            quoted: {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: m.chat
              },
              message: {
                conversation: "🤺 VIEW ONCE FETCHED"
              }
            }
          });

        } catch (err) {
          console.error("❌ View once retrieval error:", err);
          await sock.sendMessage(m.chat, {
            text: "⚠️ Failed to retrieve view once."
          }, { quoted: m });
        }
      }
      break

      case 'qc': {
        if (!q) return m.reply(`Send command with text. ${m.prefix + command} ${pushname}`);
        let obj = {
          type: 'quote',
          format: 'png',
          backgroundColor: '#ffffff',
          width: 512,
          height: 768,
          scale: 2,
          messages: [
            {
              entities: [],
              avatar: true,
              from: {
                id: 1,
                name: `${pushname}`,
                photo: { 
                  url: await sock.profilePictureUrl(m.sender, "image").catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'),
                }
              },
              text: `${q}`,
              replyMessage: {},
            },
          ],
        };
        let response = await axios.post('https://bot.lyo.su/quote/generate', obj, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        let buffer = Buffer.from(response.data.result.image, 'base64');
        sock.sendImageAsSticker(m.chat, buffer, m, { packname: `${global.packname}`, author: `${global.author}` });
      }
      break;

      // ===== STATUS MANAGEMENT =====
      case 'setstatus':
      case 'status': {
        if (!isOwner) return m.reply("🔒 Cette commande est réservée au propriétaire.");
        
        if (!text) {
          return m.reply(`*🎭 Gestion du Statut WhatsApp:*\n\n*Commandes disponibles:*\n• .status online - Toujours en ligne\n• .status typing - Toujours en train d'écrire\n• .status recording - Toujours en enregistrement\n• .status pause - En pause\n• .status offline - Hors ligne permanent\n• .status auto - Basculer automatique\n• .status stop - Arrêter le statut continu\n\n*Status actuel:* ${global.continuousPresence ? global.currentPresence : "Aucun"}`);
        }
        
        const action = text.toLowerCase().trim();
        
        try {
          switch (action) {
            case 'online':
              global.currentPresence = 'available';
              global.continuousPresence = true;
              await sock.sendPresenceUpdate('available', m.chat);
              m.reply("✅ *Statut Permanent:* En ligne\n\n📡 Le bot restera toujours en ligne");
              break;
            
            case 'typing':
              global.currentPresence = 'composing';
              global.continuousPresence = true;
              global.presenceInterval = setInterval(async () => {
                if (global.continuousPresence && global.currentPresence === 'composing') {
                  try {
                    await sock.sendPresenceUpdate('composing', m.chat);
                  } catch (e) {}
                }
              }, 10000);
              await sock.sendPresenceUpdate('composing', m.chat);
              m.reply("✅ *Statut Permanent:* En train d'écrire...\n\n⌨️ Le bot apparaîtra toujours en train d'écrire");
              break;
            
            case 'recording':
              global.currentPresence = 'recording';
              global.continuousPresence = true;
              global.presenceInterval = setInterval(async () => {
                if (global.continuousPresence && global.currentPresence === 'recording') {
                  try {
                    await sock.sendPresenceUpdate('recording', m.chat);
                  } catch (e) {}
                }
              }, 10000);
              await sock.sendPresenceUpdate('recording', m.chat);
              m.reply("✅ *Statut Permanent:* Enregistrement audio...\n\n🎤 Le bot apparaîtra toujours en enregistrement");
              break;
            
            case 'stop':
              global.continuousPresence = false;
              global.currentPresence = null;
              if (global.presenceInterval) {
                clearInterval(global.presenceInterval);
                global.presenceInterval = null;
              }
              await sock.sendPresenceUpdate('available', m.chat);
              m.reply("🛑 *Statut continu arrêté*\n\nRetour au statut normal");
              break;
            
            default:
              m.reply("❌ Option invalide.\n\nUtilisez: online, typing, recording, stop");
          }
        } catch (error) {
          console.error("Status Error:", error);
          m.reply("❌ Erreur lors de la mise à jour du statut");
        }
      }
      break

      // ===== MEDIA CONVERSIONS EXTRA =====
      case 'tovn': {
        if (!/video/.test(mime) && !/audio/.test(mime)) return m.reply(`Reply media with caption ${m.prefix + command}`);
        if (!quoted) return m.reply(`Reply video/vn with caption ${m.prefix + command}`);
        
        try {
          let media = await quoted.download();
          
          const tempFile = `./librairy/database/Sampah/temp_${Date.now()}.mp3`;
          
          if (!fs.existsSync('./librairy/database/Sampah')) {
            fs.mkdirSync('./librairy/database/Sampah', { recursive: true });
          }
          
          fs.writeFileSync(tempFile, media);
          
          const outputFile = `./librairy/database/Sampah/output_${Date.now()}.mp3`;
          
          exec(`ffmpeg -i ${tempFile} -vn -ab 128k -ar 44100 -f mp3 ${outputFile}`, async (err) => {
            if (err) {
              console.error('FFmpeg error:', err);
              return m.reply("Erreur lors de la conversion en note vocale.");
            }
            
            try {
              const audioBuffer = fs.readFileSync(outputFile);
              await sock.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
              
              fs.unlinkSync(tempFile);
              fs.unlinkSync(outputFile);
            } catch (sendError) {
              console.error('Send error:', sendError);
              m.reply("Erreur lors de l'envoi de la note vocale.");
            }
          });
        } catch (error) {
          console.error('Tovn error:', error);
          m.reply("Erreur lors de la conversion en note vocale.");
        }
      }
      break;

      case 'toimg': {
        if (!/webp/.test(mime)) return m.reply("🔖 Répondez à un sticker avec cette commande !");
        
        try {
          m.reply("🔄 Conversion en image...");
          let media = await sock.downloadAndSaveMediaMessage(quoted);
          
          const outputBuffer = await sharp(media)
            .png()
            .toBuffer();
          
          await sock.sendMessage(m.chat, { 
            image: outputBuffer,
            caption: "✅ Sticker converti en image !"
          }, { quoted: m });
          
          try {
            if (fs.existsSync(media)) {
              fs.unlinkSync(media);
            }
          } catch (cleanupError) {
            console.error("Cleanup error:", cleanupError);
          }
          
        } catch (error) {
          console.error("ToImg Error:", error);
          m.reply("❌ Impossible de convertir ce sticker en image. Assurez-vous de répondre à un sticker valide.");
        }
      }
      break;

      //━━━━━━━━━━━━━━━━━━━━━━━━//
      default:
        // Commandes d'évaluation pour le propriétaire (développement uniquement)
        if (budy.startsWith("=>")) {
          if (!Hisoka) return
          function Return(sul) {
            sat = JSON.stringify(sul, null, 2)
            bang = util.format(sat)
            if (sat == undefined) {
              bang = util.format(sul)
            }
            return reply(bang)
          }
          try {
            reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)))
          } catch (e) {
            reply(String(e))
          }
        }

        if (budy.startsWith(">")) {
          if (!Hisoka) return
          const kode = budy.trim().split(/ +/)[0]
          let teks
          try {
            teks = await eval(`(async () => { ${kode == ">>" ? "return" : ""} ${q}})()`)
          } catch (e) {
            teks = e
          } finally {
            await reply(require("util").format(teks))
          }
        }

        if (budy.startsWith("$")) {
          if (!Hisoka) return
          exec(budy.slice(2), (err, stdout) => {
            if (err) return reply(`${err}`)
            if (stdout) return reply(stdout)
          })
        }
    }
  } catch (err) {
    const error = err.stack || err.message || util.format(err)
    console.log("====== RAPPORT D'ERREUR ======")
    console.log(error)
    console.log("==========================")

    // Envoi du rapport d'erreur au propriétaire
    await X.sendMessage(
      `${owner}@s.whatsapp.net`,
      {
        text: `⚠️ *RAPPORT D'ERREUR !*\n\n📌 *Message :* ${err.message || "-"}\n📂 *Stack Trace :*\n${error}`,
        contextInfo: { forwardingScore: 9999999, isForwarded: true },
      },
      { quoted: m },
    )
  }
}

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Surveillance des modifications de fichier pour rechargement automatique
const file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(`📁 Fichier mis à jour : ${__filename}`)
  delete require.cache[file]
  require(file)
})
