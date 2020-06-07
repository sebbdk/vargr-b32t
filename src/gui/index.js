import { timeAgo } from "./lib/timeago";

const getUrl = window.location;
const baseUrl = getUrl .protocol + "//" + getUrl.hostname + ':3001'

async function poll() {
    const info = await (await fetch(baseUrl + '/archive/info')).json();

    renderLogs(info);
    renderStatus(info);

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
function renderStatus(info) {
    document.querySelector('.status').innerHTML = `
        <div>Status: <b>${info.compression.status}</b></span></div>
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