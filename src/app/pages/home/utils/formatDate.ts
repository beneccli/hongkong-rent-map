const monthNames = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"
];

const dayOfWeekNames = [
  "Sunday", "Monday", "Tuesday",
  "Wednesday", "Thursday", "Friday", "Saturday"
];

const formatDate = (date: Date, patternStr: string) => {
    if (!patternStr) {
        patternStr = 'M/d/yyyy';
    }

    const day = date.getDate(),
        month = date.getMonth(),
        year = date.getFullYear(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        miliseconds = date.getMilliseconds(),
        h = hour % 12,
        hh = twoDigitPad(h),
        HH = twoDigitPad(hour),
        mm = twoDigitPad(minute),
        ss = twoDigitPad(second),
        aaa = hour < 12 ? 'AM' : 'PM',
        EEEE = dayOfWeekNames[date.getDay()],
        EEE = EEEE.substr(0, 3),
        dd = twoDigitPad(day),
        M = month + 1,
        MM = twoDigitPad(M),
        MMMM = monthNames[month],
        MMM = MMMM.substr(0, 3),
        yyyy = year + "",
        yy = yyyy.substr(2, 2)
    ;
    // checks to see if month name will be used
    patternStr = patternStr
      .replace('hh', hh).replace('h', h.toString())
      .replace('HH', HH).replace('H', hour.toString())
      .replace('mm', mm).replace('m', minute.toString())
      .replace('ss', ss).replace('s', second.toString())
      .replace('S', miliseconds.toString())
      .replace('dd', dd).replace('d', day.toString())

      .replace('EEEE', EEEE).replace('EEE', EEE)
      .replace('yyyy', yyyy)
      .replace('yy', yy)
      .replace('aaa', aaa);
    if (patternStr.indexOf('MMM') > -1) {
        patternStr = patternStr
          .replace('MMMM', MMMM)
          .replace('MMM', MMM);
    }
    else {
        patternStr = patternStr
          .replace('MM', MM)
          .replace('M', M.toString());
    }
    return patternStr;
}

function twoDigitPad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}

export { formatDate };
