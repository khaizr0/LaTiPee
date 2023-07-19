function Login(e)
{
    event.preventDefault();
    var username = document.getElementById("username");
    var user = {
        username : username
    } 
    var json = JSON.stringify(user);
    localStorage.getItem(username,json);
    alert('thành công');
}