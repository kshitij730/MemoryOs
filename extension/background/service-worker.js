// extension/background/service-worker.js
// Handles the "Save Page" context menu action

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'save-to-memoryos',
        title: 'Save to MemoryOS',
        contexts: ['page', 'link'],
    })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== 'save-to-memoryos') return

    const url = info.linkUrl || info.pageUrl || tab?.url
    const title = tab?.title || url

    const { memoryos_api_key: apiKey } = await chrome.storage.local.get(['memoryos_api_key'])
    if (!apiKey) {
        console.warn('MemoryOS: No API key configured')
        return
    }

    try {
        await fetch('http://localhost:8000/upload/url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ url, title, tags: ['extension'] }),
        })
    } catch (err) {
        console.error('MemoryOS: Failed to save page', err)
    }
})
