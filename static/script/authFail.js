{
  const xhr = new XMLHttpRequest()

  xhr.onload = () => {
    console.log("Gotted")
    const details = xhr.responseText
    document.getElementById("error").innerHTML = details
  }

  xhr.open("GET", "../error")
  xhr.send()
  console.log("Sent")
}