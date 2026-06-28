const dbBaseURL = "https://delta-spt-default-rtdb.firebaseio.com/scripts";
let isAdminActive = false;

document.addEventListener("DOMContentLoaded", fetchScripts);

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const btn = document.querySelector('.theme-toggle');
    if(document.body.classList.contains('light-mode')) {
        btn.innerText = "☀️";
    } else {
        btn.innerText = "🌙";
    }
}

function checkAdmin(val) {
    const adminPanel = document.getElementById("admin-panel");
    const trimmedVal = val.trim().toLowerCase();
    
    if(trimmedVal === "husseinwar") {  
        adminPanel.style.display = "block";
        isAdminActive = true;
        toggleAdminButtons("flex");
        
        document.querySelectorAll(".script-card").forEach(card => {
            card.style.display = "flex";
        });
        return; 
    } else if (val === "") {
        adminPanel.style.display = "none";
        isAdminActive = false;
        toggleAdminButtons("none");
    }

    const cards = document.querySelectorAll(".script-card");
    cards.forEach(card => {
        const title = card.getAttribute("data-name") || "";
        const desc = card.getAttribute("data-desc") || "";
        
        if (title.includes(trimmedVal) || desc.includes(trimmedVal)) {
            card.style.display = "flex"; 
        } else {
            card.style.display = "none"; 
        }
    });
}

function toggleAdminButtons(displayStyle) {
    document.querySelectorAll('.admin-controls').forEach(controls => {
        controls.style.display = displayStyle;
    });
}

function fetchScripts() {
    const container = document.getElementById("dynamic-scripts");
    if (!container) return;
    
    fetch(`${dbBaseURL}.json`)
    .then(response => response.json())
    .then(data => {
        container.innerHTML = "";
        if (!data) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">لا توجد سكربتات مضافة حالياً.</p>';
            return;
        }
        
        const scriptsArray = Object.keys(data).map(key => {
            return { id: key, ...data[key] };
        });

        // الترتيب الأبجدي من A إلى Z بشكل عصري ومنظم للمابات الإنجليزية
        scriptsArray.sort((a, b) => {
            const nameA = (a.name || "").trim().toLowerCase();
            const nameB = (b.name || "").trim().toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        });

        scriptsArray.forEach(item => {
            const card = document.createElement("div");
            card.className = "script-card";
            
            card.setAttribute("data-name", (item.name || "").toLowerCase());
            card.setAttribute("data-desc", (item.desc || "").toLowerCase());
            
            const btnDisplay = isAdminActive ? "flex" : "none";

            const safeCode = btoa(unescape(encodeURIComponent(item.code || "")));
            const safeName = encodeURIComponent(item.name || "");
            const safeDesc = encodeURIComponent(item.desc || "");

            card.innerHTML = `
                <div class="script-info">
                    <h3>${item.name || ""}</h3>
                    <p>${item.desc || ""}</p>
                </div>
                <div class="script-actions">
                    <div class="admin-controls" style="display: ${btnDisplay}; gap: 5px;">
                        <button class="btn-action edit-btn" onclick="prepareEdit('${item.id}', '${safeName}', '${safeDesc}', '${safeCode}')">📝</button>
                        <button class="btn-action delete-btn" onclick="deleteScript('${item.id}')">🗑️</button>
                    </div>
                    <button class="btn-action copy-btn" onclick="copyScript('${safeCode}')">📋 نسخ الكود</button>
                </div>
            `;
            container.appendChild(card);
        });
    })
    .catch(err => {
        container.innerHTML = '<p style="color: var(--accent-red); text-align: center; padding: 20px;">خطأ في جلب البيانات! تأكد من الإنترنت.</p>';
    });
}

function addScriptToServer() {
    const name = document.getElementById("script-name").value;
    const desc = document.getElementById("script-desc").value;
    const code = document.getElementById("script-code").value;
    const editKey = document.getElementById("edit-key").value;
    
    if(!name || !desc || !code) {
        alert("الرجاء ملء جميع الحقول أولاً!");
        return;
    }
    
    const scriptData = { name, desc, code };
    
    if(editKey) {
        fetch(`${dbBaseURL}/${editKey}.json`, {
            method: "PUT",
            body: JSON.stringify(scriptData)
        })
        .then(response => response.json())
        .then(() => {
            alert("تم التعديل بنجاح! ✏️");
            resetAdminPanel();
            fetchScripts();
        });
    } else {
        fetch(`${dbBaseURL}.json`, {
            method: "POST",
            body: JSON.stringify(scriptData)
        })
        .then(response => response.json())
        .then(() => {
            alert("تم النشر بنجاح! 🎉");
            resetAdminPanel();
            fetchScripts();
        });
    }
}

function prepareEdit(key, safeName, safeDesc, safeCode) {
    document.getElementById("panel-title").innerText = "🛠️ وضع التعديل الحالي";
    document.getElementById("panel-title").style.color = "var(--accent-yellow)";
    document.getElementById("edit-key").value = key;
    
    document.getElementById("script-name").value = decodeURIComponent(safeName);
    document.getElementById("script-desc").value = decodeURIComponent(safeDesc);
    document.getElementById("script-code").value = decodeURIComponent(escape(atob(safeCode)));
    
    document.getElementById("submit-btn").innerText = "حفظ التعديل الجديد 💾";
    document.getElementById("submit-btn").style.background = "var(--accent-yellow)";
    document.getElementById("submit-btn").style.color = "black";
    document.getElementById("cancel-edit-btn").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetAdminPanel() {
    document.getElementById("panel-title").innerText = "🛠️ لوحة تحكم المطور (إضافة سكربت جديد)";
    document.getElementById("panel-title").style.color = "var(--accent-green)";
    document.getElementById("edit-key").value = "";
    document.getElementById("script-name").value = "";
    document.getElementById("script-desc").value = "";
    document.getElementById("script-code").value = "";
    document.getElementById("submit-btn").innerText = "نشر السكربت لجميع المستخدمين 🚀";
    document.getElementById("submit-btn").style.background = "var(--accent-green)";
    document.getElementById("submit-btn").style.color = "white";
    document.getElementById("cancel-edit-btn").style.display = "none";
}

function deleteScript(key) {
    if(confirm("هل تريد حذف السكربت نهائياً؟")) {
        fetch(`${dbBaseURL}/${key}.json`, { method: "DELETE" })
        .then(() => { alert("تم الحذف! 🗑️"); fetchScripts(); });
    }
}

function copyScript(safeCode) {
    try {
        const originalCode = decodeURIComponent(escape(atob(safeCode)));
        navigator.clipboard.writeText(originalCode);
        
        let toast = document.getElementById('toast');
        if (toast) {
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 2500);
        }
    } catch(e) {
        alert("حدث خطأ أثناء نسخ الكود.");
    }
    window.open('https://www.effectivecpmnetwork.com/hgn359eg5u?key=64ed1654117b213984688e88e8596776', '_blank'); 
                            }
        
