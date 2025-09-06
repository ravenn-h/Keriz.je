// Plugin React - React to messages
module.exports = async (X, m) => {
    const command = m.command;
    const args = m.body.trim().split(/ +/).slice(1);
    const text = args.join(" ");

    if (command === 'react') {
        if (!text || !m.quoted) return m.reply('Example: react ❣️ (reply to a message)');
        
        try {
            await X.sendMessage(m.chat, {
                react: {
                    text: text,
                    key: m.quoted.key
                }
            });
        } catch (error) {
            console.error("React error:", error);
            m.reply("❌ Failed to react to message");
        }
    }
};

module.exports.command = ['react'];