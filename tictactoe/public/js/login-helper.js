$(document).ready(function () {
  $("#loginForm").submit(function (event) {
    event.preventDefault();
    $.ajax({
      type: "POST",
      url: "/login",
      dataType: "json",
      data: JSON.stringify({
        email: $("#email").val(),
        password: $("#password").val(),
      }),
      contentType: "application/json",
      success: (res) => {
        if (res.status === "OK") {
          window.location.href = `${window.location.origin}/games`;
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
