import { getPageCookies } from "./modules/getCookies";

console.log('Content script works!');
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === 'get-cookies') {
        const cookies = getPageCookies();
        sendResponse(cookies);
    }
});
