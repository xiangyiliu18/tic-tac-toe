$(document).ready(function () {
  $("#signupForm").submit(function (event) {
    event.preventDefault();
    $.ajax({
      type: "POST",
      url: "/users/addUser",
      dataType: "json",
      data: JSON.stringify({
        username: $("#username").val(),
        email: $("#email").val(),
        password: $("#password").val(),
      }),
      contentType: "application/json",
      success: (res) => {
        if (res.status === "OK") {
          window.location.href = `${window.location.origin}/users/verify`;
        }
        if (res.status === "ERROR") {
          alert(res.error);
        }
      },
      error: (err) => {
        console.error(`Server Error: ${JSON.stringify(err)}`);
      },
      complete: () => {
        this.reset();
      },
    });
  });
});
