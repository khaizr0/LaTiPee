const userApi = 'http://localhost:3000/user';

//Login
//lấy data từ front và getUser từ json
const btnLogin = document.querySelector(".btn.solid");

const getUser = async () => {
    const res = await fetch(userApi);
    const data = await res.json();
    return data;
};
//tạo event và đối chiếu data để thực hiện login
btnLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const userLogin = document.querySelector("#userLogin").value;
    const passLogin = document.querySelector("#passLogin").value;
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
const signUpForm = document.querySelector(".sign-up-form");

const createUser = async (user) => {
  const response = await fetch(userApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  });

  return response.json();
};

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.querySelector("#username").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    const newUser = {
        userName: username,
        userEmail: email,
        passWord: password
    };

    try {
        const allUsers = await getUser();
        const checkUser = allUsers.find((user) => user.userName == username || user.userEmail == email);
    if (checkUser) {
        alert("Tên đăng nhập hoặc email đã tồn tại. Vui lòng chọn tên đăng nhập và email khác!");
    } 
    else {
        const createdUser = await createUser(newUser);
        alert("Đăng kí thành công!");
        window.location.href = "index.html";
    }
    } 
    catch (error) {
    console.error("Lỗi khi đăng kí:", error);
    alert("Đăng kí không thành công!");
  }
});




