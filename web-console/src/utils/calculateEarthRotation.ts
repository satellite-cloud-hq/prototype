// This function calculates the Earth's rotation angle based on a given timestamp.
// Returns the angle in radians
export const calculateEarthRotation = (timestamp: string) => {
  const date = new Date(timestamp);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  console.log("hours: ", hours, "minutes: ", minutes, "seconds: ", seconds);

  const timeOfDay = (hours + minutes / 60 + seconds / 3600) / 24;
  return timeOfDay * 2 * Math.PI;
};
