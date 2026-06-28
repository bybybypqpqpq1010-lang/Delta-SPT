const home = document.getElementById("home");
const fav = document.getElementById("fav");
const toast = document.getElementById("toast");
const adLink = "https://www.effectivecpmnetwork.com/hgn359eg5u?key=64ed1654117b213984688e88e8596776";

let favorites = JSON.parse(localStorage.getItem("fav")) || [];

const data = [
    {name: "Infinite Yield", code: "loadstring(game:HttpGet('https://raw.githubusercontent.com/EdgeIY/infiniteyield/master/source'))()"},
    {name: "Blox Fruits Auto", code: "loadstring(game:HttpGet('https://raw.githubusercontent.com/acsu123/HohoV2/main/ScriptOnly'))()"},
    {name: "Pet Simulator 99", code: "loadstring(game:HttpGet('https://raw.githubusercontent.com/NukeVsCity/PS99/main/main.lua'))()"},
    {name: "Brookhaven GUI", code: "loadstring(game:HttpGet('https://raw.githubusercontent.com/dohnto/Brookhaven/main/script'))()"},
    {name: "MM2 Auto Farm", code: "loadstring(game:HttpGet('https://raw.githubusercontent.com/Boxpen/MM2/main/script'))()"},
    {name: "Blade Ball", code: "loadstring(game:HttpGet('https://raw.githubusercontent.com/1f0cky/BladeBall/main/Script'))()"}
];

function render(){
    home.innerHTML = `<button class="btn" style="background:#ffcc00; width:100%; margin-bottom:15px" onclick="window.open('${adLink}', '_blank')">اضغط لدعمنا (إعلان)</button>`;
    data.forEach((item,i)=>{
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<h3>${item.name}</h3>
            <button onclick="copyCode(${i})">📋 نسخ</button>
            <button onclick="addFav(${i})">⭐ مفضلة</button>`;
        home.appendChild(div);
    });
    renderFav();
}

function renderFav(){
    fav.innerHTML = "";
    favorites.forEach((item)=>{
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<h3>${item.name}</h3><button onclick="navigator.clipboard.writeText('${item.code}'); showToast('تم النسخ')">📋 نسخ</button>`;
        fav.appendChild(div);
    });
}

function copyCode(i){
    navigator.clipboard.writeText(data[i].code);
    showToast("تم النسخ! سيفتح الإعلان...");
    setTimeout(() => { window.open(adLink, '_blank'); }, 800);
}

function addFav(i){
    if(!favorites.find(f => f.name === data[i].name)) {
        favorites.push(data[i]);
        localStorage.setItem("fav", JSON.stringify(favorites));
        renderFav();
        showToast("تمت الإضافة للمفضلة");
    }
}

function showTab(tab){
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
}

function toggleTheme(){
    document.body.classList.toggle("light");
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light":"dark");
}

function showToast(msg){
    toast.innerText = msg; toast.style.display = "block";
    setTimeout(()=>toast.style.display="none", 1500);
}

if(localStorage.getItem("theme") === "light") document.body.classList.add("light");
render();
