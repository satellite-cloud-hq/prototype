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
    campaign_id: String,
    campaign_start_timestamp_ms: u64,
    client: Arc<Client>,
}

impl StoreToInfluxDBHook {
    pub fn new(campaign_id: impl Into<String>, campaign_start_timestamp_ms: u64) -> Self {
        Self { 
            campaign_id: campaign_id.into(), 
            campaign_start_timestamp_ms,
            client: Arc::new(Client::new(LOGDB_URL, LOGDB_ORG, LOGDB_TOKEN)), 
        }
    }
}

#[async_trait]
impl Hook<Arc<Tmiv>> for StoreToInfluxDBHook {
    type Output = Arc<Tmiv>;

    async fn hook(&mut self, tmiv: Arc<Tmiv>) -> Result<Self::Output> {
        // println!("Stored TMIV: {} {:?}", tmiv.name, tmiv.timestamp);

        // println!("Writing TMIV to InfluxDB: {}", tmiv.name);

        let mut builder = influxdb2::models::DataPoint::builder(&self.campaign_id)
            .tag("name", &tmiv.name);

        let mut timestamp = None;

        for field in &tmiv.fields {
            if field.name.ends_with("@RAW") { continue };

            if field.name == "SH.TI" {
                match &field.value {
                    Some(Value::Integer(i)) => {
                        timestamp = Some(*i);
                    }
                    _ => {
                        println!("field {} has invalid value type", field.name);
                    }
                }
            }

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

        if let Some(ms) = timestamp {
            builder = builder.timestamp(ms + self.campaign_start_timestamp_ms as i64);

            let points = vec![builder.build()?];
            self.client.write_with_precision(
                "telemetry", stream::iter(points), TimestampPrecision::Milliseconds).await?;
        }
        else {
            println!("field SH.TI not found in TMIV {}", tmiv.name);
        }
        Ok(tmiv)
    }
}
