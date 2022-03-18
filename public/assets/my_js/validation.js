//Valide if true
function validate_true(validate){
    var ligne = document.getElementById(validate);
    sendRequest_true('/validate',validate,ligne);
}
var reason = document.getElementById("reason");
var rejected = document.getElementById("rejected");
var denie ="";
var mcode = "";
var task = "";
//Denied if false
function validate_false(denied,m_code,task){
    reason.style.display = "block";
    denie = denied;
    mcode = m_code;
    task = task;
}
function sendclick(){
    sendRequest_false('/denied',denie,mcode,rejected.value,task);
}

function sendRequest_true(url,id,ligne) {
    var http = new XMLHttpRequest();
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
          ligne.remove();
      }
    };
    http.send("id="+id);
  }
  function sendRequest_false(url,id,mcode,message,task) {
    var http = new XMLHttpRequest();
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        reason.style.display = "none";
        document.getElementById(id).remove();
      }
    };
    http.send("id="+id+"&m_code="+mcode+"&task="+task+"&message="+message);
  }