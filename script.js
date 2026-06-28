// رابط قاعدة بيانات الفايربيس الخاصة بك
const dbURL = "https://delta-spt-default-rtdb.firebaseio.com/scripts.json";

// تشغيل جلب السكربتات فور فتح التطبيق
document.addEventListener("DOMContentLoaded", fetchScripts);

function toggleTheme() { document.body.classList.toggle('light-mode'); }

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

// دالة تفحص كلمة السر المخفية لفتح لوحة التحكم الخاصة بك فقط
function checkAdmin(val) {
    const adminPanel = document.getElementById("admin-panel");
    // كلمة السر أصبحت husseinwar وهي مخفية برمجياً هنا ولن تظهر في واجهة التطبيق
    if(val === "husseinwar") {  
        adminPanel.style.display = "block";
    } else if (val === "") {
        adminPanel.style.display = "none";
    }
}

// دالة لجلب السكربتات من الفايربيس وعرضها للمستخدمين تلقائياً
function fetchScripts() {
    const container = document.getElementById("dynamic-scripts");
    
    fetch(dbURL)
    .then(response => response.json())
    .then(data => {
        container.innerHTML = "";
        if (!data) {
            container.innerHTML = '<p style="color: #888; text-align: center;">لا توجد سكربتات مضافة حالياً. اكتب كلمة السر في البحث لتظهر لك لوحة التحكم وتضيف أول سكربت!</p>';
            return;
        }
        
        // ترتيب وعرض السكربتات المضافة من السيرفر
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
        container.innerHTML = '<p style="color: #ff4d4d; text-align: center;">خطأ في الاتصال بالسيرفر! تأكد من إعدادات قاعدة البيانات.</p>';
    });
}

// دالة إرسال ونشر سكربت جديد إلى الفايربيس من داخل التطبيق لكي يصل للجميع فوراً
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
        fetchScripts(); // إعادة تحديث القائمة فوراً لتظهر السكربتات الجديدة
    });
}

// دالة النسخ الفوري وفتح رابط الإعلانات المباشر لزيادة أرباحك غصب عن المتصفح وبدون حظر
function copyScript(text) {
    // 1. نسخ كود السكربت فوراً إلى حافظة جهاز المستخدم
    navigator.clipboard.writeText(text);
    
    // 2. إظهار رسالة التنبيه الخضراء أسفل الشاشة
    let toast = document.getElementById('toast');
    if (toast) {
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }

    // 3. فتح الرابط الإعلاني الخاص بك مباشرة مع الضغطة لتجنب حظر النوافذ المنبثقة وتحقيق الأرباح
    window.open('https://www.effectivecpmnetwork.com/hgn359eg5u?key=64ed1654117b213984688e88e8596776', '_blank'); 
}
