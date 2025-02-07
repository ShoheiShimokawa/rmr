const clientId = "754065057535-s105f0ntpquil7nt7c5hj058u7r89c88.apps.googleusercontent.com"; // GCPで発行されたクライアントID
const redirectUri = "http://localhost:3000/book"; // リダイレクトURI
// const scope = "https://www.googleapis.com/auth/userinfo.profile"; // 使用するスコープ

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;


<a href={authUrl}>Googleでログイン</a>

// アクセストークンの取得
const token = new URLSearchParams(window.location.hash).get("access_token");

// トークンを利用してGoogleユーザー情報を取得
fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
    headers: {
        Authorization: `Bearer ${token}`,
    },
})
    .then(response => response.json())
    .then(data => console.log(data)); // ユーザー情報の表示
<a href={authUrl}>Googleでログイン</a>