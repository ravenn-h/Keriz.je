//━━━━━━━━━━━━━━━━━━━━━━━━//
// Plugin Anti View Once
// Permet de voir les messages à vue unique
//━━━━━━━━━━━━━━━━━━━━━━━━//

module.exports = {
  command: ["antiviewonce", "antivu", "viewonce"],
  operate: async (context) => {
    const { X, m, reply, isAdmins, XyrooRynzz } = context

    // Vérification des permissions
    if (!m.isGroup) return reply("Cette fonctionnalité est uniquement disponible dans les groupes")
    if (!isAdmins && !XyrooRynzz) return reply("Seuls les administrateurs peuvent utiliser cette commande")

    try {
      // Gestion de l'activation/désactivation
      if (!global.antiViewOnce) global.antiViewOnce = {}

      const args = context.args
      if (args[0] === "on" || args[0] === "activer") {
        global.antiViewOnce[m.chat] = true
        reply("✅ Anti View Once activé pour ce groupe\nLes messages à vue unique seront automatiquement sauvegardés")
      } else if (args[0] === "off" || args[0] === "désactiver") {
        global.antiViewOnce[m.chat] = false
        reply("❌ Anti View Once désactivé pour ce groupe")
      } else {
        const status = global.antiViewOnce[m.chat] ? "Activé ✅" : "Désactivé ❌"
        reply(
          `🔍 *Status Anti View Once*\n\n📊 État actuel : ${status}\n\n*Utilisation :*\n• ${context.prefix}antiviewonce on - Activer\n• ${context.prefix}antiviewonce off - Désactiver`,
        )
      }
    } catch (error) {
      console.error("Erreur Anti View Once:", error)
      reply("❌ Une erreur s'est produite")
    }
  },
}

// Fonction pour intercepter les messages view once
const handleViewOnceMessage = async (X, m) => {
  try {
    if (!global.antiViewOnce || !global.antiViewOnce[m.chat]) return

    // Vérifier si c'est un message view once
    if (m.message?.viewOnceMessage || m.message?.viewOnceMessageV2) {
      const viewOnceMsg = m.message.viewOnceMessage || m.message.viewOnceMessageV2
      const mediaType = Object.keys(viewOnceMsg.message)[0]
      const mediaMessage = viewOnceMsg.message[mediaType]

      let caption = `🔍 *Message View Once Intercepté*\n\n`
      caption += `👤 *De :* @${m.sender.split("@")[0]}\n`
      caption += `⏰ *Heure :* ${new Date().toLocaleString("fr-FR")}\n`
      caption += `📝 *Caption :* ${mediaMessage.caption || "Aucune"}\n\n`
      caption += `_Message sauvegardé par Anti View Once_`

      if (mediaType === "imageMessage") {
        await X.sendMessage(m.chat, {
          image: await X.downloadMediaMessage(m),
          caption: caption,
          mentions: [m.sender],
        })
      } else if (mediaType === "videoMessage") {
        await X.sendMessage(m.chat, {
          video: await X.downloadMediaMessage(m),
          caption: caption,
          mentions: [m.sender],
        })
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'interception View Once:", error)
  }
}

// Export de la fonction d'interception
module.exports.handleViewOnceMessage = handleViewOnceMessage
