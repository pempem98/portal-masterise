export const getPageCookies = () => {
    let cookies = document.cookie;
    cookies.split(';').forEach(cookie => {
        let textLog = cookie.split('=');
        let key = textLog[0];
        let value = textLog[1];
        chrome.storage.local.set({
            [key]: value
        }).then(() => {
            chrome.storage.local.set({ ['latestLog']: cookie });
        });
    })
    return cookies;
};
