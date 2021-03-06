/**
 * Created by bennylam on 2017-01-24.
 */

window.onload = function start() {
    //Choose what view to be seen when loading page
    if (localStorage.getItem("token") === null) {
        welcomeView();
    } else {
        //connectSocket();
        loggedInPage();
    }
};

function loggedInPage() {
    profileView();

    //Save the url of state when signed in
    var savedPageStateURL = window.location.pathname;

    // Adds elements with classname tablinks to an array
    let boxes = Array.from(document.getElementsByClassName("tablinks"));
    // Add an eventlistener and history entry for each element with "tablinks"-tag
    boxes.forEach(b => {
        let id = b.id;
        b.addEventListener('click', e => {
            console.log("how often does this happen");
            history.pushState({id}, null, `./${id}`);
            selectBox(id, boxes);
        });
    });

    window.addEventListener('popstate', e => {
        selectBox(e.state.id, boxes);
    });

    history.replaceState({id: null}, null, './');


    //Open Home tab as default
    document.getElementById("homebtn").click();


}

/* MAKE A CLICK TOO BUT DONT TRIGGER CLICK EVENT */
function selectBox(id, boxes) {
    boxes.forEach(b => {
        if (b.id === id) {
            console.log(`${b.id}`);
            switch (b.id) {
                case "homebtn":
                    console.log("HEMM");
                    home();
                    break;
                case "browsebtn":
                    console.log("SÖK");
                    browse();
                    break;
                case "accountbtn":
                    console.log("KONTO");
                    account();
                    break;
            }
        }
        b.classList.toggle('active', b.id === id);
    });
}

function profileView() {
    connectSocket();
    document.getElementById("view").innerHTML = document.getElementById("profileview").innerHTML;
    clearTab(event);
    //Profile view
    document.getElementById("homebtn").onclick = home;
    document.getElementById("browsebtn").onclick = browse;
    document.getElementById("accountbtn").onclick = account;


    //Logout
    document.getElementById("signoutbtn").onclick = logout;
}

function clearTab(evt) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    tablinks = document.getElementsByClassName("tablinks");

    //Gömmer alla divs
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    //Rensar klassen active
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    evt.currentTarget.className += " active";
}

function welcomeView() {
    document.getElementById("view").innerHTML = document.getElementById("welcomeview").innerHTML;

    //Login Form
    document.getElementById("loginForm").onsubmit = validateLoginForm;


    //Sign Up Form
    document.getElementById("password").oninput = validateSignUpPassword;
    document.getElementById("repassword").oninput = validatePasswords;
    document.getElementById("signupForm").onsubmit = validateSignUpForm;


}

function getUsers(a) {
    document.getElementById("demo").innerHTML = a;
}

function validateLoginForm() {
    var email = document.forms["loginForm"]["loginmail"].value;
    var password = document.forms["loginForm"]["loginpass"].value;
    var text;

    if (password.length < 6) {
        text = "Password is too short.";
        document.getElementById("error").innerHTML = text;
        return false;
    } else {
        signIn(email, password);
        return false;
    }
}

function validateSignUpForm() {
    if (!(validateSignUpPassword() && validatePasswords())) {
        return false;
    } else {
        signUp();
        return false;
    }
}

function validateSignUpPassword() {
    var x = document.getElementById("password").value;
    var text;

    if (x.length < 6) {
        text = "At least 6 characters please.";
        document.getElementById("password").style.borderColor = "#E34234";
        document.getElementById("short").innerHTML = text;
        document.getElementById("password").focus();
        return false;
    } else {
        text = "";
        validatePasswords();
        document.getElementById("password").style.borderColor = "initial";
        document.getElementById("short").innerHTML = text;
        return true;
    }
}

function validatePasswords() {
    var x = document.getElementById("password").value;
    var y = document.getElementById("repassword").value;
    var text;

    if (x == y) {
        text = "";
        document.getElementById("password").style.borderColor = "initial";
        document.getElementById("repassword").style.borderColor = "initial";
        document.getElementById("mismatch").innerHTML = text;
        return true;
    } else {
        text = "Both password must contain the same string.";
        document.getElementById("password").style.borderColor = "#E34234";
        document.getElementById("repassword").style.borderColor = "#E34234";
        document.getElementById("mismatch").innerHTML = text;
        return false;
    }
}

