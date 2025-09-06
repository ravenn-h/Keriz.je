// Plugin Vars - Environment variables management
const fs = require('fs');

const getVars = () => {
    try {
        return JSON.parse(fs.readFileSync('./librairy/database/vars.json', 'utf8'));
    } catch {
        return {};
    }
};

const saveVars = (vars) => {
    fs.writeFileSync('./librairy/database/vars.json', JSON.stringify(vars, null, 2));
};

const setVar = (key, value) => {
    const vars = getVars();
    vars[key] = value;
    saveVars(vars);
};

const delVar = (key) => {
    const vars = getVars();
    delete vars[key];
    saveVars(vars);
};

module.exports = async (X, m) => {
    const command = m.command;
    const args = m.body.trim().split(/ +/).slice(1);
    const text = args.join(" ");
    const isOwner = global.owner.includes(m.sender.split('@')[0]);

    if (!isOwner) return m.reply("❌ This command is only for the owner");

    switch(command) {
        case 'getvar':
            if (!text) return m.reply("Usage: .getvar VARIABLE_NAME");
            
            const vars = getVars();
            const varName = text.toUpperCase();
            
            if (vars[varName]) {
                m.reply(`${varName} = ${vars[varName]}`);
            } else {
                m.reply(`❌ Variable ${varName} not found`);
            }
            break;

        case 'delvar':
            if (!text) return m.reply("Usage: .delvar VARIABLE_NAME");
            
            const allVars = getVars();
            const delVarName = text.toUpperCase();
            
            if (!allVars[delVarName]) {
                return m.reply(`❌ Variable ${delVarName} not found`);
            }
            
            delVar(delVarName);
            m.reply(`✅ Variable ${delVarName} deleted`);
            break;

        case 'setvar':
            const [key, ...values] = text.split('=');
            if (!key || values.length === 0) {
                return m.reply("Usage: .setvar KEY=VALUE");
            }
            
            const value = values.join('=').trim();
            const keyName = key.trim().toUpperCase();
            
            setVar(keyName, value);
            m.reply(`✅ Variable ${keyName} set to: ${value}`);
            break;

        case 'allvar':
            const allVariables = getVars();
            const sortedVars = Object.keys(allVariables).sort();
            
            if (sortedVars.length === 0) {
                return m.reply("❌ No variables found");
            }
            
            const varList = sortedVars
                .map(key => `${key} = ${allVariables[key]}`)
                .join('\n\n');
            
            m.reply(`📋 **All Variables:**\n\n${varList}`);
            break;
    }
};

module.exports.command = ['getvar', 'delvar', 'setvar', 'allvar'];