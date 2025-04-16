export default function coeToTle({
  id,
  name,
  epoch,
  inclination,
  raan,
  eccentricity,
  argOfPerigee,
  meanAnomaly,
  meanMotion,
}) {
  //     const epochFixed = epoch.toFixed(4).replace(/\./g, "");
  //     const epochYear = Math.floor(epochFixed / 1000);
  //     const epochDay = (epochFixed % 1000).toString().padStart(3, "0");
  //     const epochTime = (epochFixed % 1).toFixed(8).substring(2, 10);
  //     const epochYearStr = epochYear.toString().padStart(2, "0");
  //     const epochDayStr = epochDay.toString().padStart(3, "0");
  //     const epochTimeStr = epochTime.toString().padStart(8, "0");
  //     const epochStr = `${epochYearStr}${epochDayStr} ${epochTimeStr}`;
  //   const tleLine1 = `1 ${id}U 00000A   ${epoch} .00000000  0-0-0  0-0-0 0    00`;
  //   const tleLine2 = `2 ${id} ${inclination.toFixed(4)} ${raan.toFixed(
  //     4
  //   )} ${eccentricity.toFixed(7)} ${argOfPerigee.toFixed(
  //     4
  //   )} ${meanAnomaly.toFixed(4)} ${meanMotion.toFixed(8)}`;
  const tleLine1 =
      "1 25544U 98067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927",
    tleLine2 =
      "  2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537";

  return [tleLine1, tleLine2];
}
