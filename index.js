const express = require('express');
const cors = require('cors');
const app = express();

// 启用 CORS
app.use(cors());

// 记录请求
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Query:', req.query);
    next();
});

// 测试路由
app.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Server is working',
        timestamp: new Date().toISOString(),
        environment: {
            hasClientId: !!process.env.NOTION_CLIENT_ID,
            hasClientSecret: !!process.env.NOTION_CLIENT_SECRET,
            hasRedirectUri: !!process.env.NOTION_REDIRECT_URI,
            redirectUri: process.env.NOTION_REDIRECT_URI
        }
    });
});

// 回调路由
app.get('/callback', (req, res) => {
    const { code, error } = req.query;
    
    if (error) {
        console.error('Auth error:', error);
        return res.status(400).json({
            success: false,
            error: error
        });
    }

    if (!code) {
        return res.status(400).json({
            success: false,
            error: 'No authorization code provided'
        });
    }

    return res.json({
        success: true,
        message: 'Authorization code received',
        code: code
    });
});

// 首页
app.get('/', (req, res) => {
    res.send(`Notion OAuth Callback Server<br>Status: Active<br>Time: ${new Date().toISOString()}`);
});

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
    });
});

// 未找到路由
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        path: req.path
    });
});

// 如果不是在 Vercel 上运行，则启动本地服务器
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// 导出 app 实例
module.exports = app;
};
        NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID,
        NOTION_REDIRECT_URI: process.env.NOTION_REDIRECT_URI,
        // 不要输出 client secret
    });
    
    if (error) {
        console.error('Authorization error:', error);
        return res.send(`
            <html>
                <head>
                    <title>授权失败</title>
                    <style>
                        body { font-family: system-ui; padding: 2rem; text-align: center; }
                        .error { color: #f44336; }
                    </style>
                </head>
                <body>
                    <h2 class="error">授权失败</h2>
                    <p>${error}</p>
                </body>
            </html>
        `);
    }

    if (!code) {
        return res.send('Notion OAuth Callback Server');
    }

    try {
        // 获取访问令牌
        const clientId = process.env.NOTION_CLIENT_ID;
        const clientSecret = process.env.NOTION_CLIENT_SECRET;
        const redirectUri = process.env.NOTION_REDIRECT_URI;

        console.log('Exchanging code for token with:', {
            clientId,
            redirectUri,
            code
        });

        const response = await fetch('https://api.notion.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            })
        });

        const data = await response.json();
        console.log('Notion API response:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        // 发送成功页面
        res.send(`
            <html>
                <head>
                    <title>授权成功</title>
                    <style>
                        body { font-family: system-ui; padding: 2rem; text-align: center; }
                        .success { color: #4caf50; }
                    </style>
                </head>
                <body>
                    <h2 class="success">授权成功！</h2>
                    <p>你可以关闭此窗口了。</p>
                    <script>
                        // 发送消息给扩展
                        const extensionId = 'omaognibkmkakblaanoknnaphomcdikc';
                        chrome.runtime.sendMessage(extensionId, { 
                            type: 'NOTION_AUTH_SUCCESS',
                            data: ${JSON.stringify(data)}
                        }, response => {
                            if (response && response.success) {
                                window.close();
                            }
                        });
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.send(`
            <html>
                <head>
                    <title>授权失败</title>
                    <style>
                        body { font-family: system-ui; padding: 2rem; text-align: center; }
                        .error { color: #f44336; }
                    </style>
                </head>
                <body>
                    <h2 class="error">授权失败</h2>
                    <p>${error.message || '获取访问令牌失败'}</p>
                </body>
            </html>
        `);
    }
});
    const { code, error } = req.query;
    
    if (error) {
        return res.send(`
            <html>
                <head>
                    <title>授权失败</title>
                    <style>
                        body { font-family: system-ui; padding: 2rem; text-align: center; }
                        .error { color: #f44336; }
                    </style>
                </head>
                <body>
                    <h2 class="error">授权失败</h2>
                    <p>${error}</p>
                </body>
            </html>
        `);
    }

    if (!code) {
        return res.send(`
            <html>
                <head>
                    <title>授权失败</title>
                    <style>
                        body { font-family: system-ui; padding: 2rem; text-align: center; }
                        .error { color: #f44336; }
                    </style>
                </head>
                <body>
                    <h2 class="error">授权失败</h2>
                    <p>未收到授权码</p>
                </body>
            </html>
        `);
    }

    try {
        // 获取访问令牌
        const clientId = process.env.NOTION_CLIENT_ID;
        const clientSecret = process.env.NOTION_CLIENT_SECRET;
        const redirectUri = process.env.NOTION_REDIRECT_URI;

        console.log('Exchanging code for token with:', {
            clientId,
            redirectUri,
            code
        });

        const response = await fetch('https://api.notion.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            })
        });

        const data = await response.json();
        console.log('Notion API response:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        // 发送成功页面
        res.send(`
            <html>
                <head>
                    <title>授权成功</title>
                    <style>
                        body { font-family: system-ui; padding: 2rem; text-align: center; }
                        .success { color: #4caf50; }
                    </style>
                </head>
                <body>
                    <h2 class="success">授权成功！</h2>
                    <p>你可以关闭此窗口了。</p>
                    <script>
                        // 发送消息给扩展
                        const extensionId = 'omaognibkmkakblaanoknnaphomcdikc';
                        chrome.runtime.sendMessage(extensionId, { 
                            type: 'NOTION_AUTH_SUCCESS',
                            data: ${JSON.stringify(data)}
                        }, response => {
                            if (response && response.success) {
                                window.close();
                            }
                        });
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.send(`
            <html>
                <head>
                    <title>授权失败</title>
                    <style>
                        body { font-family: system-ui; padding: 2rem; text-align: center; }
                        .error { color: #f44336; }
                    </style>
                </head>
                <body>
                    <h2 class="error">授权失败</h2>
                    <p>${error.message || '获取访问令牌失败'}</p>
                </body>
            </html>
        `);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

