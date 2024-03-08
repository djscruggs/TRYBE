import React from 'react'
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

export function colorToClassName(color: string, defaultColor:string): string {
  if(!color) return defaultColor
  const lower = color.toLowerCase()
  const colorMap: { [key: string]: string } = {
    "red": "red",
    "orange": "orange-500",
    "yellow": "yellow",
    "green": "green-500",
    "blue": "blue",
    "pink": "pink-300",
    "purple": "purple-400",
  }
  return colorMap[lower]
}
export function textColorFromContainer(containerColor: string, defaultColor:string): string {
  if(!containerColor) return defaultColor
  const containerColorLower = containerColor.toLowerCase()
  if (containerColorLower === 'red' || containerColorLower === 'purple') {
    return 'white'
  } else {
    return 'black'
  }
}

export function convertlineTextToHtml(text: string): React.ReactNode {
  return (
    <div>
      {text.split('\n').map((line: string, index: number) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </div>
  );
}