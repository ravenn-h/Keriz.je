//━━━━━━━━━━━━━━━━━━━━━━━━//
// Plugin Auto Read & Broadcast
// Lecture automatique et diffusion de messages
//━━━━━━━━━━━━━━━━━━━━━━━━//

const fs = require("fs")
const path = require("path")

module.exports = {
  command: ["autoread", "autoreadbc", "broadcast"],
  operate: async (context) => {
    const { X, m, reply, args, text, XyrooRynzz, command } = context

    // Vérification propriétaire pour certaines commandes
    if ((command === "autoreadbc" || command === "broadcast") && !XyrooRynzz) {
      return reply("❌ Seul le propriétaire peut utiliser cette commande")
    }

    try {
      switch (command) {
        case "autoread":
          if (args[0] === "on" || args[0] === "activer") {
            global.autoRead = true
            reply("✅ Auto Read activé\nTous les messages seront automatiquement lus")
          } else if (args[0] === "off" || args[0] === "désactiver") {
            global.autoRead = false
            reply("❌ Auto Read désactivé")
          } else {
            const status = global.autoRead ? "Activé ✅" : "Désactivé ❌"
            reply(
              `📖 *Status Auto Read*\n\n📊 État actuel : ${status}\n\n*Utilisation :*\n• ${context.prefix}autoread on - Activer\n• ${context.prefix}autoread off - Désactiver`,
            )
          }
          break

        case "autoreadbc":
          if (args[0] === "on" || args[0] === "activer") {
            global.autoReadBroadcast = true
            reply("✅ Auto Read Broadcast activé\nLes messages de diffusion seront automatiquement lus")
          } else if (args[0] === "off" || args[0] === "désactiver") {
            global.autoReadBroadcast = false
            reply("❌ Auto Read Broadcast désactivé")
          } else {
            const status = global.autoReadBroadcast ? "Activé ✅" : "Désactivé ❌"
            reply(
              `📢 *Status Auto Read Broadcast*\n\n📊 État actuel : ${status}\n\n*Utilisation :*\n• ${context.prefix}autoreadbc on - Activer\n• ${context.prefix}autoreadbc off - Désactiver`,
            )
          }
          break

        case "broadcast":
          if (!text) return reply(`*Exemple :*\n\n${context.prefix}broadcast Bonjour à tous !`)

          reply("📢 Diffusion en cours...")

          // Récupérer tous les chats
          const chats = Object.keys(X.chats).filter((jid) => jid.endsWith("@s.whatsapp.net") || jid.endsWith("@g.us"))

          let successCount = 0
          let failCount = 0

          for (const chatId of chats) {
            try {
              await X.sendMessage(chatId, {
                text: `📢 *Message de Diffusion*\n\n${text}\n\n_Envoyé par ${X.user.name}_`,
              })
              successCount++
              await new Promise((resolve) => setTimeout(resolve, 1000)) // Délai pour éviter le spam
            } catch (error) {
              failCount++
              console.error(`Erreur envoi broadcast à ${chatId}:`, error)
            }
          }

          reply(
            `✅ *Diffusion Terminée*\n\n📊 *Statistiques :*\n• Succès : ${successCount}\n• Échecs : ${failCount}\n• Total : ${chats.length}`,
          )
          break
      }
    } catch (error) {
      console.error("Erreur Auto Read:", error)
      reply("❌ Une erreur s'est produite")
    }
  },
}

// Fonction pour gérer la lecture automatique
const handleAutoRead = async (X, m) => {
  try {
    // Auto read normal
    if (global.autoRead) {
      await X.readMessages([m.key])
    }

    // Auto read broadcast
    if (global.autoReadBroadcast && m.key.remoteJid === "status@broadcast") {
      await X.readMessages([m.key])
    }
  } catch (error) {
    console.error("Erreur Auto Read:", error)
  }
}

// Export de la fonction d'auto read
module.exports.handleAutoRead = handleAutoRead
