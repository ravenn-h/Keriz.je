// Plugin Misc - Status, Call, Read, Online settings
module.exports = async (X, m) => {
    const command = m.command;
    const args = m.body.trim().split(/ +/).slice(1);
    const text = args.join(" ");

    const handleSetting = async (setting, match) => {
        // Simple setting handler - you can extend this
        global[setting] = match === 'on' ? true : match === 'off' ? false : match;
        return "✅ Réglage mis à jour";
    };

    switch(command) {
        case 'status':
            if (!text) return m.reply("Usage: .status on/off");
            await handleSetting('AUTO_STATUS_VIEW', text);
            m.reply("📊 Status view setting updated");
            break;

        case 'call':
            if (!text) return m.reply("Usage: .call on/off");
            await handleSetting('REJECT_CALL', text);
            m.reply("📞 Call reject setting updated");
            break;

        case 'read':
            if (!text) return m.reply("Usage: .read on/off");
            await handleSetting('SEND_READ', text);
            m.reply("📖 Auto read setting updated");
            break;

        case 'online':
            if (!text) return m.reply("Usage: .online on/off");
            await handleSetting('ALWAYS_ONLINE', text);
            m.reply("🟢 Online presence setting updated");
            break;
    }
};

module.exports.command = ['status', 'call', 'read', 'online'];