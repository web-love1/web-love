const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const nblocean = require('noblox.js');
const axios = require('axios');
const express = require('express');

// --- 1. ระบบ WEB SERVER (กันหลับ) ---
const app = express();
app.get('/', (req, res) => res.send('บอทกำลังทำงานอยู่!'));
app.listen(8080, () => console.log('Web Server พร้อมใช้งานบน Port 8080'));

// --- 2. การตั้งค่าพื้นฐาน ---
const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbze9DXvJfv4r1cuwkqOzKgOf1cSmf2QPfsIcOm-Fd6rQ33g3_Ml3lNt1m38imSv0sYXWw/exec"; // *** เปลี่ยนเป็น URL ของคุณ ***
const BASE_ROLE_ID = "1428804583471448264";
const GROUP_ID_MAIN = 35650805; // ไอดีกลุ่มหลัก

// รายการกลุ่มพันธมิตรและไอดีโรล (32 กลุ่ม)
const allianceGroups = [
    { gid: 36092768, rid: "1428804759732883586" }, { gid: 36092799, rid: "1428804629201686700" },
    { gid: 36092348, rid: "1428804623749353603" }, { gid: 36092314, rid: "1428804618657333440" },
    { gid: 36092780, rid: "1428804829664383006" }, { gid: 35912825, rid: "1428804714488922163" },
    { gid: 36079757, rid: "1428804608565973223" }, { gid: 36079801, rid: "1428804644183871588" },
    { gid: 36042771, rid: "1428804634155417712" }, { gid: 35850671, rid: "1428804797884141568" },
    { gid: 35887361, rid: "1428804854964424745" }, { gid: 35858440, rid: "1428804699544485958" },
    { gid: 35853818, rid: "1428804844822466762" }, { gid: 35850934, rid: "1428804613175377981" },
    { gid: 35850786, rid: "1428804684537266276" }, { gid: 35850680, rid: "1428804834739621979" },
    { gid: 35850651, rid: "1428804744758956174" }, { gid: 35850689, rid: "1428804774769332236" },
    { gid: 35850660, rid: "1428804739784773834" }, { gid: 35850694, rid: "1428804694637150208" },
    { gid: 35840551, rid: "1428804839772520448" }, { gid: 35834110, rid: "1428804689465446500" },
    { gid: 35830419, rid: "1428804588450091163" }, { gid: 35783970, rid: "1428804669634908240" },
    { gid: 35783904, rid: "1428804859972419825" }, { gid: 35783711, rid: "1428804639179931700" },
    { gid: 35674578, rid: "1428804724550926577" }, { gid: 35459450, rid: "1428804769895415958" },
    { gid: 35459351, rid: "1428804780511465593" }, { gid: 35687746, rid: "1428804598642249748" },
    { gid: 35734424, rid: "1428804679596511262" }, { gid: 35459390, rid: "1428804849851437068" }
];