function signUp() {
    var user = {
        firstname: document.forms["signupForm"]["firstname"].value,
        familyname: document.forms["signupForm"]["familyname"].value,
        gender: document.forms["signupForm"]["gender"].value,
        city: document.forms["signupForm"]["city"].value,
        country: document.forms["signupForm"]["country"].value,
        email: document.forms["signupForm"]["email"].value,
        password: document.forms["signupForm"]["password"].value

    };

    var params = "firstname=" + user.firstname + "&familyname=" + user.familyname + "&gender=" + user.gender +
        "&city=" + user.city + "&country=" + user.country + "&email=" + user.email + "&password=" + user.password;

    xmlPOST("/sign-up", params, function (response) {
        localStorage.setItem("message", response.message);
        document.getElementById("result").innerHTML = localStorage.getItem("message");

        if (response.success) {
            document.forms["signupForm"].reset();
            return false;
        } else {
            return false;
        }
    });


}


function signIn(email, password) {
    var params = "email=" + email + "&password=" + password;
    xmlPOST("/sign-in", params, function (signIn) {
        if (signIn.success) {
            document.getElementById("error").innerHTML = signIn.message;
            localStorage.setItem("token", signIn.data);
            localStorage.setItem("email", email);
            loggedInPage();
        } else {
            document.getElementById("error").innerHTML = signIn.message;
        }
    });
}

function logout() {
    var params = "token=" + localStorage.getItem("token");
    xmlPOST("/sign-out", params, function () {
        welcomeView();
        history.pushState({id}, null, '/');
    });
    localStorage.removeItem("token");
    localStorage.removeItem("email");
}

function getUserDataByToken(response) {
    var token = localStorage.getItem("token");
    var user = JSON.parse(response.data)[0];

    document.getElementById("nameandgender").innerHTML = user.firstname + " " + user.familyname + ", " + user.gender;
    document.getElementById("email").innerHTML = user.email;
    document.getElementById("country").innerHTML = user.country;
    document.getElementById("city").innerHTML = user.city;


    document.getElementById("post").onclick = function () {
        var content = document.getElementById("message").value;
        if (content.length != 0) {
            var params = "message=" + content + "&token=" + token + "&toUser=" + user.email;
            xmlPOST("/post-message", params, function (post) {
                if (post.success) {
                    document.getElementById("message").value = null;
                    document.getElementById("message").setAttribute("placeholder", post.message);
                    //updateWall();
                }
            });
        }
    };
    updateWall();
    document.getElementById("update").onclick = updateWall;
}

function home() {
    id = document.getElementById("homebtn").id;
    //history.pushState({id}, null, `./`);

    var token = localStorage.getItem("token");
    clearTab(event);
    document.getElementById("home").style.display = "block";
    document.getElementById("message").setAttribute("maxlength", 256);
    characterCounter();
    document.getElementById("message").onkeyup = characterCounter;

    xmlGET('/get-user-data-by-token/' + token, getUserDataByToken);

}

function updateWall() {

    xmlGET("/get-user-messages-by-token/" + localStorage.getItem("token"), function (result) {
        document.getElementById("entries").innerText = "";
        //Det här tog tid att klura ut
        var data = JSON.parse(result.data);
        for (i = 0; i < data.length; i++) {
            meddelande = document.createElement('p');
            meddelande.setAttribute('draggable', true);
            meddelande.setAttribute('ondragstart', "drag(event)");
            meddelande.setAttribute('id', "post" + i);
            text = data[i].message + "<br>/" + data[i].fromUser;
            meddelande.innerHTML = text;
            document.getElementById("entries").appendChild(meddelande);
        }
        //document.getElementById("entries").innerHTML = text;
    });
}


function characterCounter() {
    var characters = document.getElementById("message").value.length;
    var maxlength = document.getElementById("message").getAttribute("maxlength");

    if (characters > maxlength) {
        return false;
    } else {
        text = maxlength - characters;
        document.getElementById("counter").innerHTML = "Remaining characters: " + text;
    }
}

function browse() {
    id = document.getElementById("accountbtn").id;
    //history.pushState({id}, null, `./${id}`);

    var token = localStorage.getItem("token");
    clearTab(event);
    document.getElementById("browse").style.display = "block";
    document.getElementById("messageB").setAttribute("maxlength", 256);
    document.getElementById("counterB").innerHTML = "Remaining characters: 256";
    document.getElementById("messageB").onkeyup = function () {
        var characters = document.getElementById("messageB").value.length;
        var maxlength = document.getElementById("messageB").getAttribute("maxlength");

        if (characters > maxlength) {
            return false;
        } else {
            text = maxlength - characters;
            document.getElementById("counterB").innerHTML = "Remaining characters: " + text;
        }
    };

    var findUser = document.getElementById("findUser");
    findUser.onclick = showUser;

}

function showUser() {
    var token = localStorage.getItem("token");
    var email = document.getElementById("browseUser").value;

    xmlGET("/get-user-data-by-email/" + token + "/" + email, getUserDataByEmail);
}

