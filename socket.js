

//━━━━━━━━━━━━━━━━━━━━━━━━//
// Modules nécessaires pour le fonctionnement du bot
require("./setting") // Charge les paramètres de configuration globaux
const {
  downloadContentFromMessage,
  proto,
  generateWAMessage,
  getContentType,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  GroupSettingChange,
  jidDecode,
  WAGroupMetadata,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateMessageID,
  jidNormalizedUser,
  generateForwardMessageContent,
  WAGroupInviteMessageGroupMetadata,
  GroupMetadata,
  Headers,
  delay,
  WA_DEFAULT_EPHEMERAL,
  WADefault,
  getAggregateVotesInPollMessage,
  generateWAMessageContent,
  areJidsSameUser,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeWaconnet,
  makeInMemoryStore,
  MediaType,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  initInMemoryKeyStore,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WAMediaUpload,
  mentionedJid,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  DisconnectReason,
  WAconnet,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  templateMessage,
  InteractiveMessage,
  Header,
} = require("@whiskeysockets/baileys") // Bibliothèque principale WhatsApp

// Modules système et utilitaires
const os = require("os") // Module système d'exploitation pour informations serveur
const fs = require("fs") // Module système de fichiers pour lecture/écriture
const fg = require("api-dylux") // API dylux pour téléchargements médias
const fetch = require("node-fetch") // Module pour les requêtes HTTP
const util = require("util") // Utilitaires Node.js pour formatage
const axios = require("axios") // Client HTTP pour requêtes API avancées
const { exec, execSync } = require("child_process") // Exécution de commandes système
const chalk = require("chalk") // Coloration du texte dans la console
const nou = require("node-os-utils") // Utilitaires système pour monitoring
const moment = require("moment-timezone") // Gestion des dates et fuseaux horaires
const path = require("path") // Gestion des chemins de fichiers
const didyoumean = require("didyoumean") // Suggestions de commandes similaires
const similarity = require("similarity") // Calcul de similarité entre chaînes
const speed = require("performance-now") // Mesure de performance et vitesse
const { Sticker } = require("wa-sticker-formatter") // Création de stickers WhatsApp
const { igdl } = require("btch-downloader") // Téléchargeur Instagram
const yts = require("yt-search") // Recherche YouTube
const ddownr = require("ddownr") // Téléchargeur universel
const cheerio = require("cheerio") // Parser HTML pour scraping
const crypto = require("crypto") // Fonctions de cryptographie
const jimp = require("jimp") // Manipulation d'images
const webp = require("node-webpmux") // Manipulation des fichiers WebP

// Modules de scraping personnalisés
const jktNews = require("./library/scrape/jktNews") // Nouvelles JKT48
const otakuDesu = require("./library/scrape/otakudesu") // Anime OtakuDesu
const Kusonime = require("./library/scrape/kusonime") // Anime Kusonime
const { quote } = require("./library/scrape/quote.js") // Citations stylisées
const { fdown } = require("./library/scrape/facebook.js") // Téléchargeur Facebook
const { gempa } = require("./library/scrape/bmkg.js") // Informations séismes BMKG

const {
  komiku, // Scraper de manga Komiku
  detail, // Détails de manga
} = require("./library/scrape/komiku")

const {
  wikimedia, // Scraper Wikimedia pour images
} = require("./library/scrape/wikimedia")

const {
  CatBox, // Service d'upload CatBox
  fileIO, // Service d'upload FileIO
  pomfCDN, // Service d'upload PomfCDN
  uploadFile, // Fonction générique d'upload
} = require("./library/scrape/uploader")

// Fonction principale du bot - Point d'entrée pour tous les messages
module.exports = async (X, m) => {
  try {
    // Extraction de l'identifiant du chat (privé ou groupe)
    const from = m.key.remoteJid

    // Extraction du contenu du message selon son type
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
    const groupMetadata = m.isGroup ? await X.groupMetadata(from).catch((e) => {}) : "" // Métadonnées du groupe
    const groupName = m.isGroup ? groupMetadata.subject : "" // Nom du groupe
    const participants = m.isGroup ? await groupMetadata.participants : "" // Participants du groupe
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : "" // Administrateurs du groupe
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false // Bot est admin
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false // Utilisateur est admin

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
    const fakethmb = await reSize(ppuser, 300, 300) // Miniature factice

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
        const data = fs.readFileSync("./client.js", "utf8")
        const casePattern = /case\s+'([^']+)'/g
        const matches = data.match(casePattern)

        if (matches) {
          return matches.map((match) => match.replace(/case\s+'([^']+)'/, "$1"))
        } else {
          return []
        }
      } catch (error) {
        console.error("Une erreur est survenue :", error)
        throw error
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
      var mytext = fs.readFileSync("./client.js").toString()
      var numUpper = (mytext.match(/case '/g) || []).length
      return numUpper
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
Je suis MERILDA qui peut t'aider à rechercher, jouer ou télécharger. Je peux aussi être un compagnon de chat, un confident.

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

          if (subcmd === "ai") menu = aiMenu
          else if (subcmd === "tools") menu = toolsMenu
          else if (subcmd === "group") menu = groupMenu
          else if (subcmd === "owner") menu = ownerMenu
          else if (subcmd === "search") menu = searchMenu
          else if (subcmd === "sticker") menu = stickerMenu
          else if (subcmd === "other") menu = otherMenu
          else if (subcmd === "downloader") menu = downloaderMenu
          else if (subcmd === "all") {
            menu = [otherMenu, downloaderMenu, stickerMenu, ownerMenu, groupMenu, toolsMenu, searchMenu, aiMenu].join(
              "\n",
            )
          } else {
            menu = `

📂 *Liste des Menus*
⤷ .menu ai
⤷ .menu all
⤷ .menu other
⤷ .menu tools
⤷ .menu group
⤷ .menu owner
⤷ .menu search
⤷ .menu sticker
⤷ .menu downloader

Tape : *.menu [catégorie]*
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
                  title: "MERILDA",
                  body: "Hisoka",
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
                    body: `MERILDA`,
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
                    body: `MERILDA`,
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
                      body: `MERILDA`,
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
                      body: `MERILDA`,
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
            (_) => "https://files.catbox.moe/nwvkbt.png",
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
            `🔗 *Lien du Groupe :* ${groupMetadata.subject}\n\nhttps://chat.whatsapp.com/${response}\n\nLe lien du groupe a été envoyé en privé`,
            m,
            { detectLink: true },
          )
          X.sendText(
            m.sender,
            `🔗 *Lien du Groupe :* ${groupMetadata.subject}\n\nhttps://chat.whatsapp.com/${response}`,
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
            `Tu veux le script d'MERILDA ? \nInfo mise à jour script : +22501676111\nContact développeur : https://t.me/his_oka_07`,
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
