export function getDate() {
    const today = new Date();

    let minutes = String(today.getMinutes())
    if (minutes < 10) {
        minutes = "0" + minutes
    }
    const date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() + ' ' + today.getHours() + ':' + minutes; 
    return date   
}   