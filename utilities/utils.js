const {
  format,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} = require("date-fns");
const User = require ("../model/userSchema");
const bcrypt = require ("bcrypt");

function handleError(res, status, title, error_message) {
  res.status(status).render("error/error.ejs", {
    title,
    error_message,
  });
}

function formatDate(date) {
  return format(date, "MMMM dd, y");
}

function dateDifferences(minuend, subtrahend) {
  return {
    seconds: differenceInSeconds (minuend, subtrahend),
    minutes: differenceInMinutes(minuend, subtrahend),
    hours: differenceInHours(minuend, subtrahend),
    days: differenceInDays(minuend, subtrahend),
    months: differenceInMonths(minuend, subtrahend),
    years: differenceInYears(minuend, subtrahend),
  };
}

function addDatesToSingleObj (data) {
  if (!data) return null;

  const createdAtFormatted = formatDate (data.createdAt);
  const updatedAtFormatted = formatDate (data.updatedAt);
  const createdAtDifferences = dateDifferences (new Date(), new Date (data.createdAt));
  const updatedAtDifferences = dateDifferences (new Date(), new Date (data.updatedAt));

  return {
    ...data._doc,
    createdAtFormatted,
    updatedAtFormatted,
    createdAtDifferences,
    updatedAtDifferences,
  }
}

function addDatesToArrayObj (arrayOfObj) {
  return arrayOfObj.map ((obj)=> {
    return addDatesToSingleObj (obj);
  })
}

function trimObjectValue (obj) {
  const trimmedObj = {};
  for (let prop in obj) {
    if (typeof obj [prop] === "string") {
      trimmedObj [prop] = obj[prop].trim()
    } else {
      trimmedObj [prop] = obj[prop];
    }
  }
  return trimmedObj;
}

async function hashPassword (password) {
  try {
    const salt = await bcrypt.genSalt (10);
    const hashedPassword = await bcrypt.hash (password, salt);
    return hashedPassword;
  } catch (error) {
    console.log ("There was an error:", error);
  }
}

async function compareHashedPassword (password, hashedpw) {
  try {
    if (await bcrypt.compare (password, hashedpw)) {
      return true
    } 
    return false;
  } catch (error) {
    console.log ("There was an error:", error);
  }
}

async function checkIfDataExist (data, property) {
  const query = {};
  query [property] = data;

  try {
    const user = await User.findOne (query);
    return !!user
  } catch (error) {
    console.log (error)
  }
}


module.exports = {
  handleError,
  formatDate,
  dateDifferences,
  addDatesToSingleObj,
  addDatesToArrayObj,
  trimObjectValue,
  hashPassword,
  compareHashedPassword,
  checkIfDataExist,
};
