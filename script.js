// الرابط الأساسي لقاعدة بيانات الفايربيس الخاصة بك
const dbBaseURL = "https://delta-spt-default-rtdb.firebaseio.com/scripts";

// متغير لمعرفة هل وضع المشرف نشط أم لا
let isAdminActive = false;

// تشغيل جلب السكربتات فور فتح التطبيق
document.addEventListener("DOMContentLoaded", fetchScripts);

function toggleTheme() { document.body.classList.toggle('light-mode'); }

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

// دالة تفحص كلمة السر husseinwar لتشغيل لوحة الإشراف + نظام البحث عن السكربتات
function checkAdmin(val) {
    const adminPanel = document.getElementById("admin-panel");
    
    // 1. فحص كلمة السر المخفية
    if(val === "husseinwar") {  
        adminPanel.style.display = "block";
        isAdminActive = true;
        toggleAdminButtons("flex");
        return; // الخروج لكي لا يتم تصفية السكربتات باسم الباسورد
    } else if (val === "") {
        adminPanel.style.display = "none";
        isAdminActive = false;
        toggleAdminButtons("none");
    }

    // 2. كود البحث التلقائي عن المابات للمستخدمين
    const filter = val.toLowerCase();
    const cards = document.querySelectorAll(".script-card");

    cards.forEach(card => {
        const title = card.querySelector(".script-info h3").innerText.toLowerCase();
        const desc = card.querySelector(".script-info p").innerText.toLowerCase();
        
        if (title.includes(filter) || desc.includes(filter)) {
            card.style.display = "flex"; // إظهار السكربت المتطابق
        } else {
            card.style.display = "none"; // إخفاء السكربت غير المتطابق
        }
    });
}

function toggleAdminButtons(displayStyle) {
    document.querySelectorAll('.admin-controls').forEach(controls => {
        controls.style.display = displayStyle;
    });
}

// دالة لجلب السكربتات من الفايربيس وعرضها للمستخدمين
function fetchScripts() {
    const container = document.getElementById("dynamic-scripts");
    
    fetch(`${dbBaseURL}.json`)
    .then(response => response.json())
    .then(data => {
        container.innerHTML = "";
        if (!data) {
            container.innerHTML = '<p style="color: #888; text-align: center;">لا توجد سكربتات مضافة حالياً. اكتب كلمة السر في البحث لتظهر لك لوحة التحكم وتضيف أول سكربت!</p>';
            return;
        }
        
        Object.keys(data).forEach(key => {
            const item = data[key];
            const card = document.createElement("div");
            card.className = "script-card";
            
            const btnDisplay = isAdminActive ? "flex" : "none";

            // تحويل الكود إلى صيغة قاعدة 64 (Base64) الآمنة تماماً لمنع مشاكل الرموز وعلامات الاقتباس نهائياً عند النسخ والتعديل
            const safeCode = btoa(unescape(encodeURIComponent(item.code)));
            const safeName = encodeURIComponent(item.name);
            const safeDesc = encodeURIComponent(item.desc);

            card.innerHTML = `
                <div class="script-info">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                </div>
                <div style="display: flex; align-items: center;">
                    <div class="admin-controls" style="display: ${btnDisplay};">
                        <button class="edit-btn" onclick="prepareEdit('${key}', '${safeName}', '${safeDesc}', '${safeCode}')">تعديل 📝</button>
                        <button class="delete-btn" onclick="deleteScript('${key}')">حذف 🗑️</button>
                    </div>
                    <button class="copy-btn" onclick="copyScript('${safeCode}')">نسخ 📋</button>
                </div>
            `;
            container.appendChild(card);
        });
    })
    .catch(err => {
        container.innerHTML = '<p style="color: #ff4d4d; text-align: center;">خطأ في الاتصال بالسيرفر! تأكد من اتصالك بالإنترنت.</p>';
    });
}

// دالة إرسال سكربت جديد أو حفظ التعديل الحالي في الفايربيس
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
            alert("تم تحديث وتعديل السكربت بنجاح! ✏️");
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
            alert("تم نشر السكربت بنجاح لجميع المستخدمين! 🎉");
            resetAdminPanel();
            fetchScripts();
        });
    }
}

// دالة لتجهيز البيانات عند التعديل وفك تشفير الـ Base64
function prepareEdit(key, safeName, safeDesc, safeCode) {
    document.getElementById("panel-title").innerText = "🛠️ لوحة تحكم المطور (تعديل السكربت الحالي)";
    document.getElementById("panel-title").style.color = "#ffc107";
    document.getElementById("edit-key").value = key;
    
    document.getElementById("script-name").value = decodeURIComponent(safeName);
    document.getElementById("script-desc").value = decodeURIComponent(safeDesc);
    
    // فك التشفير الآمن للكود البرمجي
    document.getElementById("script-code").value = decodeURIComponent(escape(atob(safeCode)));
    
    document.getElementById("submit-btn").innerText = "حفظ التعديلات الجديدة 💾";
    document.getElementById("submit-btn").style.background = "#ffc107";
    document.getElementById("submit-btn").style.color = "black";
    document.getElementById("cancel-edit-btn").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetAdminPanel() {
    document.getElementById("panel-title").innerText = "🛠️ لوحة تحكم المطور (إضافة سكربت جديد)";
    document.getElementById("panel-title").style.color = "#28a745";
    document.getElementById("edit-key").value = "";
    document.getElementById("script-name").value = "";
    document.getElementById("script-desc").value = "";
    document.getElementById("script-code").value = "";
    document.getElementById("submit-btn").innerText = "نشر السكربت لجميع المستخدمين 🚀";
    document.getElementById("submit-btn").style.background = "#28a745";
    document.getElementById("submit-btn").style.color = "white";
    document.getElementById("cancel-edit-btn").style.display = "none";
}

function deleteScript(key) {
    if(confirm("هل أنت متأكد تماماً من حذف هذا السكربت نهائياً من السيرفر؟")) {
        fetch(`${dbBaseURL}/${key}.json`, {
            method: "DELETE"
        })
        .then(() => {
            alert("تم حذف السكربت بنجاح! 🗑️");
            fetchScripts();
        });
    }
}

// دالة النسخ الفوري الإعلانية الآمنة تماماً وفك تشفير الكود قبل النسخ لحمايته
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
        alert("حدث خطأ أثناء نسخ هذا السكربت، يرجى إعادة إضافته.");
    }

    window.open('https://www.effectivecpmnetwork.com/hgn359eg5u?key=64ed1654117b213984688e88e8596776', '_blank'); 
}
