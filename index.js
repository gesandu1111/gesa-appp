const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const express = require("express");
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

async function startAPI() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "silent" })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log("QR Code එක Scan කරන්න:");
            // මෙතනදී QR එක Terminal එකේ පෙනෙයි
        }
        if (connection === 'open') console.log("WhatsApp සම්බන්ධ වුණා! ✅");
    });

    // 🎯 DP එක ගන්න API Endpoint එක
    app.get("/get-dp", async (req, res) => {
        const number = req.query.number;
        if (!number) return res.status(400).json({ error: "අංකය ඇතුළත් කරන්න" });

        try {
            const jid = `${number}@s.whatsapp.net`;
            const ppUrl = await sock.profilePictureUrl(jid, 'image');
            res.json({ status: "success", url: ppUrl });
        } catch (e) {
            res.status(500).json({ status: "error", message: "DP එක හොයාගත නොහැක" });
        }
    });

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startAPI();
