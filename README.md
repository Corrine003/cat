# 猫格观测所

一个静态前端网站：输入授权码后，用户可以填写猫咪行为测试、上传猫咪照片，并生成六维猫格报告与观测卡。

## 本地预览

```bash
npm install
npm run dev
```

## Netlify 部署

1. 在 GitHub 创建一个私有仓库。
2. 把本项目推送到这个仓库。
3. 在 Netlify 选择 Add new site -> Import an existing project。
4. 连接 GitHub 并选择该仓库。
5. Netlify 会读取 `netlify.toml`，使用以下配置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 部署完成后，可以在 Netlify 的 Domain management 里绑定自己的域名。

## 授权码

当前授权码写在前端代码中，适合演示、内测和轻量发放。若要做付费授权、防转发或一次性授权码，需要增加后端校验。
