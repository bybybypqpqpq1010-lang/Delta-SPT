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

// دالة تفحص كلمة السر husseinwar لتشغيل لوحة الإشراف ونظام البحث دون تداخل
function checkAdmin(val) {
    const adminPanel = document.getElementById("admin-panel");
    const trimmedVal = val.trim().toLowerCase();
    
    // 1. فحص كلمة السر المخصصة لفتح اللوحة
    if(trimmedVal === "husseinwar") {  
        adminPanel.style.display = "block";
        isAdminActive = true;
        toggleAdminButtons("flex");
        
        // إظهار كل السكربتات عند كتابة الباسورد لكي لا تختفي القائمة بالأسفل
        document.querySelectorAll(".script-card").forEach(card => {
            card.style.display = "flex";
        });
        return; 
    } else if (val === "") {
        adminPanel.style.display = "none";
        isAdminActive = false;
        toggleAdminButtons("none");
    }

    // 2. كود البحث التلقائي الفوري المستقر عن المابات للمستخدمين
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

// دالة لجلب السكربتات مرتبة أبجدياً بالإنجليزية (من A إلى Z) وعرضها للمستخدمين
function fetchScripts() {
    const container = document.getElementById("dynamic-scripts");
    if (!container) return;
    
    fetch(`${dbBaseURL}.json`)
    .then(response => response.json())
    .then(data => {
        container.innerHTML = "";
        if (!data) {
            container.innerHTML = '<p style="color: #888; text-align: center;">لا توجد سكربتات مضافة حالياً. اكتب كلمة السر في البحث لتظهر لك لوحة التحكم وتضيف أول سكربت!</p>';
            return;
        }
        
        // تحويل الكائن إلى مصفوفة لترتيبها
        const scriptsArray = Object.keys(data).map(key => {
            return { id: key, ...data[key] };
        });

        // الترتيب الأبجدي الإنجليزي المضمون من A إلى Z
        scriptsArray.sort((a, b) => {
            const nameA = (a.name || "").trim().toLowerCase();
            const nameB = (b.name || "").trim().toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        });

        // عرض السكربتات بعد الترتيب الأبجدي الإنجليزي
        scriptsArray.forEach(item => {
            const card = document.createElement("div");
            card.className = "script-card";
            
            // تخزين الأسماء بصيغة نصية للبحث الآمن
            card.setAttribute("data-name", (item.name || "").toLowerCase());
            card.setAttribute("data-desc", (item.desc || "").toLowerCase());
            
            const btnDisplay = isAdminActive ? "flex" : "none";

            // تشفير الكود برمجياً بـ Base64 لمنع مشاكل الرموز وعلامات الاقتباس
            const safeCode = btoa(unescape(encodeURIComponent(item.code || "")));
            const safeName = encodeURIComponent(item.name || "");
            const safeDesc = encodeURIComponent(item.desc || "");

            card.innerHTML = `
                <div class="script-info">
                    <h3>${item.name || ""}</h3>
                    <p>${item.desc || ""}</p>
                </div>
                <div style="display: flex; align-items: center;">
                    <div class="admin-controls" style="display: ${btnDisplay};">
                        <button class="edit-btn" onclick="prepareEdit('${item.id}', '${safeName}', '${safeDesc}', '${safeCode}')">تعديل 📝</button>
                        <button class="delete-btn" onclick="deleteScript('${item.id}')">حذف 🗑️</button>
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
