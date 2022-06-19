export function getDate() {
    const today = new Date();

    let minutes = String(today.getMinutes())
    let hours = String(today.getHours())
    let day = String(today.getDate())
    let month = String(today.getMonth()+1) // index start at 0
    
    
    if (minutes < 10) {
        minutes = "0" + minutes
    }
    if (day < 10) {
        day = "0" + day
    }
    if (month < 10) {
        month = "0" + month
    }
    if (hours < 10) {
        hours = "0" + hours
    }
    const date = today.getFullYear() + '/' + month + '/' + day + ' ' + hours + ':' + minutes; 
    return date   
}   