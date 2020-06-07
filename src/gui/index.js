import { timeAgo } from "./lib/timeago";

const getUrl = window.location;
const baseUrl = getUrl .protocol + "//" + getUrl.hostname + ':3001'

async function poll() {
    const info = await (await fetch(baseUrl + '/archive/info')).json();

    renderLogs(info);
    renderStatus(info);
    renderArchiveLists(info)

    if (info.compression.status === 'inactive') {
        document.querySelector('#backup-btn').removeAttribute('disabled');
    }

    document.getElementById('state').innerHTML = JSON.stringify(info, null, 4);
}

function renderLogs(info) {
    const logs = info.compression.logs.map(i => 
        `<div class="log log-${i.type}">${i.msg} <span class="time"> - ${timeAgo(i.time * 1000)}</div>`
    ).join('');

    document.querySelector('.logs').innerHTML = logs;
}

function renderArchiveLists(info) {
    const localArchives = info.local.archives.map(i => {

        return `<div class="log log-backup">
                    <span class="name">${i}</span>
                    - <span class="waiting">Tranfer queued</span> <span class="time">
                    - 5 minutes ago
                    <span class="delete">Delete</span>
                </div>`;
    }).join('');

    document.getElementById('local-backups').innerHTML = localArchives;

    const remoteArchives = info.remote.archives.map(i => {

        return `<div class="log log-backup">
                    <span class="name">${i.name}</span>
                    - ${timeAgo(new Date(i.changed))}
                    <span class="delete">Delete</span>
                </div>`;
    }).join('');

    document.getElementById('remote-backups').innerHTML = remoteArchives;
}

function renderStatus(info) {
    const map = {
        inactive: 'Inactive',
        archiving: 'Running archiver...',
        transfering: 'Transfering files to samba share...'
    }

    document.querySelector('.status').innerHTML = `
        <div>Status: <b>${map[info.compression.status]}</b></span></div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    poll();

    document.querySelector('#backup-btn').addEventListener('click', async () => {
        document.querySelector('#backup-btn').setAttribute('disabled', 'true');
        await fetch(baseUrl + '/archive/run');
        poll();
    });

    document.querySelector('#reset-btn').addEventListener('click', async () => {
        await fetch(baseUrl + '/config/reset');
        poll();
    });

    setInterval(() => {
        poll();
    }, 2500)
});