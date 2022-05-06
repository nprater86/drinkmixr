let registrationForm = document.getElementById('registration');
let loginForm = document.getElementById('login');
let flashMessages = document.getElementById('registrationErrors');

registrationForm.onsubmit = function(e){
    e.preventDefault();

    // create FormData object from javascript and send it through a fetch post request.
    var form = new FormData(registrationForm);
    // this how we set up a post request and send the form data.
    fetch(`http://${address}/reg_login`, { method :'POST', body : form})
        .then( response => response.json() )
        .then( data => {
            if (data.url){
                window.location = data.url;
            } else {
                clearErrors();
                document.getElementById('fnameError').innerHTML = data.first_name;
                document.getElementById('lnameError').innerHTML = data.last_name;
                document.getElementById('emailError').innerHTML = data.email;
                document.getElementById('usernameError').innerHTML = data.user_name;
                document.getElementById('passwordError').innerHTML = data.password;
                document.getElementById('birthdayError').innerHTML = data.age;
            }
        })

}

loginForm.onsubmit = function(){
    e.preventDefault();

    // create FormData object from javascript and send it through a fetch post request.
    var form = new FormData(loginForm);
    // this how we set up a post request and send the form data.
    fetch(`http://${address}/reg_login`, { method :'POST', body : form})
        .then( response => response.json() )
        .then( data => {
            if (data.url){
                window.location = data.url;
            } else {
                clearErrors();
                document.getElementById('loginError').innerHTML = data.error;
            }
            
        })
}

function clearErrors() {
    document.getElementById('fnameError').innerHTML = '';
    document.getElementById('lnameError').innerHTML = '';
    document.getElementById('emailError').innerHTML = '';
    document.getElementById('usernameError').innerHTML = '';
    document.getElementById('passwordError').innerHTML = '';
    document.getElementById('loginError').innerHTML = '';
    document.getElementById('birthdayError').innerHTML = '';
}

//toggle register and login form
let toggleLogin = document.getElementById("toggleLogin");
let toggleRegister = document.getElementById("toggleRegister");
let registerDisplay = document.getElementById("registerDisplay");
let loginDisplay = document.getElementById("loginDisplay");


toggleRegister.onclick = (event) => {
    event.preventDefault();
    registerDisplay.style.display = "flex";
    loginDisplay.style.display = "none";
}

toggleLogin.onclick = (event) => {
    event.preventDefault();
    registerDisplay.style.display = "none";
    loginDisplay.style.display = "flex";
}