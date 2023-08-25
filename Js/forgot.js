const userApi = 'http://localhost:3000/user';
//add nodemailer
const nodemailer = require('nodemailer');



var btnforgot = document.querySelector(".btn.solid");

//take email info from front and getUser from json
var getUser = async () => {
    const res = await fetch(userApi);
    const data = await res.json();
    return data;
};

//create event and compare data to perform check
btnforgot.addEventListener('click', async (e) => {
    e.preventDefault();
    var email = document.querySelector("#emailuser").value;

    try {
        var allUsers = await getUser();
        var checkUser = allUsers.find((user) => user.userEmail == email);
    if (checkUser) {
        alert("email tồn tại");

    } 
    else {
        alert("Email không tồn tại! vui lòng nhập lại email hoặc đăng kí");
    }
    } 
    catch (error) {
    console.error("Lỗi khi đăng kí:", error);
    alert("Đăng kí không thành công!");
  }
});

//create 6 digit random number
function random6digit() {
    var randomnumber = Math.floor(Math.random() * 1000000);
    return randomnumber;
}