// รายการยศกลุ่มหลัก
const rankSettings = {
    "[ His Majesty The King | พระมหากษัตริย์ ]": { prefix: "HMK", roles: ["1428805010107535441", "1428804967409389568"] },
    "[ Her Majesty Queen | พระบรมราชินี ]": { prefix: "HMQ", roles: ["1428805005015646209", "1428804967409389568"] },
    "[ Crown Prince | สมเด็จพระบรมโอรสาธิราช ]": { prefix: "CP", roles: ["1428804972543479930", "1428804967409389568"] },
    "[ His Royal Highness | เจ้าฟ้า ]": { prefix: "HRH", roles: ["1428804967409389568"] },
    "[ Her Highness Princess | พระองค์เจ้า ]": { prefix: "HHP", roles: ["1428804967409389568"] },
    "[ Mom Rajawong | หม่อมราชวงศ์ ]": { prefix: "MR", roles: ["1428804967409389568"] },
    "[ Privy Councilor | องคมนตรี ]": { prefix: "PC", roles: ["1446785241032294532"] },
    "[ Prime Minister | นายกรัฐมนตรี ]": { prefix: "PM", roles: ["1428804999428702328", "1428804994005733307"] },
    "[ Deputy Prime Minister | รองนายกรัฐมนตรี ]": { prefix: "DPM", roles: ["1430924216940630149", "1428804994005733407"] },
    "[ Minister of Defence | รัฐมนตรีว่าการกระทรวงกลาโหม ]": { prefix: "IM, OF-9, GEN", roles: ["1428804994005733407"] },
    "[ Field Marshal | จอมพล ]": { prefix: "OF-10, FIM", roles: ["1428804982609805443"] },
    "[ Chief of the Defence Forces | ผู้บัญชาการทหารสูงสุด ]": { prefix: "OF-10, FIM, CDF", roles: ["1451104596574605322", "1428805045817839777", "1428804988343156777"] },
    "[ Deputy Chief of Defence Force | รองผู้บัญชาการทหารสูงสุด ]": { prefix: "OF-10, FIM, DCDF", roles: ["1428805045817839777", "1428804988343156777"] },
    "[ Commander in Chief | ผู้บัญชาการทหารบก ]": { prefix: "OF-10, FIM, CIC", roles: ["1428804977534570718", "1428805045817839777"] },
    "[ Deputy Commander in Chief | รองผู้บัญชาการทหารบก ]": { prefix: "OF-10, FIM, DCIC", roles: ["1428804977534570718", "1428805045817839777"] },
    "[ Army | เหล่าทัพ ]": { prefix: "OF-9, GEN, ACIC", roles: ["1428804977534570718", "1428805045817839777"] },
    "[ Chief of staff | เสนาธิการทหารบก ]": { prefix: "OF-9, GEN, COS", roles: ["1428804977534570718", "1428805045817839777"] },
    "[ OF-9] General | พลเอก": { prefix: "OF-9, GEN", roles: ["1428804962363772928"] },
    "[ OF-8] Lieutenant General | พลโท": { prefix: "OF-8, LTGEN", roles: ["1428804962363772928"] },
    "[ OF-7] Major General | พลตรี": { prefix: "OF-7, MAJGEN", roles: ["1428804962363772928"] },
    "[ OF-5] Colonel | พันเอก": { prefix: "OF-5, COL", roles: ["1428804952335057107"] },
    "[ OF-4] Lieutenant Colonei | พันโท": { prefix: "OF-4, LTC", roles: ["1428804952335057107"] },
    "[ OF-3] Major | พันตรี": { prefix: "OF-3, MAJ", roles: ["1428804952335057107"] },
    "[ OF-2] Captain | ร้อยเอก": { prefix: "OF-2, CAPT", roles: ["1428804947365073129"] },
    "[ OF-1B] 1st Lieutenant | ร้อยโท": { prefix: "OF-1b, 1LT", roles: ["1428804947365073129"] },
    "[ OF-1A] 2nd Lieutenant | ร้อยตรี": { prefix: "OF-1a, 2LT", roles: ["1428804947365073129"] },
    "[OF-(D)] Army Cadet Officers | นักเรียนนายร้อย": { prefix: "OF-D, ACO", roles: ["1428804947365073129"] },
    "[ OR-8] Sergeant Major | จ่าสิบเอก": { prefix: "OR-8, SM1", roles: ["1428804942298222607"] },
    "[ OR-7] Sergeant Major 2nd | จ่าสิบโท": { prefix: "OR-7, SM2", roles: ["1428804942298222607"] },
    "[ OR-6] Sergeant Major 3rd | จ่าสิบตรี": { prefix: "OR-6, SM3", roles: ["1428804942298222607"] },
    "[ OR-5] Sergeant | สิบเอก": { prefix: "OR-5, SGT", roles: ["1428804942298222607"] },
    "[ OR-4] Corporal | สิบโท": { prefix: "OR-4, SGT", roles: ["1428804942298222607"] },
    "[ OR-3] Lance Corporal | สิบตรี": { prefix: "OR-3, CPL", roles: ["1428804942298222607"] },
    "[OR-D] NCO Student | นักเรียนนายสิบทหารบก": { prefix: "OR-2, PFC", roles: ["1428804942298222607"] },
    "[OR-1] Private | พลทหาร": { prefix: "OR-1, PVT", roles: ["1428804936799490189"] }
};

