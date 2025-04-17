function showToast(message, goodness = true) {
    let backgroundColorS = ""
    
    if (goodness) {
        backgroundColorS = "#4CAF50"
    } else {
        backgroundColorS = "#DD2220"
    }
    Toastify({
        text: message,
        duration: 3000,
        gravity: "bottom",
        position: "right",
        backgroundColor: backgroundColorS,
        stopOnFocus: true
    }).showToast();
}