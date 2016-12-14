import moment from 'moment'

// Build relative dates object based on today's date
const getDates = () => {
  const format = 'YYYY-MM-DD'
  const today = moment().format(format)
  const yesterday = moment().subtract(1, 'days').format(format)
  const L7DStart = moment().subtract(7, 'days').format(format)
  const LWEnd = moment().subtract(moment().day() + 1, 'days').format(format)
  const LWStart = moment(LWEnd).subtract(6, 'days').format(format)
  const L30DStart = moment(yesterday).subtract(29, 'days').format(format)
  const LMEnd = moment().subtract(moment().date(), 'days').format(format)
  const LMStart = moment(LMEnd).subtract(moment(LMEnd).date() - 1, 'days').format(format)
  const CurMonStart = moment().startOf('month').format(format)
  const CurYearStart = moment().startOf('year').format(format)
  const LYStart = moment().startOf('year').subtract(1, 'years').format(format)
  const LYEnd = moment().startOf('year').subtract(1, 'days').format(format)

  return {
    'today': {
      'start': today,
      'end': today
    },
    'yesterday': {
      'start': yesterday,
      'end': yesterday
    },
    'last7Days': {
      'start': L7DStart,
      'end': yesterday
    },
    'lastWeek': {
      'start': LWStart,
      'end': LWEnd
    },
    'last30Days': {
      'start': L30DStart,
      'end': yesterday
    },
    'lastMonth': {
      'start': LMStart,
      'end': LMEnd
    },
    'monthToDate': {
      'start': CurMonStart,
      'end': yesterday
    },
    'yearToDate': {
      'start': CurYearStart,
      'end': yesterday
    },
    'lastYear': {
      'start': LYStart,
      'end': LYEnd
    }
  }
}

// When a pre-defined date is selected, populate startDatePicker and endDatePicker
const setDates = preDefValue => {
  if (preDefValue !== 'custom') {
    const date = getDates()

    switch (preDefValue) {
      case 'today':
        return date.today
      case 'yesterday':
        return date.yesterday
      case 'last7Days':
        return date.last7Days
      case 'lastWeek':
        return date.lastWeek
      case 'last30Days':
        return date.last30Days
      case 'lastMonth':
        return date.lastMonth
      case 'monthToDate':
        return date.monthToDate
      case 'yearToDate':
        return date.yearToDate
      case 'lastYear':
        return date.lastYear
      default:
        break
    }
  }
}

export { getDates, setDates }
