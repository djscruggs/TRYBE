//helper  function that converts booleans, integers and dates from strings to the proper type
export function convertStringValues(obj: any): any {
  const result: any = {};
  for (const key in obj) {
    if (obj[key] === 'true' || obj[key] === 'false') {
      result[key] = obj[key] === 'true';
    } else if (!isNaN(obj[key])) {
      result[key] = parseInt(obj[key]);
    } else if (!isNaN(Date.parse(obj[key]))) {
      result[key] = new Date(obj[key]).toISOString()
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}
