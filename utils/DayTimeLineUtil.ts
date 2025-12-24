// Day Time Line Utility Functions
export function timeToAngle(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return ((hours * 60 + minutes) / (24 * 60)) * 360;
}

export function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = {
    x: x + radius * Math.cos((Math.PI / 180) * (startAngle - 90)),
    y: y + radius * Math.sin((Math.PI / 180) * (startAngle - 90)),
  };
  const end = {
    x: x + radius * Math.cos((Math.PI / 180) * (endAngle - 90)),
    y: y + radius * Math.sin((Math.PI / 180) * (endAngle - 90)),
  };
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}
