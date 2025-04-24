use std::sync::Arc;
use async_trait::async_trait;
use gaia_stub::tco_tmiv::Tmiv;
use gaia_tmtc::{Hook};
use anyhow::{Result};
use futures::stream;
use influxdb2::{Client};
use influxdb2::api::write::TimestampPrecision;
use gaia_tmtc::tco_tmiv::tmiv_field::Value;

const LOGDB_URL: &str = "http://log-db:8086/";
const LOGDB_ORG: &str = "satellite-cloud";
const LOGDB_TOKEN: &str = "admin-token";

#[derive(Clone)]
pub struct StoreToInfluxDBHook {
    simulation_id: String,
    client: Arc<Client>,
}

impl StoreToInfluxDBHook {
    pub fn new(simulation_id: impl Into<String>) -> Self {
        Self { 
            simulation_id: simulation_id.into(), 
            client: Arc::new(Client::new(LOGDB_URL, LOGDB_ORG, LOGDB_TOKEN)), 
        }
    }
}

#[async_trait]
impl Hook<Arc<Tmiv>> for StoreToInfluxDBHook {
    type Output = Arc<Tmiv>;

    async fn hook(&mut self, tmiv: Arc<Tmiv>) -> Result<Self::Output> {
        // let time = tmiv.timestamp.;
        // println!("Stored TMIV: {} {:?}", tmiv.name, tmiv.timestamp);

        if let Some(timestamp) = &tmiv.timestamp {
            // Timestamp::Nanoseconds((timestamp.seconds as u128) * 1_000_000_000 + timestamp.nanos as u128)
            //     .into_query(&self.simulation_id)
            //     .add_tag("name", &*tmiv.name);
            let mut builder = influxdb2::models::DataPoint::builder(&self.simulation_id)
                .timestamp(timestamp.seconds * 1000 + timestamp.nanos as i64 / 1_000_000 )
                .tag("name", &tmiv.name);

            for field in &tmiv.fields {
                if field.name.ends_with("@RAW") { continue };

                match &field.value {
                    Some(Value::String(s)) => {
                        builder = builder.field(&field.name, s.as_str());
                    }
                    Some(Value::Double(d)) => {
                        builder = builder.field(&field.name, *d);
                    }
                    Some(Value::Integer(i)) => {
                        builder = builder.field(&field.name, *i);
                    }
                    Some(Value::Enum(e)) => {
                        builder = builder.field(&field.name, e.as_str());
                    }
                    Some(Value::Bytes(_)) => {
                        println!("field {} has binary value which is not supported", field.name);
                    }
                    None => {
                        println!("field {} has no value set", field.name);
                    }
                }
            }

            let points = vec![builder.build()?];
            self.client.write_with_precision(
                "telemetry", stream::iter(points), TimestampPrecision::Milliseconds).await?;
        }


        Ok(tmiv)
    }
}
