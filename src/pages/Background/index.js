const LOAD_ITEM_URL = 'https://portal.masterisehomes.com/admin/vinhomemanagement/loadItemCode';

function handleGetCookies() {
    console.debug("Trigger handleGetCookies");
    const promises = [];

    return new Promise((resolve, reject) => {
        chrome.tabs.query({}, (tabs) => {
            for (const tab of tabs) {
                if (!tab.url.includes("portal.masterisehomes.com/")) {
                    continue;
                }

                promises.push(new Promise((resolveTab, rejectTab) => {
                    chrome.tabs.sendMessage(tab.id, { command: 'get-cookies' }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error sending message to content script:', chrome.runtime.lastError);
                            rejectTab(new Error('Error getting cookies'));
                        } else {
                            console.debug('Response from content script:', response);
                            resolveTab(response);
                        }
                    });
                }));
            }

            Promise.all(promises).then((results) => {
                resolve(results);
            }).catch((error) => {
                reject(error);
            });
        });
    });
}

async function handleGetHiddenFund(data) {
    console.log('Trigger handleGetHiddenFund');
    // Retrieve PHPSESSID cookie from local storage
    const storedData = await new Promise((resolve, reject) => {
        chrome.storage.local.get('PHPSESSID', (data) => {
            resolve(data);
        });
    });

    const cookieValue = storedData?.PHPSESSID; // Check if cookie exists
    const myHeaders = new Headers();
    myHeaders.append("Cookie", cookieValue);

    const formdata = new FormData();
    formdata.append("project_id", data.project_id);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow"
    };

    try {
        const response = await fetch("https://portal.masterisehomes.com/admin/vinhomemanagement/loadItemCode", requestOptions);
        const data = await response.text();
        processHiddenData(data);
    } catch (error) {
        let text = `Lấy quỹ ẩn bị lỗi:\n${error}}`;
        chrome.storage.local.set({ ['latestLog']: text });
    }
}

function processHiddenData(response) {
    const data = JSON.parse(response).data;
    let text = "";
    for (const row of data) {
        let appartmentCode = row.item_name;
        let price = String(row.price).replace(/ VND/g, "");
        text += `${appartmentCode}${String.fromCharCode(9)}${price}\n`;
    }
    chrome.storage.local.set({ ['latestLog']: text });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.command === 'get-cookies') {
        try {
            handleGetCookies();
            sendResponse(true);
        } catch (error) {
            console.error('Error getting cookies:', error);
            sendResponse({ error: 'An error occurred' });
        }
    } else if (request.command === 'get-hidden-fund') {
        try {
            handleGetHiddenFund(request.data);
            sendResponse(true);
        } catch (error) {
            console.error('Error getting cookies:', error);
            sendResponse({ error: 'An error occurred' });
        }
    }
});