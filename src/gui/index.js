import { timeAgo } from "./lib/timeago";

const getUrl = window.location;
const baseUrl = ""; //getUrl .protocol + "//" + getUrl.hostname + ':3001'

async function poll() {
  const info = await (await fetch(baseUrl + "/archive/info")).json();

  renderLogs(info);
  renderStatus(info);
  renderArchiveLists(info);
  renderProgress(info);
  renderConnectionStatus(info);

  document.querySelector("#backup-btn").removeAttribute("disabled");
  document.querySelector("#archive-btn").removeAttribute("disabled");

  if (info.compression.status !== "inactive") {
    document.querySelector("#backup-btn").setAttribute("disabled", "true");

    if (info.compression.status === 'archiving') {
      document.querySelector("#archive-btn").setAttribute("disabled", "true");
    }
  }

  document.getElementById("state").innerHTML = JSON.stringify(info, null, 4);

  return info;
}

function renderConnectionStatus(info) {
  document.querySelector(".config small").classList.remove("error");
  document.querySelector(".config small").classList.remove("success");

  if (info.remote.error) {
    document.querySelector(".config small").innerHTML = "Connection error!";
    document.querySelector(".config small").classList.add("error");
    return;
  }

  document.querySelector(".config small").innerHTML = "Connection established";
  document.querySelector(".config small").classList.add("success");
}

function renderProgress(info) {
  if (!info.compression.last) {
    document.querySelector(".progress-meta").style.display = "none";
    document.querySelector(".progress-bar").style.display = "none";
    document.querySelector(".progress-pct").style.display = "none";
    return;
  }

  document.querySelector(".progress-meta").style.display = "";
  document.querySelector(".progress-bar").style.display = "";
  document.querySelector(".progress-pct").style.display = "";

  const p = info.compression.last;
  document.querySelector(
    ".progress-meta"
  ).innerHTML = `${p.processed} / ${p.total} files and ${p.processedBytes} / ${p.totalBytes} bytes compressed`;

  const pct = `${Math.round((p.processed / p.total) * 100)}%`;
  document.querySelector(".progress-bar").style.width = pct;
  document.querySelector(".progress-pct").innerHTML = pct;
}

function deleteArchive(fileName) {
  if (!confirm("Are you sure?")) return;

  fetch(baseUrl + "/archive/remove", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName,
    }),
  });
}

function transferArchive(fileName) {
  if (!confirm("Are you sure?")) return;

  fetch(baseUrl + "/archive/transfer", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName,
    }),
  });
}

function getTransferPct(info, i) {
  const local = info.local.archives.find((l) => l.name === i);
  const remote = info.remote.archives.find((r) => r.name === i);

  if (local && remote) {
    return local.size / remote.size;
  }

  return 0;
}

function renderLogs(info) {
  const logs = info.compression.logs
    .map(
      (i) =>
        `<div class="log log-${i.type}">${
          i.msg
        } <span class="time"> - ${timeAgo(i.time * 1000)}</div>`
    )
    .join("");

  document.querySelector(".logs").innerHTML = logs;
}

function renderArchiveLists(info) {
  const localArchives = info.local.archives
    .map((i) => {
      const transferPct = getTransferPct(info, i);

      return `<div class="log log-backup">
                    <span class="name">${i.name} <div class="transfered-pct" style="width: ${transferPct}%"></div></span>
                    <!--
                    - <span class="waiting">Tranfer queued</span> <span class="time">
                    - X minutes ago
                    -->
                    <div class="log-actions">
                        <span class="delete" data-archive="${i.name}">Delete</span>
                        <span class="transfer" data-archive="${i.name}">Transfer</span>
                    </div>
                </div>`;
    })
    .join("");

  document.getElementById("local-backups").innerHTML = localArchives;
  document.querySelectorAll("#local-backups .log-actions").forEach((e) => {
    e.querySelector(".delete").addEventListener("click", (evt) => {
      deleteArchive(evt.target.getAttribute("data-archive"));
    });

    e.querySelector(".transfer").addEventListener("click", (evt) => {
      transferArchive(evt.target.getAttribute("data-archive"));
    });
  });

  const remoteArchives = info.remote.archives
    .map((i) => {
      return `<div class="log log-backup">
                    <span class="name">${i.name}</span>
                    - ${timeAgo(new Date(i.changed))}
                    <span class="delete">Delete</span>
                </div>`;
    })
    .join("");

  document.getElementById("remote-backups").innerHTML = remoteArchives;
}

function renderStatus(info) {
  const map = {
    inactive: "Inactive",
    archiving: "Running archiver...",
    transfering: "Transfering files to samba share...",
  };

  document.querySelector(".status").innerHTML = `
        <div>Status: <b>${map[info.compression.status]}</b></span></div>
    `;
}

async function saveConfig() {
  if (!confirm("Are you sure?")) return;

  const form = {};
  document.querySelectorAll(".config-field input").forEach((e) => {
    form[e.getAttribute("name")] = e.value;
  });

  fetch(baseUrl + "/config/samba", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });
}

document.addEventListener("DOMContentLoaded", () => {
  poll();

  document.querySelector("#backup-btn").addEventListener("click", async () => {
    if (!confirm("Are you sure?")) return;
    document.querySelector("#backup-btn").setAttribute("disabled", "true");
    await fetch(baseUrl + "/backup/now");
    poll();
  });

  document.querySelector("#archive-btn").addEventListener("click", async () => {
    if (!confirm("Are you sure?")) return;
    document.querySelector("#archive-btn").setAttribute("disabled", "true");
    await fetch(baseUrl + "/archive/now");
    poll();
  });

  document.querySelector("#reset-btn").addEventListener("click", async () => {
    await fetch(baseUrl + "/config/reset");
    document.location.reload();
  });

  document.querySelector("#update-btn").addEventListener("click", saveConfig);

  setInterval(() => {
    poll().then((i) => renderForm(i));
  }, 1000);
});

function renderForm(info) {
  document.querySelectorAll(".config-field input").forEach((e) => {
    if (e.value === "") {
      e.value = info.samba[e.getAttribute("name")];
    }
  });
}
