// import axios from 'axios'

// const instance = axios.create({
//   baseURL: 'https://some-domain.com/api/',
//   timeout: 1000
// })

const instance = function (requestConfig) {
  const {params: {query}} = requestConfig
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('调用接口');
      let arr = [
        'Alabama',
        'Alaska',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Delaware',
        'Florida',
        'Georgia',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Pennsylvania',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Utah',
        'Vermont',
        'Virginia',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming'
      ].map((item) => {
        return {
          label: item,
          value: item + '_value'
        }
      })
      if(query) arr = arr.filter(item => {
        return item.label.includes(query)
      })
      resolve({ data: arr })
    }, 1000)
  })
}
export default instance
