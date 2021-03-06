
export const getChatTimeText = (time, yesterdayText) => {
    var date = new Date(time)
    var now = new Date()
    var aDay = 60 * 60 * 24 * 1000
    
    var yesterday = now.getTime() - aDay
    var yesbiday = now.getTime() - ( aDay * 2)
    if(date.getTime() > yesterday) {
      return `${date.getHours()}:${date.getMinutes()}`
  
    } else if(date.getTime() <= yesterday && date.getTime() > yesbiday) {
      return yesterdayText
  
    } else {
      return `${date.getDay()}/${date.getMonth() + 1}/${String(date.getFullYear()).substring(2)}`
    }
}