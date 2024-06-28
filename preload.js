const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    'electron',
    {
        performAction: (arg) => ipcRenderer.invoke('perform-action', arg),
        onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
        onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
        addNewEmail: (email) => ipcRenderer.send('add-new-email', email),
        addNewLesson: (lesson) => ipcRenderer.send('add-new-lesson', lesson),
        getEmails: () => ipcRenderer.invoke('get-emails'),
        getLessons: () => ipcRenderer.invoke('get-lessons'),
        addEmailLesson: (email, lesson) => ipcRenderer.send('add-email-lesson', email, lesson),
        getCategorizedEmails: () => ipcRenderer.invoke('get-categorized-emails')
    }
);
