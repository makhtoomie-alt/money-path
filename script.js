let goals = [];

// بارگذاری داده‌ها هنگام باز شدن صفحه
window.onload = function() {
  loadData();
  renderGoals();
};

// افزودن هدف جدید با محدودیت نسخه رایگان
function addGoal() {
  let freeLimit = 2;
  let isPaidUser = localStorage.getItem("isPaid") === "true";

  if(!isPaidUser && goals.length >= freeLimit){
    alert("نسخه رایگان فقط ۲ هدف را اجازه می‌دهد. برای اهداف بیشتر نسخه پولی را فعال کنید.");
    return;
  }

  goals.push({name:"", amount:0});
  renderGoals();
}

// نمایش اهداف در صفحه
function renderGoals() {
  const container = document.getElementById("goals-container");
  container.innerHTML = "";
  goals.forEach((goal, index) => {
    container.innerHTML += `
      <div class="goal">
        <input class="goal-name" placeholder="نام هدف" value="${goal.name}" onchange="updateGoalName(${index}, this.value)">
        <input class="goal-amount" type="number" placeholder="مبلغ هدف" value="${goal.amount}" onchange="updateGoalAmount(${index}, this.value)">
      </div>
    `;
  });
}

// بروزرسانی نام و مبلغ هدف
function updateGoalName(index, value) {
  goals[index].name = value;
  saveGoals();
}
function updateGoalAmount(index, value) {
  goals[index].amount = Number(value);
  saveGoals();
}

// ذخیره اهداف در مرورگر
function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

// بارگذاری اهداف از مرورگر
function loadData() {
  if(localStorage.getItem("goals")){
    goals = JSON.parse(localStorage.getItem("goals"));
  }
  renderGoals();
}

// فعال‌سازی نسخه پولی
function activatePaid() {
  localStorage.setItem("isPaid","true");
  alert("نسخه پولی فعال شد! حالا می‌توانید اهداف نامحدود اضافه کنید و نمودار پیشرفته ببینید.");
}

// شبیه‌سازی پرداخت آنلاین
function pay() {
  // در نسخه واقعی می‌توان API زرین‌پال یا پی‌پال را استفاده کرد
  activatePaid();
  alert("پرداخت موفق! نسخه پولی فعال شد.");
}

// محاسبه پس‌انداز و زمان رسیدن به اهداف
function calc() {
  let income = Number(document.getElementById("income").value);
  let cost   = Number(document.getElementById("cost").value);
  let result = document.getElementById("result");

  if (income <= 0) { 
    result.innerText = "لطفاً درآمد معتبر وارد کنید"; 
    return; 
  }

  let save = income - cost;
  if (save <= 0) { 
    result.innerText = "هزینه‌ها بیشتر یا مساوی درآمد است!"; 
    return; 
  }

  let output = "";
  goals.forEach(goal => {
    if(goal.amount > 0){
      let months = Math.ceil(goal.amount / save);
      output += `${goal.name || "بدون نام"}: مدت زمان رسیدن = ${months} ماه | پس‌انداز ماهانه = ${save}\n`;
    }
  });

  // پیام انگیزشی
  let messages = [
    "ادامه بده، هر ماه یک قدم به هدفت نزدیک‌تر می‌شوی!",
    "عالیه! تلاش تو نتیجه می‌دهد.",
    "هر پس‌انداز کوچک، آینده بزرگ می‌سازد."
  ];
  let msg = messages[Math.floor(Math.random() * messages.length)];

  result.innerText = output + "\n\n" + msg;

  // ذخیره درآمد و هزینه
  localStorage.setItem("income", income);
  localStorage.setItem("cost", cost);
  saveGoals();

  // رسم نمودار
  drawChart(save);
}

// رسم نمودار پیشرفت
function drawChart(save) {
  let canvas = document.getElementById("chart");
  if(!canvas){
    document.getElementById("result").innerHTML += `<canvas id="chart" width="350" height="150"></canvas>`;
    canvas = document.getElementById("chart");
  }
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,350,150);

  let isPaidUser = localStorage.getItem("isPaid") === "true";

  goals.forEach((goal,index)=>{
    if(goal.amount>0){
      let months = Math.ceil(goal.amount / save);
      let height = Math.min((goal.amount / 1000) * 10, 150);
      ctx.fillStyle = isPaidUser ? `hsl(${index*60 % 360},70%,50%)` : "#27ae60";
      ctx.fillRect(50*index, 150-height, 40, height);

      if(isPaidUser){
        ctx.fillStyle = "#000";
        ctx.fillText(goal.name || "بدون نام", 50*index, 145-height);
        ctx.fillText(Math.min((save*months)/goal.amount*100,100).toFixed(0) + "%", 50*index, 135-height);
      }
    }
  });
}