document.addEventListener("DOMContentLoaded", async function(){
  const API_BASE=(window.__APP_CONFIG__&&window.__APP_CONFIG__.API_BASE)||"https://ca-swe-wts-backend.happymeadow-a2b0a3fc.swedencentral.azurecontainerapps.io";
  function currentMachineName(){
    const p=window.location.pathname;
    const m={"machine1.html":"Maschine1","machine2.html":"Maschine2","machine3.html":"Maschine3","machine4.html":"Maschine4","machine5.html":"Maschine5"};
    const k=Object.keys(m).find(x=>p.includes(x));
    return k?m[k]:null;
  }
  const NAME=currentMachineName();
  const el=document.getElementById("liveChart");
  if(!NAME||!el)return;

  function isDark(){return document.body.classList.contains("light-gray-mode");}

  const chart=new ApexCharts(el,{
    chart:{type:"line",height:260,animations:{enabled:true,dynamicAnimation:{speed:1000}},toolbar:{show:false},zoom:{enabled:false},background:"transparent",foreColor:isDark()?"#eee":"#333"},
    theme:{mode:isDark()?"dark":"light"},
    stroke:{width:2,curve:"smooth"},
    xaxis:{type:"datetime",range:5*60*1000,labels:{datetimeUTC:false}},
    yaxis:[
      {min:0,max:100,title:{text:"%"}},
      {opposite:true,min:0,title:{text:"m/s"}}
    ],
    series:[
      {name:"Leistung (%)",data:[]},
      {name:"Geschwindigkeit (m/s)",data:[]}
    ],
    legend:{position:"top"},
    tooltip:{shared:true,x:{format:"HH:mm:ss"}},
    noData:{text:"Keine Daten"}
  });
  await chart.render();

  async function loadHistory(){
    const r1=fetch(`${API_BASE}/api/machines/${NAME}/metrics/aktuelleLeistung?limit=500`);
    const r2=fetch(`${API_BASE}/api/machines/${NAME}/metrics/geschwindigkeit?limit=500`);
    const [a,b]=await Promise.all([r1,r2]);
    if(!a.ok||!b.ok)return;
    const [da,db]=await Promise.all([a.json(),b.json()]);
    const s1=da.map(p=>[new Date(p.createdAt).getTime(),Number(p.value)||0]);
    const s2=db.map(p=>[new Date(p.createdAt).getTime(),Number(p.value)||0]);
    chart.updateSeries([{name:"Leistung (%)",data:s1},{name:"Geschwindigkeit (m/s)",data:s2}],false);
  }
  await loadHistory();

  const sock=typeof io!=="undefined"?io(API_BASE,{transports:["websocket"]}):null;
  if(sock){
    sock.on("telemetry",(msg)=>{
      if(msg.name!==NAME)return;
      const t=new Date(msg.timestamp||Date.now()).getTime();
      chart.appendData([{data:[[t,Number(msg.aktuelleLeistung||0)]]},{data:[[t,Number(msg.geschwindigkeit||0)]]}]);
    });
  }

  // Live Timeline - bewegt sich jede Sekunde nach rechts
  setInterval(()=>{
    const now=Date.now();
    chart.updateOptions({
      xaxis:{
        min:now-5*60*1000, // 5 Minuten Fenster
        max:now
      }
    },false,false);
  },1000);

  const btn=document.getElementById("modie-button");
  function applyTheme(){chart.updateOptions({theme:{mode:isDark()?"dark":"light"},chart:{foreColor:isDark()?"#eee":"#333"}},false,false);}
  if(btn)btn.addEventListener("click",()=>setTimeout(applyTheme,0));
});
