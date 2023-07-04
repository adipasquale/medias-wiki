const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    )
    return result
  }, {})
}

const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])

const indexBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    result[currentValue[key]] = currentValue
    return result
  }, {})
}

const uniqueBy = (array, key) => {
  return array.reduce((newArray, currentValue) => {
    if (!newArray.some(item => item[key] === currentValue[key]))
      newArray.push(currentValue)
    return newArray
  }, []);
}

module.exports = { groupBy, flatten, indexBy, uniqueBy }
