// extension/popup/popup.js — Extension popup logic
// Saves the current tab URL to MemoryOS via the backend API.

const BACKEND_URL = 'http://localhost:8000'

async function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['memoryos_api_key'], (result) => {
            resolve(result.memoryos_api_key || '')
        })
    })
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlEl = document.getElementById('current-url')
    const titleInput = document.getElementById('title-input')
    const tagsInput = document.getElementById('tags-input')
    const saveBtn = document.getElementById('save-btn')
    const statusEl = document.getElementById('status')

    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const currentUrl = tab.url || ''
    const currentTitle = tab.title || currentUrl

    urlEl.textContent = currentUrl
    titleInput.value = currentTitle

    function showStatus(message, type) {
        statusEl.style.display = 'block'
        statusEl.textContent = message
        statusEl.className = `status ${type}`
    }

    saveBtn.addEventListener('click', async () => {
        const apiKey = await getApiKey()
        if (!apiKey) {
            showStatus('Set your API key in MemoryOS settings first', 'error')
            return
        }

        saveBtn.disabled = true
        saveBtn.textContent = 'Saving...'

        const tags = tagsInput.value.split(',').map((t) => t.trim()).filter(Boolean)

        try {
            const res = await fetch(`${BACKEND_URL}/upload/url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    url: currentUrl,
                    title: titleInput.value || currentTitle,
                    tags,
                }),
            })

            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            await res.json()
            showStatus('✓ Saved to your brain!', 'success')
            saveBtn.textContent = 'Saved ✓'
        } catch (err) {
            showStatus('Failed to save. Check your connection.', 'error')
            saveBtn.disabled = false
            saveBtn.textContent = 'Save to Brain'
        }
    })
})
