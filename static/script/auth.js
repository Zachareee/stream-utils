{
  const xhr = new XMLHttpRequest()

  xhr.onload = () => {
    const response = JSON.parse(xhr.response)
    const { state, auth } = response
    const link = document.getElementById("link")
    link.setAttribute("href", link.getAttribute("href") + state)
    document.getElementById("auth").innerHTML = auth ? "Authorisation successful" : "Login again"
  }
  
  xhr.open("GET", "state")
  xhr.send()
}