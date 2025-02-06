const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());

// 处理 Notion 的授权回调
app.get('/', async (req, res) => {
    const { code, error, state } = req.query;

    if (error) {
        return res.send(`
            <html>
                <body>
                    <script>
                        window.opener.postMessage({ error: "${error}" }, "*");
                        window.close();
                    </script>
                </body>
            </html>
        `);
    }

    if (!code) {
        return res.status(400).send('Missing code parameter');
    }

    try {
        // 获取访问令牌
        const clientId = process.env.NOTION_CLIENT_ID;
        const clientSecret = process.env.NOTION_CLIENT_SECRET;
        const redirectUri = process.env.NOTION_REDIRECT_URI;

        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await fetch('https://api.notion.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            })
        });

        const data = await response.json();

        // 将令牌发送回扩展
        res.send(`
            <html>
                <body>
                    <script>
                        window.opener.postMessage(${JSON.stringify(data)}, "*");
                        window.close();
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).send(`
            <html>
                <body>
                    <script>
                        window.opener.postMessage({ error: "Failed to exchange code for token" }, "*");
                        window.close();
                    </script>
                </body>
            </html>
        `);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
