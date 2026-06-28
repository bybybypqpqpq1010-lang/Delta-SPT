// رابط قاعدة بيانات الفايربيس الخاصة بك
const dbURL = "https://delta-spt-default-rtdb.firebaseio.com/scripts.json";

// تشغيل جلب السكربتات فور فتح التطبيق
document.addEventListener("DOMContentLoaded", fetchScripts);

function toggleTheme() { document.body.classList.toggle('light-mode'); }

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

// دالة تفحص إذا كتب حسين كلمة السر تفتح له اللوحة
function checkAdmin(val) {
    const adminPanel = document.getElementById("admin-panel");
    if(val === "admin123") {  // يمكنك تغيير كلمة السر admin123 لأي شيء تريده
        adminPanel.style.display = "block";
    } else if (val === "") {
        adminPanel.style.display = "none";
    }
}

// دالة لجلب السكربتات من الفايربيس وعرضها للمستخدمين
function fetchScripts() {
    const container = document.getElementById("dynamic-scripts");
    
    fetch(dbURL)
    .then(response => response.json())
    .then(data => {
        container.innerHTML = "";
        if (!data) {
            container.innerHTML = '<p style="color: #888; text-align: center;">لا توجد سكربتات مضافة حالياً. اكتب admin123 في البحث لتضيف أول سكربت!</p>';
            return;
        }
        
        // ترتيب وعرض السكربتات
        Object.keys(data).forEach(key => {
            const item = data[key];
            const card = document.createElement("div");
            card.className = "script-card";
            card.innerHTML = `
                <div class="script-info">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                </div>
                <button class="copy-btn" onclick="copyScript(\`${item.code}\`)">نسخ 📋</button>
            `;
            container.appendChild(card);
        });
    })
    .catch(err => {
        container.innerHTML = '<p style="color: #ff4d4d; text-align: center;">خطأ في الاتصال بالسيرفر!</p>';
    });
}

// دالة إرسال سكربت جديد إلى الفايربيس لكي يصل للجميع
function addScriptToServer() {
    const name = document.getElementById("script-name").value;
    const desc = document.getElementById("script-desc").value;
    const code = document.getElementById("script-code").value;
    
    if(!name || !desc || !code) {
        alert("الرجاء ملء جميع الحقول أولاً!");
        return;
    }
    
    const newScript = { name, desc, code };
    
    fetch(dbURL, {
        method: "POST",
        body: JSON.stringify(newScript)
    })
    .then(response => response.json())
    .then(() => {
        alert("تم نشر السكربت بنجاح لجميع المستخدمين! 🎉");
        document.getElementById("script-name").value = "";
        document.getElementById("script-desc").value = "";
        document.getElementById("script-code").value = "";
        fetchScripts(); // إعادة تحديث القائمة
    });
}

// دالة النسخ الفوري وفتح الإعلان بعد نصف ثانية
function copyScript(text) {
    navigator.clipboard.writeText(text);
    
    let toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);

    setTimeout(() => {
        window.open('https://t.me/DeltaSPT', '_blank'); 
    }, 500);
}
