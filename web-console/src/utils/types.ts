type simulationType = {
  id: string;
  running: boolean;
  start_date_time: string;
  end_date_time: string;
};
type satellitesType = {
  id: string;
  name: string;
  orbit: orbitType;
};
type orbitType = {
  epoch: string;
  inclination: number;
  raan: number;
  eccentricity: number;
  argument_of_perigee: number;
  mean_anomaly: number;
  mean_motion: number;
};

export type { simulationType, satellitesType, orbitType };
