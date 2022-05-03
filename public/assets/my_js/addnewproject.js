var newproject = document.getElementById('addproject');
var btnaddp = document.getElementById("add_project");
var btnupp = document.getElementById("btnupp");
var project_done = false;
var parent_done = true;
var upproject_done = false;
var upparent_done = true;
var updateproject = document.getElementById("updateproject");
var opt = "";

function newproject_listen(){
  btnaddp.disabled = true;
    newproject.style.display = "block";
}
function upp(){
  btnupp.disabled = true;
  updateproject.style.display = "block";
}

function cancel(){
    newproject.style.display = "none";
}
function cancelupdate(){
  updateproject.style.display = "none";
}
function updateprojects(){
    sendRequest_updateproject("/updateproject",document.getElementById("allproject").value,document.getElementById("parentupdate").value,opt);
}
function add_new_project(){
    var projectp = document.getElementById("newproject").value;
    var status = document.getElementById("parent").value;
    sendRequest_project('/addproject',projectp,status);
}

function project(){
    if (document.getElementById("newproject").value==""){
        project_done = false;
    }
    else{
      project_done = true;
    }
    verify_p();
}

function checking(){
  if (document.getElementById("sub").checked == true){
      document.getElementById("par").style.display = "block";
      btnaddp.disabled = true;
      parent_done = false;
      verify_p();
  }
  else{
    document.getElementById("par").style.display = "none";
    parent_done = true;
    verify_p();
  }
}
function select(){
  if (document.getElementById("parent").value == ""){
     btnaddp.disabled = true;
     parent_done = false;
  }
  else{
    btnaddp.disabled = false;
    parent_done = true;
  }
  verify_p();
}
function getpr(){
  if (document.getElementById("allproject").value == ""){
    btnupp.disabled = true;
    upproject_done = false;
  }
  else{
    btnupp.disabled = false;
    upproject_done = true;
  }
  verify_up();
}
function checkingsub(){
  document.getElementById("asparent").checked = false;
      if (document.getElementById("subupdate").checked == true){
        document.getElementById("parup").style.display = "block";
        btnupp.disabled = true;
        upparent_done = false;
        verify_up();
        opt = "sub";
    }
    else{
      document.getElementById("parup").style.display = "none";
      upparent_done = true;
      verify_up();
      opt = "";
    }
}

function checkingparent(){
  document.getElementById("subupdate").checked = false;
  if (document.getElementById("asparent").checked == true){
    document.getElementById("parup").style.display = "none";
    btnupp.disabled = false;
    upparent_done = false;
    opt = "par";
}
else{
  opt = "";
}
}
function selectup(){
  if (document.getElementById("parentupdate").value == ""){
      btnupp.disabled = true;
      upparent_done = false;
  }
  else{
    btnupp.disabled = true;
    upparent_done = true;
  }
  verify_up();
}

function verify_p(){
    if (project_done && parent_done){
      btnaddp.disabled = false;
    }
    else{
      btnaddp.disabled = true;
    }
}
function verify_up(){
  if (upproject_done && upparent_done){
    btnupp.disabled = false;
  }
  else{
    btnupp.disabled = true;
  }
}
function sendRequest_project(url, projetp,parent) {
  var http = new XMLHttpRequest();
  http.open("POST", url, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      newproject.style.display = "none";
      if (this.responseText.includes("already")){
        document.getElementById("notif").setAttribute('style','background-color:red');
        document.getElementById("newproject").value = "";
      }
      showNotif(this.responseText);
    }
  };
  http.send("projet=" + projetp + "&parent="+parent);
}
function showNotif(text) {
  const notif = document.querySelector('.notification');
  notif.innerHTML = text;
  notif.style.display = 'block';
  setTimeout(() => {
      notif.style.display = 'none';
      window.location = "/about";
  }, 2000);
}
function sendRequest_updateproject(url, uppv,upparv,option) {
  var http = new XMLHttpRequest();
  http.open("POST", url, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      newproject.style.display = "none";
      if (this.responseText.includes("already")){
        document.getElementById("notif").setAttribute('style','background-color:red');
        document.getElementById("newproject").value = "";
      }
      showNotif(this.responseText);
    }
  };
  http.send("projet=" + uppv + "&parent="+upparv+"&option="+option);
}
function showNotif(text) {
  const notif = document.querySelector('.notification');
  notif.innerHTML = text;
  notif.style.display = 'block';
  setTimeout(() => {
      notif.style.display = 'none';
      window.location = "/about";
  }, 2000);
}