// --- 3. การเริ่มต้นบอท ---
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.once('ready', () => { console.log(`✅ บอทระบบยืนยันตัวตนพร้อมทำงาน: ${client.user.tag}`); });

// คำสั่งตั้งค่าปุ่มยืนยันตัวตน
client.on('messageCreate', async (message) => {
    if (message.content === '!setup' && message.member.permissions.has('Administrator')) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ ระบบยืนยันตัวตนสมาชิก')
            .setDescription('1. เข้าแมพเพื่อรับรหัสผ่าน\n2. นำรหัสมากรอกในปุ่มด้านล่างนี้')
            .setColor('#2b2d31');
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('v_start').setLabel('เริ่มยืนยันตัวตน').setStyle(ButtonStyle.Success));
        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// จัดการ Interaction
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'v_start') {
        const modal = new ModalBuilder().setCustomId('v_modal').setTitle('กรอกรหัสยืนยันตัวตน');
        const nameInput = new TextInputBuilder().setCustomId('r_name').setLabel("ชื่อ Roblox").setStyle(TextInputStyle.Short).setRequired(true);
        const codeInput = new TextInputBuilder().setCustomId('v_code').setLabel("รหัส 6 หลัก").setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(codeInput));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'v_modal') {
        await interaction.deferReply({ ephemeral: true });
        const rName = interaction.fields.getTextInputValue('r_name');
        const vCode = interaction.fields.getTextInputValue('v_code');

        try {
            const res = await axios.get(`${GOOGLE_URL}?username=${rName}`);
            if (res.data !== "Not Found" && vCode.trim() === res.data.toString()) {
                const userId = await nblocean.getIdFromUsername(rName);
                
                // เช็คยศกลุ่มหลัก
                const rankName = await nblocean.getRankNameInGroup(GROUP_ID_MAIN, userId);
                const setting = rankSettings[rankName];

                // ให้ Base Role
                await interaction.member.roles.add(BASE_ROLE_ID).catch(() => null);

                // ให้ Role ตามยศกลุ่มหลัก
                if (setting && setting.roles) {
                    for (const roleId of setting.roles) { 
                        await interaction.member.roles.add(roleId).catch(() => null); 
                    }
                }

                // *** ตรวจสอบกลุ่มพันธมิตรทั้ง 32 กลุ่ม ***
                for (const group of allianceGroups) {
                    const rank = await nblocean.getRankInGroup(group.gid, userId);
                    if (rank > 0) {
                        await interaction.member.roles.add(group.rid).catch(() => null);
                    }
                }

                // เปลี่ยนชื่อเล่น
                const prefix = setting ? setting.prefix : "";
                const finalNick = prefix ? `${prefix} | ${rName}` : rName;
                await interaction.member.setNickname(finalNick.substring(0, 32)).catch(() => null);

                await interaction.editReply({ content: `✅ ยืนยันสำเร็จ! ยศของคุณคือ: **${rankName}**` });
            } else {
                await interaction.editReply({ content: `❌ รหัสไม่ถูกต้องสำหรับชื่อ ${rName}` });
            }
        } catch (e) { 
            console.error(e);
            await interaction.editReply({ content: "❌ เกิดข้อผิดพลาดในการตรวจสอบฐานข้อมูล" }); 
        }
    }
});

// ใช้ Token จาก Environment Variable ใน Render
client.login(process.env.TOKEN);
