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

// دالة تفحص كلمة السر المخفية husseinwar لفتح لوحة التحكم وأزرار الحذف والتعديل
function checkAdmin(val) {
    const adminPanel = document.getElementById("admin-panel");
    if(val === "husseinwar") {  
        adminPanel.style.display = "block";
        isAdminActive = true;
        toggleAdminButtons("flex"); // إظهار أزرار التعديل والحذف بجانب السكربتات
    } else if (val === "") {
        adminPanel.style.display = "none";
        isAdminActive = false;
        toggleAdminButtons("none"); // إخفاء أزرار الإشراف
    }
}

// دالة لإظهار أو إخفاء أزرار الحذف والتعديل برمجياً
function toggleAdminButtons(displayStyle) {
    document.querySelectorAll('.admin-controls').forEach(controls => {
        controls.style.display = displayStyle;
    });
}

// دالة لجلب السكربتات من الفايربيس وعرضها للمسخدمين
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
            
            // تحديد حالة ظهور أزرار الإشراف حسب حالة الباسورد الحالية
            const btnDisplay = isAdminActive ? "flex" : "none";

            card.innerHTML = `
                <div class="script-info">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                </div>
                <div style="display: flex; align-items: center;">
                    <!-- أزرار الإشراف الخاصة بك يا حسين -->
                    <div class="admin-controls" style="display: ${btnDisplay};">
                        <button class="edit-btn" onclick="prepareEdit('${key}', \`${item.name}\`, \`${item.desc}\`, \`${item.code}\`)">تعديل 📝</button>
                        <button class="delete-btn" onclick="deleteScript('${key}')">حذف 🗑️</button>
                    </div>
                    <button class="copy-btn" onclick="copyScript(\`${item.code}\`)">نسخ 📋</button>
                </div>
            `;
            container.appendChild(card);
        });
    })
    .catch(err => {
        container.innerHTML = '<p style="color: #ff4d4d; text-align: center;">خطأ في الاتصال بالسيرفر! تأكد من إعدادات قاعدة البيانات.</p>';
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
        // إذا كان هناك معرف (Key) فهذا يعني أننا نقوم بعملية "تعديل" سكربت موجود مسبقاً
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
        // إذا لم يكن هناك معرف، نقوم بنشر وإضافة سكربت جديد تماماً
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

// دالة لتجهيز البيانات داخل لوحة التحكم عندما تضغط على زر "تعديل"
function prepareEdit(key, name, desc, code) {
    document.getElementById("panel-title").innerText = "🛠️ لوحة تحكم المطور (تعديل السكربت الحالي)";
    document.getElementById("panel-title").style.color = "#ffc107";
    document.getElementById("edit-key").value = key;
    document.getElementById("script-name").value = name;
    document.getElementById("script-desc").value = desc;
    document.getElementById("script-code").value = code;
    document.getElementById("submit-btn").innerText = "حفظ التعديلات الجديدة 💾";
    document.getElementById("submit-btn").style.background = "#ffc107";
    document.getElementById("submit-btn").style.color = "black";
    document.getElementById("cancel-edit-btn").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' }); // الصعود لأعلى لرؤية اللوحة
}

// دالة لتصفير وتنظيف لوحة التحكم وإعادتها لحالة الإضافة العادية
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

// دالة لحذف السكربت نهائياً من سيرفر الفايربيس
function deleteScript(key) {
    if(confirm("هل أنت متأكد تماماً من حذف هذا السكربت نهائياً من السيرفر؟")) {
        fetch(`${dbBaseURL}/${key}.json`, {
            method: "DELETE"
        })
        .then(() => {
            alert("تم حذف السكربت بنجاح! 🗑️");
            fetchScripts(); // إعادة التحديث
        });
    }
}

// دالة النسخ الفوري وفتح رابط الإعلانات المباشر لزيادة أرباحك
function copyScript(text) {
    navigator.clipboard.writeText(text);
    
    let toast = document.getElementById('toast');
    if (toast) {
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }

    window.open('https://www.effectivecpmnetwork.com/hgn359eg5u?key=64ed1654117b213984688e88e8596776', '_blank'); 
}
