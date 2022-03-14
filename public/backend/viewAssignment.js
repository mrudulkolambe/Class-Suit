let header = document.getElementById('header');
header.innerHTML = window.localStorage.getItem("className")
document.title = window.localStorage.getItem("className")