function getUserDataByEmail(response) {
    var token = localStorage.getItem("token");

    if (response.success) {
        localStorage.setItem("toEmail", document.getElementById("browseUser").value);
        var user = JSON.parse(response.data)[0];

        document.getElementById("nameandgenderB").innerHTML = user.firstname + " " + user.familyname + ", " + user.gender;
        document.getElementById("emailB").innerHTML = user.email;
        document.getElementById("countryB").innerHTML = user.country;
        document.getElementById("cityB").innerHTML = user.city;


        document.getElementById("postB").onclick = function () {
            var content = document.getElementById("messageB").value;
            if (content.length != 0) {
                var params = "message=" + content + "&token=" + token + "&toUser=" + user.email;
                xmlPOST("/post-message", params, function (post) {
                    if (post.success) {
                        document.getElementById("messageB").value = null;
                        document.getElementById("messageB").setAttribute("placeholder", post.message);
                    }
                });
            }
        };
        updateWallByEmail();
        document.getElementById("updateB").onclick = updateWallByEmail;


    } else {
        document.getElementById("nameandgenderB").innerHTML = response.message;
        document.getElementById("emailB").innerHTML = null;
        document.getElementById("countryB").innerHTML = null;
        document.getElementById("cityB").innerHTML = null;
        document.getElementById("messageB").value = null;
        localStorage.removeItem("toEmail");

    }
}

function updateWallByEmail() {
    xmlGET("/get-user-messages-by-email/" + localStorage.getItem("token") + "/" + localStorage.getItem("toEmail"), function (result) {
        var text = "";
        //Det här tog tid att klura ut jaoo
        var data = JSON.parse(result.data);
        for (i = 0; i < data.length; i++) {
            text += data[i].message;
            text += "<br>/" + data[i].fromUser + "<br><br>";
        }
        document.getElementById("entriesB").innerHTML = text;

    });

}

function account() {
    id = document.getElementById("accountbtn").id;
    //history.pushState({id}, null, `./${id}`);

    clearTab(event);
    document.getElementById("account").style.display = "block";
    document.getElementById("newpassword").style.display = "none";

    document.getElementById("changepassword").onclick = newPassword;
    document.getElementById("signout").onclick = logout;
    document.getElementById("short").innerHTML = null;

}

function newPassword() {
    document.getElementById("newpassword").style.display = "block";
    document.getElementById("save").onclick = save;

}

function save() {
    var oldpassword, newpassword, text;

    oldpassword = document.getElementById("oldpassword").value;
    newpassword = document.getElementById("password").value;

    if (oldpassword != null && newpassword != null && validateSignUpPassword() && validatePasswords()) {
        var params = "token=" + localStorage.getItem("token") + "&old_password=" + oldpassword + "&new_password=" + newpassword;
        xmlPOST("/change-password", params, function (changePassword) {

            text = changePassword.message;
            if (changePassword.success) {
                document.getElementById("oldpassword").value = null;
                document.getElementById("password").value = null;
                document.getElementById("repassword").value = null;
            }
            document.getElementById("short").innerHTML = text;
        });
    }
}


function xmlGET(url, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, true);

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback(JSON.parse(xhttp.responseText));
        }
    };
    xhttp.send();
}

function xmlPOST(url, params, callback) {
    var xhttp = new XMLHttpRequest();

    //console.log("Test: " + xhttp.statusText + " " + xhttp.status + params);

    xhttp.open("POST", url, true);

    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = function () {

        if (this.readyState == 4 && this.status == 200) {
            // console.log("Ready state 4: " + xhttp.statusText + " " + xhttp.responseText);
            // console.log("message: " + JSON.parse(xhttp.responseText).success);
            callback(JSON.parse(xhttp.responseText));
        }

    };
    xhttp.send(params);
}

function connectSocket() {
    var myWebSocket = new WebSocket("ws://localhost:5000/connect-socket");
    var token = localStorage.getItem("token");
    var email = localStorage.getItem("email");


    myWebSocket.onopen = function (evt) {
        alert("Connection open ...");
        myWebSocket.send(JSON.stringify({"token": token, "email": email}));
    };
    myWebSocket.onmessage = function (response) {
        if (response.success != true) {
            logout();
        }
    };
    myWebSocket.onclose = function (evt) {
        alert("Connection closed.");
        localStorage.clear();
    };
}


function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.innerText);
    console.log("event target id: " + ev.target.innerText);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    document.getElementById("message").value += data;
}


//Implementera detta senare om jag orkar
function patchWithJson(a, b) {
    var token = localStorage.getItem("token");
    var example = {"op": "replace", "path": "/token", "value": token};
    jsonpatch.min.apply_patch(a, b);
}