function togglePassword() {
    const Input = document.getElementById("password");
    if(Input.type==="password"){
      Input.type="text";
    }else{
      Input.type="password"
    }
  }
  