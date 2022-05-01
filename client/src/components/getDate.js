export function getDate() {
    const today = new Date();

    let minutes = String(today.getMinutes())
    let day = String(today.getDate())
    let month = String(today.getMonth())
    if (minutes < 10) {
        minutes = "0" + minutes
    }
    if (day < 10) {
        day = "0" + day
    }
    if (month < 10) {
        month = "0" + month
    }
    const date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() + ' ' + today.getHours() + ':' + minutes; 
    return date   
}   