const userApi = 'http://localhost:3000/user';

//Login
//lấy data từ front và getUser từ json
var btnLogin = document.querySelector(".btn.solid");

var getUser = async () => {
    const res = await fetch(userApi);
    const data = await res.json();
    return data;
};
//tạo event và đối chiếu data để thực hiện login
btnLogin.addEventListener('click', (e) => {
    e.preventDefault();
    var userLogin = document.querySelector("#userLogin").value;
    var passLogin = document.querySelector("#passLogin").value;
    getUser().then((data) => {const user = data.find((user) => user.userName == userLogin && user.passWord == passLogin);
    if (user) {
        alert("Đăng nhập thành công");
        window.location.href = "index.html";
    } else {
        alert("Đăng nhập không thành công");
    }
  });
});


//signUp
var signUpForm = document.querySelector("#btn-signup");

var createUser = async (user) => {
  var response = await fetch(userApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  });

  return response.json();
};

signUpForm.addEventListener('click', async (e) => {
    e.preventDefault();
    var username = document.querySelector("#userSignUp").value;
    var email = document.querySelector("#emailSignUp").value;
    var password = document.querySelector("#passSignUp").value;

    var newUser = {
        userName: username,
        userEmail: email,
        passWord: password
    };

    try {
        var allUsers = await getUser();
        var checkUser = allUsers.find((user) => user.userName == username || user.userEmail == email);
    if (checkUser) {
        alert("Tên đăng nhập hoặc email đã tồn tại. Vui lòng chọn tên đăng nhập và email khác!");
    } 
    else {
        var createdUser = await createUser(newUser);
        alert("Đăng kí thành công!");
    }
    } 
    catch (error) {
    console.error("Lỗi khi đăng kí:", error);
    alert("Đăng kí không thành công!");
  }
});